import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';


import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryProvider } from '@/providers/QueryProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreenController } from './splash';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect } from 'react';

function RootNavigator() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const tint = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(backgroundColor);
    }
  }, [colorScheme, backgroundColor]);

  // Mostra loading enquanto verifica a sessão
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff'
          }
        }}
      >
        <Stack.Protected guard={!!session}>
          <Stack.Screen
            name="(private)/(tabs)"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff'
              }
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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <SessionProvider>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SplashScreenController />
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});