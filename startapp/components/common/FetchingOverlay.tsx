import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface FetchingOverlayProps {
  active: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  overlayColor?: string;
}

export const FetchingOverlay: React.FC<FetchingOverlayProps> = ({
  active,
  children,
  style,
  overlayColor = 'rgba(0, 0, 0, 0.56)'
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (active) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.32,
            duration: 1100,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      opacity.stopAnimation();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      animation?.stop();
    };
  }, [active, opacity]);

  return (
    <>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { opacity, backgroundColor: overlayColor },
          style,
        ]}
      />
    </>
  );
};
