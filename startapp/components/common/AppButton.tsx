import React from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

type ButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
};

export const AppButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  className = "",
  textClassName = "",
}) => {
  const baseClassName = "py-3.5 px-6 rounded-lg items-center my-2";
  const disabledClassName = disabled ? "opacity-50" : "";
  const finalClassName =
    `${baseClassName} ${disabledClassName} ${className}`.trim();

  const baseTextClassName = "font-bold text-base";
  const finalTextClassName = `${baseTextClassName} ${textClassName}`.trim();

  return (
    <TouchableOpacity
      className={finalClassName}
      style={style}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={finalTextClassName} style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
