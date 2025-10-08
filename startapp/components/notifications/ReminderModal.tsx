import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface ReminderModalProps {
  visible: boolean;
  form: { title: string; description: string; date: string; time: string };
  editReminder: any;
  onChange: (field: keyof ReminderModalProps['form'], value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  form,
  editReminder,
  onChange,
  onSave,
  onDelete,
  onCancel,
  theme,
}) => {
  const styles = createStyles(theme);
  if (!visible) return null;
  return (
    <ThemedView style={styles.modalOverlay}>
      <ThemedView style={styles.modalCardMinimal}>
        <ThemedText type="subtitle" style={styles.modalTitleMinimal}>{editReminder ? 'Editar lembrete' : 'Criar lembrete'}</ThemedText>
        <View style={styles.modalFormMinimal}>
          <TextInput
            style={styles.inputMinimal}
            placeholder="Título"
            value={form.title}
            onChangeText={v => onChange('title', v)}
            placeholderTextColor={styles.inputPlaceholder.color}
          />
          <TextInput
            style={styles.inputMinimal}
            placeholder="Descrição"
            value={form.description}
            onChangeText={v => onChange('description', v)}
            placeholderTextColor={styles.inputPlaceholder.color}
          />
          <TextInput
            style={styles.inputMinimal}
            placeholder="Data (YYYY-MM-DD)"
            value={form.date}
            onChangeText={v => onChange('date', v)}
            placeholderTextColor={styles.inputPlaceholder.color}
          />
          <TextInput
            style={styles.inputMinimal}
            placeholder="Horário (HH:mm)"
            value={form.time}
            onChangeText={v => onChange('time', v)}
            placeholderTextColor={styles.inputPlaceholder.color}
          />
        </View>
        <View style={styles.modalActionsMinimal}>
          <AppButton
            title="Salvar"
            onPress={onSave}
            style={styles.saveButtonMinimal}
            textStyle={styles.saveButtonTextMinimal}
          />
          {editReminder && (
            <AppButton
              title="Excluir"
              onPress={onDelete}
              style={styles.deleteButtonMinimal}
              textStyle={styles.deleteButtonTextMinimal}
            />
          )}
          <AppButton
            title="Cancelar"
            onPress={onCancel}
            style={styles.cancelButtonMinimal}
            textStyle={styles.cancelButtonTextMinimal}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
};

const createStyles = (theme: 'light' | 'dark') => {
  const palette = Colors[theme];
  return StyleSheet.create({
    modalOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    modalCardMinimal: {
      backgroundColor: palette.card,
      borderRadius: 20,
      padding: 20,
      maxWidth: 360,
      width: '92%',
      alignItems: 'stretch',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    modalTitleMinimal: {
      fontWeight: '600',
      fontSize: 18,
      marginBottom: 16,
      color: palette.text,
      textAlign: 'left',
    },
    modalFormMinimal: {
      width: '100%',
      gap: 10,
      marginBottom: 18,
    },
    inputMinimal: {
      width: '100%',
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      borderWidth: 0,
      backgroundColor: palette.background,
      color: palette.text,
      marginBottom: 2,
      shadowColor: palette.muted,
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    inputPlaceholder: { color: palette.muted },
    modalActionsMinimal: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
      marginTop: 2,
    },
    saveButtonMinimal: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: Colors.success,
      minWidth: 90,
    },
    saveButtonTextMinimal: { color: '#fff', fontWeight: '600', fontSize: 15 },
    deleteButtonMinimal: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: Colors.error,
      minWidth: 90,
    },
    deleteButtonTextMinimal: { color: '#fff', fontWeight: '600', fontSize: 15 },
    cancelButtonMinimal: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      minWidth: 90,
    },
    cancelButtonTextMinimal: { fontSize: 15, color: palette.text },
  });
};
