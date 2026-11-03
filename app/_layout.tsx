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
import { useReducedMotion } from 'react-native-reanimated';
import { Provider } from 'react-redux';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { duration } from '@/components/motion';
import { useTheme, ThemeProviderCustom } from '@/components/ThemeContext';
import { ThemedDarkTheme, ThemedDefaultTheme } from '@/components/ThemedNavigationThemes';
import { initI18n } from '@/i18n';
import { GlobalEffects } from '@/src/core/screens/GlobalEffects';
import { store } from '@/src/core/store';

SplashScreen.preventAutoHideAsync();

/** Destinations de la barre d'onglets : on passe de l'une à l'autre en fondu, pas en poussée. */
const SECTION_ROUTES = [
  'index',
  'comprendre/index',
  'partis/index',
  'elections/index',
  'debats/index',
] as const;

/**
 * Transitions natives cohérentes : fondu entre rubriques, glissement pour entrer dans
 * un détail, montée pour le questionnaire (mode focus). Mouvement réduit : fondu partout.
 * Sur le web, l'entrée est portée par le contenu de Page (fondu + léger glissement).
 */
function AppStack() {
  const reduce = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reduce ? 'fade' : 'default',
        animationDuration: duration.page,
      }}
    >
      {SECTION_ROUTES.map((name) => (
        <Stack.Screen key={name} name={name} options={{ animation: 'fade' }} />
      ))}
      <Stack.Screen
        name="me-situer/index"
        options={{ animation: reduce ? 'fade' : 'fade_from_bottom' }}
      />
    </Stack>
  );
}

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
              <AppStack />
            </NavigationThemeWrapper>
          </ThemeProviderCustom>
        </Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
