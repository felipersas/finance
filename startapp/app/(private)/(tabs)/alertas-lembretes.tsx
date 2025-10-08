import { AppButton } from '@/components/AppButton';
import { NotificationList } from '@/components/notifications/NotificationList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useNotifications } from '@/contexts/notifications/NotificationContext';
import { useTheme } from '@/hooks/useTheme';
import { NotificationType } from '@/types/notification';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const tipos = [
  { label: 'Todos', value: 'all' },
  { label: 'Financeiro', value: 'financeiro' },
  { label: 'Estoque', value: 'estoque' },
  { label: 'Fiscal', value: 'fiscal' },
  { label: 'Contrato', value: 'contrato' },
  { label: 'Lembrete', value: 'lembrete' },
];

export default function AlertasLembretesScreen() {
  const theme = useTheme();
  const [tipo, setTipo] = useState('all');
  const styles = createStyles(theme, tipo);
  const { notifications, markAsRead, addReminder, updateReminder, deleteReminder } = useNotifications();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editReminder, setEditReminder] = useState<any>(null);

  // Filtro
  const filtered = notifications.filter(n => {
    const matchTipo = tipo === 'all' || n.type === tipo;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    return matchTipo && matchSearch;
  });

  // Badge de não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Formulário de lembrete
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '' });
  const handleOpenForm = (reminder?: any) => {
    if (reminder) {
      setForm({
        title: reminder.title,
        description: reminder.description,
        date: reminder.date ? reminder.date.slice(0, 10) : '',
        time: reminder.time || '',
      });
      setEditReminder(reminder);
    } else {
      setForm({ title: '', description: '', date: '', time: '' });
      setEditReminder(null);
    }
    setModalVisible(true);
  };
  const handleSaveReminder = () => {
    if (!form.title || !form.date) return;
    const newReminder = {
      id: editReminder?.id || Math.random().toString(36).slice(2),
      title: form.title,
      description: form.description,
      type: 'lembrete' as NotificationType,
      date: form.date,
      time: form.time,
      read: false,
      isReminder: true,
    };
    if (editReminder) updateReminder(newReminder);
    else addReminder(newReminder);
    setModalVisible(false);
  };
  const handleDeleteReminder = () => {
    if (editReminder) deleteReminder(editReminder.id);
    setModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>Alertas e Lembretes</ThemedText>
        <TouchableOpacity style={styles.badgeBox} onPress={handleOpenForm}>
          <MaterialIcons name="add-alert" size={24} color={styles.icon.color} />
          {unreadCount > 0 && (
            <ThemedView style={styles.badge}>
              <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
            </ThemedView>
          )}
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={styles.searchInputPlaceholder.color}
        />
        <ThemedView style={styles.tipoTabs}>
          {tipos.map(t => (
            <TouchableOpacity
              key={t.value}
              style={styles.getTipoTab(t.value)}
              onPress={() => setTipo(t.value)}
            >
              <ThemedText style={styles.getTipoTabText(t.value)}>{t.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
      <NotificationList
        data={filtered}
        onPressItem={item => markAsRead(item.id)}
        onLongPressItem={item => item.isReminder ? handleOpenForm(item) : undefined}
      />
      {/* Modal de lembrete */}
      {modalVisible && (
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalCardMinimal}>
            <ThemedText type="subtitle" style={styles.modalTitleMinimal}>{editReminder ? 'Editar lembrete' : 'Criar lembrete'}</ThemedText>
            <View style={styles.modalFormMinimal}>
              <TextInput
                style={styles.inputMinimal}
                placeholder="Título"
                value={form.title}
                onChangeText={v => setForm(f => ({ ...f, title: v }))}
                placeholderTextColor={styles.inputPlaceholder.color}
              />
              <TextInput
                style={styles.inputMinimal}
                placeholder="Descrição"
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                placeholderTextColor={styles.inputPlaceholder.color}
              />
              <TextInput
                style={styles.inputMinimal}
                placeholder="Data (YYYY-MM-DD)"
                value={form.date}
                onChangeText={v => setForm(f => ({ ...f, date: v }))}
                placeholderTextColor={styles.inputPlaceholder.color}
              />
              <TextInput
                style={styles.inputMinimal}
                placeholder="Horário (HH:mm)"
                value={form.time}
                onChangeText={v => setForm(f => ({ ...f, time: v }))}
                placeholderTextColor={styles.inputPlaceholder.color}
              />
            </View>
            <View style={styles.modalActionsMinimal}>
              <AppButton
                title="Salvar"
                onPress={handleSaveReminder}
                style={styles.saveButtonMinimal}
                textStyle={styles.saveButtonTextMinimal}
              />
              {editReminder && (
                <AppButton
                  title="Excluir"
                  onPress={handleDeleteReminder}
                  style={styles.deleteButtonMinimal}
                  textStyle={styles.deleteButtonTextMinimal}
                />
              )}
              <AppButton
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                style={styles.cancelButtonMinimal}
                textStyle={styles.cancelButtonTextMinimal}
              />
            </View>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const createStyles = (theme: "light" | "dark", selectedTipo?: string) => {
  // Minimal modal styles (after palette assignment)
  const palette = Colors[theme];
  const staticStylesMinimal = StyleSheet.create({
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
  const staticStyles = StyleSheet.create({
    container: { flex: 1, marginHorizontal: 12 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 18,
      paddingBottom: 8,
    },
    title: { fontSize: 22, fontWeight: 'bold' },
    badgeBox: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
    badge: {
      position: 'absolute', top: -6, right: -12, borderRadius: 8, minWidth: 16, height: 16,
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
      backgroundColor: palette.tint,
    },
    badgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
    filterRow: { flexDirection: 'column', gap: 8, paddingHorizontal: 18, marginBottom: 8 },
    searchInput: {
      borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 8, borderWidth: 1,
      backgroundColor: palette.card, color: palette.text, borderColor: palette.muted,
    },
    tipoTabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    modalOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    modalCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 24,
      maxWidth: 400,
      width: '90%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    modalTitle: { fontWeight: 'bold', fontSize: 20, marginBottom: 18, color: palette.text, textAlign: 'center' },
    modalForm: { width: '100%', gap: 12, marginBottom: 18 },
    input: {
      width: '100%', borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1,
      backgroundColor: palette.background, color: palette.text, borderColor: palette.muted,
    },
    modalActions: { flexDirection: 'column', gap: 10, width: '100%' },
    saveButton: {
      borderRadius: 12, paddingVertical: 14, backgroundColor: Colors.success, marginBottom: 4,
    },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    deleteButton: {
      borderRadius: 12, paddingVertical: 14, backgroundColor: Colors.error, marginBottom: 4,
    },
    deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cancelButton: {
      borderRadius: 12, paddingVertical: 14, backgroundColor: palette.muted,
    },
    cancelButtonText: { fontSize: 16, color: palette.text },
  });
  // Dynamic helpers
  const icon = { color: palette.tint };
  const searchInputPlaceholder = { color: palette.muted };
  const inputPlaceholder = { color: palette.muted };
  const getTipoTab = (value: string) => ({
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, marginRight: 6, borderWidth: 1,
    backgroundColor: selectedTipo === value ? palette.tint + '22' : palette.card,
    borderColor: selectedTipo === value ? palette.tint : palette.muted,
  });
  const getTipoTabText = (value: string) => ({
    fontSize: 14,
    color: selectedTipo === value ? palette.tint : palette.text,
    fontWeight: selectedTipo === value ? 'bold' : 'normal',
  } as const);
  return {
    ...staticStyles,
    ...staticStylesMinimal,
    icon,
    searchInputPlaceholder,
    inputPlaceholder,
    getTipoTab,
    getTipoTabText,
  };
};
