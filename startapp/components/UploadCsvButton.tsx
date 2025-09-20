import { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet, Modal, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadCsvMutation } from "@/hooks/useUploadCsv";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';


export default function UploadCsvButton() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const csvMutation = useUploadCsvMutation();
  const theme = useTheme()
  const styles = createStyles(theme)

  const pickCsvFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const isCsv = file.name?.toLowerCase().endsWith('.csv') || file.mimeType === 'text/csv';
      if (!isCsv) {
        Alert.alert('Arquivo inválido', 'Selecione um arquivo CSV válido.');
        return;
      }
      setSelectedFile(file);
      setModalVisible(true);
    } catch {
      Alert.alert('Erro', 'Falha ao selecionar arquivo.');
    }
  };

  const uploadCsv = async () => {
    if (!selectedFile) {
      Alert.alert('Selecione um arquivo', 'Escolha um arquivo CSV antes de enviar.');
      return;
    }
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'text/csv',
      } as any);
      await csvMutation.mutateAsync(formData);
      setSelectedFile(null);
      setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.iconButton,
        ]}
        onPress={pickCsvFile}
        disabled={csvMutation.isPending}
        activeOpacity={0.7}
        accessibilityLabel="Selecionar arquivo CSV"
      >
        <MaterialIcons color={Colors[theme].tint} name="add" size={32} />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent]}>
            <Text style={[styles.modalTitle]}>Arquivo selecionado</Text>
            <Text style={[styles.modalFileName]} numberOfLines={2}>
              {selectedFile?.name}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedFile(null);
                }}
              >
                <Text style={[styles.cancelButton, styles.cancelButton]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                ]}
                onPress={uploadCsv}
                disabled={csvMutation.isPending}
              >
                {csvMutation.isPending ? (
                  <ActivityIndicator color={Colors[theme].tint} />
                ) : (
                  <Text style={[styles.modalButtonText]}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles =  (theme: "light" | "dark") =>
  StyleSheet.create({
  iconButton: {
    backgroundColor: Colors[theme].background,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors[theme].background,
    borderRadius: 16,
    padding: 20,
    minWidth: 240,
    alignItems: 'center',
    elevation: 4,
  },
  modalTitle: {
    color: Colors[theme].text,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modalFileName: {
    color: Colors[theme].tint,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 180,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    backgroundColor: Colors[theme].background,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  modalButtonText: {
    color: Colors[theme].tint,
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  cancelButton: {
    color: Colors[theme].text,
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.1,
  },
});