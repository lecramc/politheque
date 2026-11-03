import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTheme, ThemeProviderCustom } from '@/components/ThemeContext';
import { ThemedDarkTheme, ThemedDefaultTheme } from '@/components/ThemedNavigationThemes';
import { initI18n } from '@/i18n';
import { GlobalEffects } from '@/src/core/screens/GlobalEffects';
import { store } from '@/src/core/store';

SplashScreen.preventAutoHideAsync();

function NavigationThemeWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <ThemeProvider value={isDark ? ThemedDarkTheme : ThemedDefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded && i18nReady) SplashScreen.hideAsync();
  }, [fontsLoaded, i18nReady]);

  if (!fontsLoaded || !i18nReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProviderCustom>
            <NavigationThemeWrapper>
              <GlobalEffects />
              <Stack screenOptions={{ headerShown: false }}></Stack>
            </NavigationThemeWrapper>
          </ThemeProviderCustom>
        </Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
