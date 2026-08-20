import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS } from '../tokens/radius';
import { TYPOGRAPHY } from '../tokens/typography';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
}) => {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? tokens.brand.primary : tokens.surface.secondary,
          borderColor: selected ? tokens.brand.primary : tokens.border.default,
          borderRadius: RADIUS.full,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.text,
          {
            color: selected ? '#FFFFFF' : tokens.content.primary,
            marginLeft: icon ? 6 : 0,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginRight: 8,
    marginVertical: 4,
  },
  text: {
    ...TYPOGRAPHY.label,
  },
});
