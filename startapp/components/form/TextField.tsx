import { useThemeColor } from "@/hooks/useThemeColor";
import { useFormContext } from "react-hook-form";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface TextFieldProps extends TextInputProps{
  label: string;
  name: string;
}

export const Textfield = ({ label, name, ...inputProps}: TextFieldProps) => {
  const { formState: { errors } } = useFormContext();

  // Get theme-aware colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'text');

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        {...inputProps}
        style={[
          styles.input,
          {
            backgroundColor,
            color: textColor,
            borderColor: errorMessage ? '#ef4444' : borderColor
          },
          errorMessage && styles.inputError
        ]}
        placeholderTextColor={placeholderColor}
      />
      {errorMessage && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
  }
})