import { useThemeColor } from '@/hooks/useThemeColor';
import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  description?: string;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  classNames?: {
    base?: ViewStyle;
    inputWrapper?: ViewStyle;
    input?: TextStyle;
    label?: TextStyle;
    errorMessage?: TextStyle;
    description?: TextStyle;
  };
  onValueChange?: (value: string) => void;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  placeholder,
  errorMessage,
  description,
  variant = 'flat',
  color = 'default',
  size = 'md',
  radius = 'md',
  isDisabled = false,
  isReadOnly = false,
  isRequired = false,
  isInvalid = false,
  fullWidth = true,
  startContent,
  endContent,
  classNames,
  onValueChange,
  value,
  onChangeText,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Theme colors
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
  const borderColor = useThemeColor({ light: '#e4e4e7', dark: '#3f3f46' }, 'tabIconDefault');
  const placeholderColor = useThemeColor({ light: '#71717a', dark: '#a1a1aa' }, 'tabIconDefault');
  const flatBgColor = useThemeColor({ light: '#f4f4f5', dark: '#27272a' }, 'background');
  const fadedBgColor = useThemeColor({ light: '#fafafa', dark: '#18181b' }, 'background');

  // Color variants
  const getColorStyles = () => {
    const colorMap = {
      default: { border: borderColor, focus: '#3b82f6' },
      primary: { border: '#3b82f6', focus: '#2563eb' },
      secondary: { border: '#8b5cf6', focus: '#7c3aed' },
      success: { border: '#10b981', focus: '#059669' },
      warning: { border: '#f59e0b', focus: '#d97706' },
      danger: { border: '#ef4444', focus: '#dc2626' },
    };
    return colorMap[color];
  };

  // Size styles
  const getSizeStyles = () => {
    const sizeMap = {
      sm: { height: 32, fontSize: 14, paddingHorizontal: 12, labelSize: 12 },
      md: { height: 40, fontSize: 16, paddingHorizontal: 16, labelSize: 14 },
      lg: { height: 48, fontSize: 18, paddingHorizontal: 20, labelSize: 16 },
    };
    return sizeMap[size];
  };

  // Radius styles
  const getRadiusStyles = () => {
    const radiusMap = {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      full: 999,
    };
    return radiusMap[radius];
  };

  // Variant styles
  const getVariantStyles = () => {
    const colors = getColorStyles();
    const variantMap = {
      flat: {
        backgroundColor: flatBgColor,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      bordered: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isInvalid ? '#ef4444' : isFocused ? colors.focus : colors.border,
      },
      faded: {
        backgroundColor: fadedBgColor,
        borderWidth: 1,
        borderColor: isInvalid ? '#ef4444' : isFocused ? colors.focus : 'transparent',
      },
      underlined: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 2,
        borderBottomColor: isInvalid ? '#ef4444' : isFocused ? colors.focus : colors.border,
        borderRadius: 0,
      },
    };
    return variantMap[variant];
  };

  const sizeStyles = getSizeStyles();
  const radiusStyles = getRadiusStyles();
  const variantStyles = getVariantStyles();

  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    onValueChange?.(text);
  };

  return (
    <View style={[styles.base, fullWidth && styles.fullWidth, classNames?.base]}>
      {label && (
        <Text style={[
          styles.label,
          { fontSize: sizeStyles.labelSize, color: textColor },
          isInvalid && styles.labelError,
          classNames?.label
        ]}>
          {label}
          {isRequired && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={[
        styles.inputWrapper,
        {
          height: sizeStyles.height,
          borderRadius: variant === 'underlined' ? 0 : radiusStyles,
        },
        variantStyles,
        isDisabled && styles.disabled,
        isFocused && styles.focused,
        isInvalid && styles.invalid,
        classNames?.inputWrapper
      ]}>
        {startContent && (
          <View style={styles.startContent}>{startContent}</View>
        )}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              fontSize: sizeStyles.fontSize,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              color: textColor,
            },
            startContent ? styles.inputWithStartContent : null,
            endContent ? styles.inputWithEndContent : null,
            classNames?.input
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={handleChangeText}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          editable={!isDisabled && !isReadOnly}
          {...props}
        />

        {endContent && (
          <View style={styles.endContent}>{endContent}</View>
        )}
      </View>

      {description && !errorMessage && (
        <Text style={[
          styles.description,
          { color: placeholderColor },
          classNames?.description
        ]}>
          {description}
        </Text>
      )}

      {errorMessage && (
        <Text style={[
          styles.errorMessage,
          classNames?.errorMessage
        ]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  base: {
    marginBottom: 4,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: '500',
    marginBottom: 6,
  },
  labelError: {
    color: '#ef4444',
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  inputWithStartContent: {
    paddingLeft: 8,
  },
  inputWithEndContent: {
    paddingRight: 8,
  },
  startContent: {
    paddingLeft: 12,
    justifyContent: 'center',
  },
  endContent: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  focused: {
    // Additional focus styles can be added here
  },
  disabled: {
    opacity: 0.5,
  },
  invalid: {
    borderColor: '#ef4444',
  },
  description: {
    fontSize: 12,
    marginTop: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});

export default Input;