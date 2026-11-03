import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    __DEV__: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.{test,spec}.ts'],
    alias: {
      'react-native': new URL('./src/__mocks__/react-native.ts', import.meta.url).pathname,
      'expo-router': new URL('./src/__mocks__/empty.ts', import.meta.url).pathname,
      'expo-haptics': new URL('./src/__mocks__/empty.ts', import.meta.url).pathname,
      'expo-localization': new URL('./src/__mocks__/empty.ts', import.meta.url).pathname,
      '@react-native-async-storage/async-storage': new URL(
        './src/__mocks__/empty.ts',
        import.meta.url
      ).pathname,
      '@react-native-community/datetimepicker': new URL('./src/__mocks__/empty.ts', import.meta.url)
        .pathname,
    },
  },
});
