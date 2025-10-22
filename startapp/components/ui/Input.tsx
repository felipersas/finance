import { useThemeColor } from "@/hooks/useThemeColor";
import React, { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  description?: string;
  variant?: "flat" | "bordered" | "faded" | "underlined";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
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

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      errorMessage,
      description,
      variant = "flat",
      color = "default",
      size = "md",
      radius = "md",
      isDisabled = false,
      isReadOnly = false,
      isRequired = false,
      isInvalid = false,
      fullWidth = true,
      startContent,
      endContent,
      className = "",
      inputClassName = "",
      labelClassName = "",
      wrapperClassName = "",
      classNames,
      onValueChange,
      value,
      onChangeText,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Theme colors for dynamic placeholders
    const placeholderColor = useThemeColor(
      { light: "#71717a", dark: "#a1a1aa" },
      "tabIconDefault",
    );

    // Size classes
    const sizeClasses = {
      sm: "h-8 text-sm px-3",
      md: "h-10 text-base px-4",
      lg: "h-12 text-lg px-5",
    };

    const labelSizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    // Radius classes
    const radiusClasses = {
      none: "rounded-none",
      sm: "rounded",
      md: "rounded-lg",
      lg: "rounded-xl",
      full: "rounded-full",
    };

    // Color classes for focus states
    const colorFocusClasses = {
      default: "border-blue-500",
      primary: "border-blue-500",
      secondary: "border-purple-500",
      success: "border-green-500",
      warning: "border-yellow-500",
      danger: "border-red-500",
    };

    const colorBorderClasses = {
      default: "border-tabIconDefault border-tabIconDefault",
      primary: "border-blue-500",
      secondary: "border-purple-500",
      success: "border-green-500",
      warning: "border-yellow-500",
      danger: "border-red-500",
    };

    // Variant classes
    const variantClasses = {
      flat: ` bg-background border-0`,
      bordered: `bg-transparent border ${isInvalid ? "border-red-500" : isFocused ? colorFocusClasses[color] : colorBorderClasses[color]}`,
      faded: ` bg-background border ${isInvalid ? "border-red-500" : isFocused ? colorFocusClasses[color] : "border-transparent"}`,
      underlined: `bg-transparent border-0 border-b-2 rounded-none ${isInvalid ? "border-red-500" : isFocused ? colorFocusClasses[color] : colorBorderClasses[color]}`,
    };

    // Base container classes
    const baseClasses = `mb-1 ${fullWidth ? "w-full" : ""} ${className}`;

    // Label classes
    const baseLabelClasses = `font-medium mb-1.5 text-text ${labelSizeClasses[size]} ${isInvalid ? "text-red-500" : ""} ${labelClassName}`;

    // Wrapper classes
    const baseWrapperClasses = `flex-row items-center ${sizeClasses[size]} ${variantClasses[variant]} ${variant !== "underlined" ? radiusClasses[radius] : ""} ${isDisabled ? "opacity-50" : ""} ${wrapperClassName}`;

    // Input classes
    const baseInputClasses = `flex-1 h-full py-0 text-text ${inputClassName} ${startContent ? "pl-2" : ""} ${endContent ? "pr-2" : ""}`;

    const handleChangeText = (text: string) => {
      onChangeText?.(text);
      onValueChange?.(text);
    };

    return (
      <View className={baseClasses} style={classNames?.base}>
        {label && (
          <Text className={baseLabelClasses} style={classNames?.label}>
            {label}
            {isRequired && <Text className="text-red-500"> *</Text>}
          </Text>
        )}
        <View className={baseWrapperClasses} style={classNames?.inputWrapper}>
          {startContent && (
            <View className="pl-3 justify-center">{startContent}</View>
          )}

          <TextInput
            ref={ref}
            className={baseInputClasses}
            style={classNames?.input}
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
            <View className="pr-3 justify-center">{endContent}</View>
          )}
        </View>
        i
        {description && !errorMessage && (
          <Text
            className="text-xs mt-1 text-light-tabIconDefault text-tabIconDefault opacity-70"
            style={classNames?.description}
          >
            {description}
          </Text>
        )}
        {errorMessage && (
          <Text
            className="text-xs text-red-500 mt-1"
            style={classNames?.errorMessage}
          >
            {errorMessage}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";

export default Input;
