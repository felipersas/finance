import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

// Example theme object. Replace with your actual theme import.
const theme = {
  colors: {
    error: '#D92D20',
    errorBackground: '#FEF3F2',
    success: '#067647',
    successBackground: '#ECFDF3',
    textPrimary: '#101828',
    textSecondary: '#667085',
    white: '#FFF',
    shadow: '#101828',
  },
  borderRadius: 12,
};

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const baseToastStyle: ViewStyle = {
  width: '90%',
  minHeight: 48,
  borderRadius: theme.borderRadius,
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginVertical: 4,
  backgroundColor: theme.colors.white,
  justifyContent: 'center',
  // Shadow for iOS
  shadowColor: theme.colors.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  // Elevation for Android
  elevation: 2,
};

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View
      style={[
        baseToastStyle,
        { backgroundColor: theme.colors.errorBackground }
      ]}
      accessibilityRole="alert"
      accessible
    >
      {text1 && (
        <Text
          style={{
            color: theme.colors.error,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: text2 ? 2 : 0,
          }}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 13,
            fontWeight: '400',
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
  success: ({ text1, text2 }: CustomToastProps) => (
    <View
      style={[
        baseToastStyle,
        { backgroundColor: theme.colors.successBackground }
      ]}
      accessible
    >
      {text1 && (
        <Text
          style={{
            color: theme.colors.success,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: text2 ? 2 : 0,
          }}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 13,
            fontWeight: '400',
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
  delete: ({ text1, text2 }: CustomToastProps) => (
    <View
      style={[
        baseToastStyle,
        { backgroundColor: theme.colors.errorBackground }
      ]}
      accessibilityRole="alert"
      accessible
    >
      {text1 && (
        <Text
          style={{
            color: theme.colors.error,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: text2 ? 2 : 0,
          }}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 13,
            fontWeight: '400',
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
};

export default toastConfig;