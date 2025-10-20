import { ChatPopup } from "./ChatPopup";
import { IconSymbol } from "@/components/ui";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

interface ChatFABProps {
  bottom?: number;
  right?: number;
}

export const ChatFAB: React.FC<ChatFABProps> = ({
  bottom = 100,
  right = 20,
}) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const openChat = () => {
    setIsChatVisible(true);
  };

  const closeChat = () => {
    setIsChatVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        className="absolute w-14 h-14 rounded-full bg-tint shadow-lg z-[1000]"
        style={{ bottom, right }}
        onPress={openChat}
        activeOpacity={0.8}
      >
        <View className="flex-1 items-center justify-center">
          <IconSymbol name="lightbulb" size={24} color="black" />
        </View>
      </TouchableOpacity>

      <ChatPopup visible={isChatVisible} onClose={closeChat} />
    </>
  );
};
