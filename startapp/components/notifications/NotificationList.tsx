import { Notification } from "@/types/notification";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { NotificationItem } from "./NotificationItem";

interface Props {
  data: Notification[];
  onPressItem?: (item: Notification) => void;
  onLongPressItem?: (item: Notification) => void;
}

export const NotificationList: React.FC<Props> = ({
  data,
  onPressItem,
  onLongPressItem,
}) => {
  if (!data.length) {
    return (
      <View className="flex-1 items-center justify-center py-12 px-4 bg-background rounded-xl">
        <Text className="text-textSecondary text-center font-medium">
          Nenhum alerta ou lembrete encontrado.
        </Text>
      </View>
    );
  }
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={() => onPressItem?.(item)}
          onLongPress={() => onLongPressItem?.(item)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
};
