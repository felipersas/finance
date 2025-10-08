import { Colors } from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  errorMessage?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  theme: 'light' | 'dark';
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, errorMessage, isInvalid, isRequired, theme = 'light' }) => {
  const styles = createStyles(theme, isInvalid);

  const dateObj = value ? new Date(value) : new Date();
  const [show, setShow] = React.useState(false);
  const [pickerDate, setPickerDate] = React.useState(dateObj);

  const handleChange = (_event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      setPickerDate(selectedDate);
      const iso = selectedDate.toISOString().slice(0, 10);
      onChange(iso);
    }
  };

  return (
  <View style={styles.base}>
      {label && (
        <Text style={{ ...styles.label, fontWeight: '500', marginBottom: 6 }}>
          {label}
          {isRequired && <Text style={{ color: '#ef4444' }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.inputText}>
          {value ? value : 'Selecione a data'}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          locale="pt-BR"
        />
      )}
      {errorMessage && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}

    </View>
  );
}
const createStyles = (theme: 'light' | 'dark', isInvalid?: boolean) => {
  const palette = Colors[theme];
  return StyleSheet.create({
    base: {
      marginBottom: 8,
      width: '100%',
    },
    label: {
      color: palette.text,
      fontSize: 14,
      marginBottom: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 40,
      width: '100%',
      marginBottom: 2,
      shadowOpacity: 0.04,
      backgroundColor: "#272729",
      borderColor: isInvalid ? Colors.error : palette.muted,
    },
    icon: {
      marginRight: 8,
    },
    inputText: {
      fontSize: 16,
      flex: 1,
      color: "#a4a6aa",
    },
    errorMessage: {
      color: Colors.error,
      fontSize: 12,
      marginTop: 4,
      fontWeight: '400',
    },
  });
};