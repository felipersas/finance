import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthGuard } from '@/components/AuthGuard';
import { ChatFAB } from '@/components/ChatFAB';
import { Drawer } from '@/components/Drawer';
import { HapticTab } from '@/components/HapticTab';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { useSession } from '@/providers/SessionProvider';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useSession();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const drawerAnim = React.useRef(new Animated.Value(-280)).current;

  React.useEffect(() => {
    if (drawerOpen) {
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(drawerAnim, {
        toValue: -280,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerOpen]);

  return (
    <AuthGuard requireAuth={true}>
      <ThemedView style={[
        styles.container,
        {
          backgroundColor: Colors[theme].background,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      ]}>
        {/* Minimalist top bar with hamburger icon */}
        <View style={styles.topBarMinimal}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.hamburgerButton}>
            <Ionicons name="menu" size={28} color={Colors[theme].text} />
          </TouchableOpacity>
        </View>
        {/* Drawer component */}
        <Drawer
          open={drawerOpen}
          drawerAnim={drawerAnim}
          colorScheme={theme}
          session={session}
          signOut={signOut}
          onClose={() => setDrawerOpen(false)}
        />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[theme].tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
                backgroundColor: Colors[theme].background,
                height: 84 + insets.bottom,
                paddingBottom: insets.bottom + 8,
                paddingTop: 12,
              },
              default: {
                backgroundColor: Colors[theme].background,
                height: 84 + insets.bottom,
                paddingBottom: insets.bottom + 8,
                paddingTop: 8,
              },
            }),
            tabBarItemStyle: {
              paddingVertical: 4,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: 4,
            },
            sceneStyle: {
              backgroundColor: Colors[theme].background,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="transacoes"
            options={{
              title: 'Transações',
              tabBarIcon: ({ color }) => <MaterialIcons size={24} name="list" color={color} />,
            }}
          />
          <Tabs.Screen
            name="alertas-lembretes"
            options={{
              title: 'Alertas',
              tabBarIcon: ({ color }) => <MaterialIcons size={24} name="notifications-active" color={color} />,
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
  topBarMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  hamburgerButton: {
    padding: 6,
    borderRadius: 16,
  },
});
