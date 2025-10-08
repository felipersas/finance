import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Notification } from '@/types/notification';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const typeIcons: Record<Notification['type'], keyof typeof MaterialIcons.glyphMap> = {
  financeiro: 'attach-money',
  estoque: 'inventory',
  fiscal: 'description',
  contrato: 'assignment',
  lembrete: 'notifications-none',
};

interface Props {
  notification: Notification;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const NotificationItem: React.FC<Props> = ({ notification, onPress, onLongPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const iconName = typeIcons[notification.type];
  const isReminder = notification.isReminder || notification.type === 'lembrete';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: notification.read ? Colors[theme].card : Colors[theme].background },
        isReminder && { borderLeftWidth: 4, borderLeftColor: Colors[theme].tint },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconBox}>
  <MaterialIcons name={iconName as any} size={28} color={isReminder ? Colors[theme].tint : Colors[theme].muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, isReminder && { color: Colors[theme].tint }]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {notification.description}
        </Text>
        <Text style={styles.date}>
          {notification.date.slice(0, 10)}{notification.time ? ` ${notification.time}` : ''}
        </Text>
      </View>
      {!notification.read && <View style={styles.badge} />}
    </TouchableOpacity>
  );
};

const createStyles = (theme: "light" | "dark") => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[theme].text,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: Colors[theme].text,
    opacity: 0.8,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#888',
    opacity: 0.7,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    marginLeft: 8,
  },
});
