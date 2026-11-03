import { ExpoConfig, ConfigContext } from 'expo/config';

const pkg = require('./package.json') as { version: string };

const IS_DEV = process.env.APP_VARIANT === 'development';

interface EnvConfig {
  name: string;
  bundleId: string;
  androidPackage: string;
  scheme: string;
}

const ENV_CONFIG: Record<string, EnvConfig> = {
  development: {
    name: 'Travée (Dev)',
    bundleId: 'com.clarity.travee.dev',
    androidPackage: 'com.clarity.travee.dev',
    scheme: 'travee-dev',
  },
  production: {
    name: 'Travée',
    bundleId: 'com.clarity.travee',
    androidPackage: 'com.clarity.travee',
    scheme: 'travee',
  },
};

const getEnvConfig = (): EnvConfig => {
  if (IS_DEV) return ENV_CONFIG.development;
  return ENV_CONFIG.production;
};

export default ({ config }: ConfigContext): ExpoConfig & { newArchEnabled?: boolean } => {
  const envConfig = getEnvConfig();

  return {
    ...config,
    name: envConfig.name,
    slug: 'travee',
    version: pkg.version,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: envConfig.scheme,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: envConfig.bundleId,
      infoPlist: {
        CFBundleLocalizations: ['en', 'fr'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundColor: '#ffffff',
      },
      package: envConfig.androidPackage,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      '@react-native-community/datetimepicker',
      [
        'expo-localization',
        {
          supportedLocales: {
            ios: ['en', 'fr'],
            android: ['en', 'fr'],
          },
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: { image: './assets/images/splash-icon.png', backgroundColor: '#0f172a' },
        },
      ],
      'expo-system-ui',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      appVariant: IS_DEV ? 'development' : 'production',
    },
  };
};
