import React from "react";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className = "",
  children,
  ...otherProps
}: ThemedViewProps & { children?: React.ReactNode }) {
  // Runtime check: warn if a string is passed directly as a child
  if (typeof children === "string") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Text strings must be rendered within a <Text> component. Found in <ThemedView>.",
      );
    }
  }

  // Build className with conditional theming
  let finalClassName = className;

  // If custom colors are provided, we'll use inline styles
  // Otherwise, use Tailwind classes
  if (!lightColor && !darkColor) {
    // Use default background from Tailwind
    finalClassName =
      `bg-light-background dark:bg-dark-background ${className}`.trim();
  }

  const inlineStyle =
    lightColor || darkColor
      ? {
          backgroundColor: undefined, // Will be handled by Tailwind or explicit style prop
        }
      : undefined;

  return (
    <View
      className={finalClassName}
      style={[inlineStyle, style]}
      {...otherProps}
    >
      {children}
    </View>
  );
}
