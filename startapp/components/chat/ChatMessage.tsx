import { ThemedText } from "@/components/common";
import React from "react";
import { View } from "react-native";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  timestamp,
}) => {
  return (
    <View className={`my-1 px-4 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] rounded-[18px] px-4 py-2.5 ${
          isUser ? "bg-tint rounded-br-[4px]" : "bg-[#2C2C2E] rounded-bl-[4px]"
        }`}
      >
        <ThemedText
          className={`text-base leading-5 ${
            isUser ? "text-white" : "text-text"
          }`}
        >
          {message}
        </ThemedText>
        {timestamp && (
          <ThemedText
            className={`text-xs mt-1 opacity-70 ${
              isUser ? "text-white" : "text-text"
            }`}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
        )}
      </View>
    </View>
  );
};
