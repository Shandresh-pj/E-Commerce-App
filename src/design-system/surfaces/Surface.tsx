import React from 'react';
import { View, ViewStyle, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ELEVATION, ElevationLevel } from '../tokens/elevation';
import { RADIUS, RadiusValue } from '../tokens/radius';

export interface SurfaceProps {
  variant?:
    | 'base'
    | 'secondary'
    | 'card'
    | 'elevated'
    | 'floating'
    | 'interactive'
    | 'selected'
    | 'glass';
  elevation?: ElevationLevel;
  radius?: RadiusValue;
  bordered?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  children?: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  variant = 'card',
  elevation = 'none',
  radius = 'md',
  bordered = false,
  onPress,
  disabled = false,
  style,
  children,
}) => {
  const { tokens, isDark } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'base':
        return tokens.surface.base;
      case 'secondary':
        return tokens.surface.secondary;
      case 'card':
        return tokens.surface.card;
      case 'elevated':
        return tokens.surface.elevated;
      case 'floating':
        return tokens.surface.floating;
      case 'interactive':
        return tokens.surface.interactive;
      case 'selected':
        return tokens.surface.selected;
      case 'glass':
        return tokens.surface.glass;
      default:
        return tokens.surface.card;
    }
  };

  const getBorderColor = () => {
    if (variant === 'selected') return tokens.border.focus;
    if (variant === 'glass') return tokens.surface.glassBorder;
    if (bordered) return tokens.border.default;
    return 'transparent';
  };

  const surfaceStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: RADIUS[radius],
    borderColor: getBorderColor(),
    borderWidth: bordered || variant === 'selected' || variant === 'glass' ? 1 : 0,
    ...ELEVATION[elevation],
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          surfaceStyle,
          pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[surfaceStyle, style]}>{children}</View>;
};
