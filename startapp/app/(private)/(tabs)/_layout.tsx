import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { strings } from '@/constants/Strings';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChatFAB } from '@/components/ChatFAB';
import { AuthGuard } from '@/components/AuthGuard';
import { ThemedText } from '@/components/ThemedText';
import { useSession } from '@/providers/SessionProvider';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const {session, signOut} = useSession();
  const text = useThemeColor({}, "text")

  return (
    <AuthGuard requireAuth={true}>
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>Olá, {session?.name}!</ThemedText>
        <MaterialIcons color={text} size={32} name="logout" onPress={signOut} />;


      </ThemedView>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              height: 84 + insets.bottom, // Altura da tab bar + safe area
              paddingBottom: insets.bottom + 8, // Safe area + espaçamento extra
              paddingTop: 12, // Espaçamento no topo para separar dos ícones
            },
            default: {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              height: 84 + insets.bottom,
              paddingBottom: insets.bottom + 8,
              paddingTop: 8,
            },
          }),
          tabBarItemStyle: {
            paddingVertical: 4, // Espaçamento vertical para cada item da tab
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4, // Espaço entre ícone e label
          },
          sceneStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: strings.navigation.home,
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            title: strings.navigation.new || "New",
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus" color={color} />,
          }}
        />
      </Tabs>
      <ChatFAB
        bottom={Platform.OS === 'ios' ? insets.bottom + 100 : 110}
        right={20}
      />
    </ThemedView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'left',
    fontSize: 28,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
});
