import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export function Drawer({
  open,
  drawerAnim,
  colorScheme,
  session,
  signOut,
  onClose,
}: {
  open: boolean;
  drawerAnim: Animated.Value;
  colorScheme: string | undefined;
  session: any;
  signOut: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <View style={styles.drawerOverlayLeft}>
      <Animated.View style={[styles.drawerCardFullLeft, {
  backgroundColor: Colors[(colorScheme ?? 'light') as 'light' | 'dark'].card,
        transform: [{ translateX: drawerAnim }],
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 101,
      }]}>
        <View style={styles.drawerContent}>
          <ThemedText type="subtitle" style={styles.drawerTitle}>{session?.name}</ThemedText>
        <TouchableOpacity style={styles.drawerCloseLeft} onPress={onClose}>
          <Ionicons name="close" size={28} color={Colors[(colorScheme ?? 'light') as 'light' | 'dark'].text} />
        </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.drawerLogoutBottom} onPress={signOut}>
          <MaterialIcons name="logout" size={28} color={Colors[(colorScheme ?? 'light') as 'light' | 'dark'].error} />
          <ThemedText style={styles.drawerLogoutText}>Sair</ThemedText>
        </TouchableOpacity>
      </Animated.View>
      <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  drawerOverlayLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    zIndex: 100,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  drawerCardFullLeft: {
    height: '100%',
    width: 280,
    paddingTop: 32,
    paddingHorizontal: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 2 },
    position: 'relative',
    justifyContent: 'flex-start',
  },
  drawerCloseLeft: {
    left: 18,
    padding: 6,
    borderRadius: 16,
    zIndex: 2,
  },
  drawerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 32,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 18,
  },
  drawerLogoutBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    position: 'absolute',
    left: 24,
    bottom: 32,
  },
  drawerLogoutText: {
    fontSize: 16,
    color: Colors.error,
    marginLeft: 8,
    fontWeight: '500',
  },
});
