import React from "react";
import { FlatList, Text, View } from "react-native";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "../ui/skeleton";
import { Notification } from "@/types/notification";

interface NotificationListProps {
  data: Notification[];
  onPressItem: (item: Notification) => void;
  onLongPressItem: (item: Notification) => void;
  isLoading?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  data,
  onPressItem,
  onLongPressItem,
  isLoading = false,
}) => {
  const SKELETON_COUNT = 4;

  const renderSkeleton = () =>
    Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <View className="flex-row items-center py-6 px-2" key={idx}>
        <Skeleton
          className="mr-3"
          style={{ width: 60, height: 60, borderRadius: 20 }}
        />
        <View style={{ flex: 1 }}>
          <Skeleton className="mb-2" style={{ width: "100%", height: 16 }} />
          <Skeleton style={{ width: "40%", height: 14 }} />
        </View>
      </View>
    ));

  if (isLoading) {
    return <View className="flex-1">{renderSkeleton()}</View>;
  }

  if (!data?.length) {
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
          onPress={() => onPressItem(item)}
          onLongPress={() => onLongPressItem(item)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
};
