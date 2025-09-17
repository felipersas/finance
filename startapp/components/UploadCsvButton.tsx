import { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet, Modal, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadCsvMutation } from "@/hooks/useUploadCsv";
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function UploadCsvButton() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const csvMutation = useUploadCsvMutation();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

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
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar arquivo.');
    }
  };

  const uploadCsv = async () => {
    if (!selectedFile) {
      Alert.alert('Selecione um arquivo', 'Escolha um arquivo CSV antes de enviar.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'text/csv',
      } as any);
      await csvMutation.mutateAsync(formData);
      Alert.alert('Sucesso', 'CSV enviado com sucesso!');
      setSelectedFile(null);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar o arquivo.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: primaryColor + '22' } // cor translúcida
        ]}
        onPress={pickCsvFile}
        disabled={csvMutation.isPending}
        activeOpacity={0.7}
        accessibilityLabel="Selecionar arquivo CSV"
      >
        <MaterialIcons color={primaryColor} name="add" size={32} />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Arquivo selecionado</Text>
            <Text style={[styles.modalFileName, { color: mutedColor }]} numberOfLines={2}>
              {selectedFile?.name}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor:  mutedColor + '22' }
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedFile(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: mutedColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: primaryColor + '22' }
                ]}
                onPress={uploadCsv}
                disabled={csvMutation.isPending}
              >
                {csvMutation.isPending ? (
                  <ActivityIndicator color={primaryColor} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: primaryColor }]}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    // sem sombra, sem borda, minimalista
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0006', // overlay escuro translúcido
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    minWidth: 240,
    alignItems: 'center',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modalFileName: {
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
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  modalButtonText: {
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.1,
  },
});