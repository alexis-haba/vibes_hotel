export default {
  expo: {
    name: "TheVibesMobile",
    slug: "thevibesmobile",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "thevibesmobile",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cah120.thevibes"
    },
    icon: "./assets/images/icon.png",
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.cah120.thevibes"
    },
    extra: {
      eas: {
        projectId: "7b3b741d-39df-4dca-bfaa-a0f211129dd9" // ID fourni par EAS
      }
    },
    plugins: [
      [
        "expo-font",
        {
          fonts: [
            "./node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf",
          ],
        },
      ],
    ],
  },
};
