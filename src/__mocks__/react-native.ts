export const Platform = {
  OS: 'ios',
  select: (obj: Record<string, unknown>) => obj['ios'] ?? obj['default'],
};
export const NativeModules = {};
export const AppState = { addEventListener: () => ({ remove: () => {} }) };
