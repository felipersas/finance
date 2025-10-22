import "../global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedView } from "@/components/common";
import toastConfig from "@/config/ToastConfig";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";

import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider, useSession } from "@/providers/SessionProvider";
import { useEffect } from "react";
import { LogLevel, OneSignal } from "react-native-onesignal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { SplashScreenController } from "./splash";
import { PortalHost } from "@rn-primitives/portal";

function RootNavigator() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const tint = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync(backgroundColor);
    }
  }, [colorScheme, backgroundColor]);

  // Mostra loading enquanto verifica a sessão
  if (isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }

  return (
    <View className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#151718" : "#fff",
          },
        }}
      >
        <Stack.Protected guard={!!session}>
          <Stack.Screen
            name="(private)/(tabs)"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === "dark" ? "#151718" : "#fff",
              },
            }}
          />
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize OneSignal in useEffect to ensure it runs only once
  useEffect(() => {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    // Initialize with your OneSignal App ID
    OneSignal.initialize("4b694497-60fc-46fa-abf5-911e4db927ca");
    // Use this method to prompt for push notifications.
    // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    OneSignal.Notifications.requestPermission(true);

    // Add event listeners for notifications
    OneSignal.Notifications.addEventListener("click", (event) => {
      console.log("OneSignal: notification clicked:", event);
      // Navigate to alerts/reminders screen
      router.push("/alertas-lembretes");
    });

    OneSignal.Notifications.addEventListener(
      "foregroundWillDisplay",
      (event) => {
        console.log("OneSignal: notification will display:", event);
        // You can modify the notification here if needed
        // event.notification
      },
    );
  }, []); // Ensure this only runs once on app mount

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <SessionProvider>
        <SafeAreaProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <PortalHost />;
            <SplashScreenController />
            <GestureHandlerRootView>
              <RootNavigator />
              <Toast config={toastConfig} />
            </GestureHandlerRootView>
          </ThemeProvider>
        </SafeAreaProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
