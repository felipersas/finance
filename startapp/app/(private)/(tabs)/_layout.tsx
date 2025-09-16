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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <AuthGuard requireAuth={true}>
    <View style={[
      styles.container,
      {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}>
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
    </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
