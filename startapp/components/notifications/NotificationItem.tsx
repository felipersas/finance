import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Notification } from "@/types/notification";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

const typeIcons: Record<
  Notification["type"],
  keyof typeof MaterialIcons.glyphMap
> = {
  financeiro: "attach-money",
  estoque: "inventory",
  fiscal: "description",
  contrato: "assignment",
  lembrete: "notifications-none",
};

interface Props {
  notification: Notification;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const NotificationItem: React.FC<Props> = ({
  notification,
  onPress,
  onLongPress,
}) => {
  const theme = useTheme();
  const iconName = typeIcons[notification.type];
  const isReminder =
    notification.isReminder || notification.type === "lembrete";

  return (
    <TouchableOpacity
      className={[
        "flex-row items-center px-4 py-3 rounded-xl mb-3 shadow-sm",
        notification.read ? "bg-card" : "bg-card border border-primary",
        isReminder ? "border-l-4" : "",
      ].join(" ")}
      style={isReminder ? { borderLeftColor: Colors[theme].tint } : undefined}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      <View className="w-10 h-10 rounded-lg bg-muted items-center justify-center mr-4">
        <MaterialIcons
          name={iconName}
          size={28}
          color={isReminder ? Colors[theme].tint : Colors[theme].muted}
        />
      </View>
      <View className="flex-1">
        <Text
          className={["text-text font-semibold mb-1", "text-text"].join(" ")}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text className="text-sm text-textSecondary mb-1" numberOfLines={2}>
          {notification.description}
        </Text>
        <Text className="text-xs text-textSecondary">
          {notification.date.slice(0, 10)}
          {notification.time ? ` ${notification.time}` : ""}
        </Text>
      </View>
      {!notification.read && (
        <View className="w-3 h-3 rounded-3xl bg-primary ml-2" />
      )}
    </TouchableOpacity>
  );
};
