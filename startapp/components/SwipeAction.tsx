import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';

interface SwipeActionProps {
  type: 'delete' | 'edit';
  onPress: () => void;
}

export const SwipeAction: React.FC<SwipeActionProps> = ({ type, onPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme, type);
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} accessibilityLabel={type === 'delete' ? 'Excluir' : 'Editar'}>
      <Feather
        name={type === 'delete' ? 'trash-2' : 'edit-2'}
        size={22}
        color={'#fff'}
      />
      <Text style={styles.actionText}>{type === 'delete' ? 'Excluir' : 'Editar'}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: 'light' | 'dark', type: 'delete' | 'edit') =>
  StyleSheet.create({
    actionButton: {
      flex: 1,
      backgroundColor: type === 'delete' ? Colors.error : Colors[theme].tint,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
      flexDirection: 'column',
      borderTopLeftRadius: type === 'edit' ? 16 : 0,
      borderBottomLeftRadius: type === 'edit' ? 16 : 0,
      borderTopRightRadius: type === 'delete' ? 16 : 0,
      borderBottomRightRadius: type === 'delete' ? 16 : 0,
      marginHorizontal: 2,
  marginBottom: 14,
    },
    actionText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 13,
      marginTop: 4,
    },
  });
