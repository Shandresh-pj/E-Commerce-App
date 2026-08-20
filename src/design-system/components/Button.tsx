import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SPACING } from '../tokens/spacing';
import { RADIUS } from '../tokens/radius';
import { TYPOGRAPHY } from '../tokens/typography';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const { tokens } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return {
          bg: tokens.brand.gold,
          text: '#0F172A',
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: tokens.content.primary,
          border: tokens.border.default,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: tokens.brand.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: tokens.semantic.error,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'primary':
      default:
        return {
          bg: tokens.brand.primary,
          text: '#FFFFFF',
          border: 'transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 14,
          typography: TYPOGRAPHY.label,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          typography: TYPOGRAPHY.headingS,
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          typography: TYPOGRAPHY.title,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: RADIUS.md,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              sizeStyle.typography,
              { color: variantStyle.text, fontWeight: '700', textAlign: 'center' },
              leftIcon ? { marginLeft: 8 } : undefined,
              rightIcon ? { marginRight: 8 } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
