import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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
  const userBubbleColor = useThemeColor({ light: '#007AFF', dark: Colors.dark.tint }, 'tint');
  const aiBubbleColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'background');
  const userTextColor = '#FFFFFF';
  const aiTextColor = useThemeColor({}, 'text');

  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.aiMessage,
    ]}>
      <View style={[
        styles.messageBubble,
        {
          backgroundColor: isUser ? userBubbleColor : aiBubbleColor,
        },
        isUser ? styles.userBubble : styles.aiBubble,
      ]}>
        <ThemedText style={[
          styles.messageText,
          { color: isUser ? userTextColor : aiTextColor },
        ]}>
          {message}
        </ThemedText>
        {timestamp && (
          <ThemedText style={[
            styles.timestampText,
            { color: isUser ? userTextColor : aiTextColor, opacity: 0.7 },
          ]}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 12,
    marginTop: 4,
  },
});