import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS } from '../tokens/radius';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: keyof typeof RADIUS;
  style?: ViewStyle;
}

export const SkeletonState: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  radius = 'sm',
  style,
}) => {
  const { tokens } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: RADIUS[radius],
          backgroundColor: tokens.surface.interactive,
          opacity,
        },
        style,
      ]}
    />
  );
};
