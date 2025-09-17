import { ChatPopup } from '@/components/ChatPopup';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ChatFABProps {
  bottom?: number;
  right?: number;
}

export const ChatFAB: React.FC<ChatFABProps> = ({
  bottom = 100,
  right = 20
}) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const tintColor = useThemeColor({}, 'tint');

  const openChat = () => {
    setIsChatVisible(true);
  };

  const closeChat = () => {
    setIsChatVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom,
            right,
            backgroundColor: tintColor,
          }
        ]}
        onPress={openChat}
        activeOpacity={0.8}
      >
        <View style={styles.fabContent}>
          <IconSymbol
            name="lightbulb"
            size={24}
            color="black"
          />
        </View>
      </TouchableOpacity>

      <ChatPopup
        visible={isChatVisible}
        onClose={closeChat}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  fabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});