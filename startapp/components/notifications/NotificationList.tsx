import React from "react";
import { FlatList, Text, View } from "react-native";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "../ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationList: React.FC = () => {
  const { response, isLoading, isFetching } = useNotifications();
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

  if (isLoading || isFetching) {
    // if (true) {
    return <View className="flex-1">{renderSkeleton()}</View>;
  }

  if (!response?.data?.data?.length) {
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
      data={response.data.data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationItem notification={item} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
};
