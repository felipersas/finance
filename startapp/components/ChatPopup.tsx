import { ChatMessage } from '@/components/ChatMessage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { strings } from '@/constants/Strings';
import { useChatMutation } from '@/hooks/useChatApi';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
      id: '1',
      text: strings.chat.helloMessage,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string>('');

  const flatListRef = useRef<FlatList>(null);
  const chatMutation = useChatMutation();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'tabIconDefault');
  const inputBgColor = useThemeColor({ light: '#F2F2F7', dark: '#1C1C1E' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Scroll to bottom when new messages are added
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

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');

    try {
      const response = await chatMutation.mutateAsync({ query: messageText });

      if (response.data?.conversationId && !conversationId) {
        setConversationId(response.data.conversationId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.response ?? '',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert(
        strings.chat.errorTitle,
        strings.chat.errorMessage,
        [{ text: strings.common.ok }]
      );

      // Remove the user message if the API call failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  };

  const handleClose = () => {
    // Reset the chat state when closing
    setMessages([{
      id: '1',
      text: strings.chat.helloMessage,
      isUser: false,
      timestamp: new Date(),
    }]);
    setInputText('');
    setConversationId('');
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
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            {strings.chat.aiAssistant}
          </ThemedText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="chevron.right"
              size={20}
              color={textColor}
              style={{ transform: [{ rotate: '90deg' }] }}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {chatMutation.isPending && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={styles.loadingText}>{strings.chat.aiThinking}</ThemedText>
          </View>
        )}

        {/* Input Area */}
        <ThemedView style={[styles.inputContainer, { borderTopColor: borderColor }]}>
          <View style={[styles.inputWrapper, { backgroundColor: inputBgColor }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={strings.chat.typeMessage}
              placeholderTextColor={useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault')}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              editable={!chatMutation.isPending}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() ? tintColor : borderColor,
                  opacity: chatMutation.isPending ? 0.6 : 1,
                }
              ]}
              activeOpacity={0.7}
              disabled={!inputText.trim() || chatMutation.isPending}
            >
              <IconSymbol
                name="paperplane.fill"
                size={16}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});