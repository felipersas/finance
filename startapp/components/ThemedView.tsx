
import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};


export function ThemedView({ style, lightColor, darkColor, children, ...otherProps }: ThemedViewProps & { children?: React.ReactNode }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Runtime check: warn if a string is passed directly as a child
  if (typeof children === 'string') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Text strings must be rendered within a <Text> component. Found in <ThemedView>.');
    }
  }

  return (
    <View style={[{ backgroundColor }, style]} {...otherProps}>
      {children}
    </View>
  );
}
