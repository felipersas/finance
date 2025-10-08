import { Notification } from '@/types/notification';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NotificationItem } from './NotificationItem';

interface Props {
  data: Notification[];
  onPressItem?: (item: Notification) => void;
  onLongPressItem?: (item: Notification) => void;
}

export const NotificationList: React.FC<Props> = ({ data, onPressItem, onLongPressItem }) => {
  if (!data.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Nenhum alerta ou lembrete encontrado.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={() => onPressItem?.(item)}
          onLongPress={() => onLongPressItem?.(item)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
};

const styles = StyleSheet.create({
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    opacity: 0.7,
  },
});
