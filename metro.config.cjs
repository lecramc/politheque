const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// PushNotificationIOS.js runs `new NativeEventEmitter(null)` at module level.
// In RN 0.83+ the native module is no longer linked by default, so this crashes
// when Expo's async-require evaluates all react-native getters at startup.
// We stub the module since expo-notifications handles push notifications instead.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.includes('PushNotificationIOS') &&
    !moduleName.includes('Native')
  ) {
    return { type: 'empty' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
