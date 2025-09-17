import { useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadCsvMutation } from "@/hooks/useUploadCsv";
import { ThemedView } from "./ThemedView";

export default function UploadCsvButton() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const csvMutation = useUploadCsvMutation();

  const pickCsvFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv', // Restrict to CSV files
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setSelectedFile(result.assets[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const uploadCsv = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a CSV file first');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'text/csv',
      } as any);
      await csvMutation.mutateAsync({ file: formData});
      Alert.alert('Success', 'CSV uploaded successfully');
      setSelectedFile(null); // Reset after success
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
    }
  };

  return (
    <ThemedView>
      <TouchableOpacity onPress={pickCsvFile} disabled={csvMutation.isPending}>
        <Text>{selectedFile ? `Selected: ${selectedFile.name}` : 'Select CSV File'}</Text>
      </TouchableOpacity>
      {selectedFile && (
        <TouchableOpacity onPress={uploadCsv} disabled={csvMutation.isPending}>
          <Text>{csvMutation.isPending ? 'Uploading...' : 'Upload CSV'}</Text>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}