export default {
  expo: {
    name: "TheVibesMobile",
    slug: "thevibesmobile",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "thevibesmobile", // Ajoute cette ligne
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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    extra: {
      eas: {
        projectId: "your-project-id-here",
      },
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