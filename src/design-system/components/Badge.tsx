import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS } from '../tokens/radius';
import { TYPOGRAPHY } from '../tokens/typography';

export interface BadgeProps {
  label: string;
  variant?: 'discount' | 'gold' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'discount',
  size = 'sm',
  style,
}) => {
  const { tokens } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return { bg: tokens.brand.goldSoft, text: '#B45309' };
      case 'success':
        return { bg: tokens.semantic.successSoft, text: '#047857' };
      case 'warning':
        return { bg: tokens.semantic.warningSoft, text: '#B45309' };
      case 'error':
        return { bg: tokens.semantic.errorSoft, text: '#B91C1C' };
      case 'info':
        return { bg: tokens.semantic.infoSoft, text: '#1D4ED8' };
      case 'discount':
      default:
        return { bg: tokens.brand.primarySoft, text: tokens.brand.primary };
    }
  };

  const variantStyle = getVariantStyles();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 6 : 10,
          borderRadius: RADIUS.xs,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variantStyle.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
});
