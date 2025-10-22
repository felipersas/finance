import { ChatMessage } from "./ChatMessage";
import { ThemedText, ThemedView } from "@/components/common";
import { IconSymbol } from "@/components/ui";
import { strings } from "@/constants/Strings";
import { useChatMutation } from "@/hooks/useChatApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatPopupProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatPopup: React.FC<ChatPopupProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: strings.chat.helloMessage,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const chatMutation = useChatMutation();

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor(
    { light: "#8E8E93", dark: "#8E8E93" },
    "tabIconDefault",
  );
  const tintColor = useThemeColor({}, "tint");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText("");

    try {
      const response = await chatMutation.mutateAsync({ query: messageText });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.text ?? "",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert(strings.chat.errorTitle, strings.chat.errorMessage, [
        { text: strings.common.ok },
      ]);

      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    }
  };

  const handleClose = () => {
    setMessages([
      {
        id: "1",
        text: strings.chat.helloMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setInputText("");
    onClose();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      message={item.text}
      isUser={item.isUser}
      timestamp={item.timestamp}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        style={{
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
      >
        <ThemedView
          className={`flex-row items-center justify-between px-4 py-4 border-b border-light-tabIconDefault border-[#38383A] ${Platform.OS === "ios" ? "pt-[60px]" : "pt-4"}`}
        >
          <ThemedText type="defaultSemiBold" className="text-lg text-text">
            {strings.chat.aiAssistant}
          </ThemedText>
          <TouchableOpacity
            onPress={handleClose}
            className="p-1"
            activeOpacity={0.7}
          >
            <IconSymbol
              name="chevron.right"
              size={20}
              color={textColor}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </TouchableOpacity>
        </ThemedView>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {chatMutation.isPending && (
          <View className="flex-row items-center justify-center py-2 px-4">
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText className="ml-2 text-sm italic opacity-70">
              {strings.chat.aiThinking}
            </ThemedText>
          </View>
        )}

        <View
          className={`px-4 py-4 border-t border-light-tabIconDefault border-[#38383A] ${Platform.OS === "ios" ? "pb-[34px]" : "pb-[50px]"}`}
        >
          <View className="flex-row items-end  bg-[#1C1C1E] rounded-[20px] px-4 py-2 min-h-[40px]">
            <TextInput
              className="flex-1 text-base leading-5 max-h-[100px] py-2 text-text"
              style={{ color: textColor }}
              value={inputText}
              onChangeText={setInputText}
              placeholder={strings.chat.typeMessage}
              placeholderTextColor={placeholderColor}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              editable={!chatMutation.isPending}
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="w-8 h-8 rounded-full items-center justify-center ml-2"
              style={{
                backgroundColor: inputText.trim() ? tintColor : "#E5E5EA",
                opacity: chatMutation.isPending ? 0.6 : 1,
              }}
              activeOpacity={0.7}
              disabled={!inputText.trim() || chatMutation.isPending}
            >
              <IconSymbol name="paperplane.fill" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
