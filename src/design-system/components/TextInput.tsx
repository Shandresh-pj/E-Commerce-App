import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  Pressable,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SPACING } from '../tokens/spacing';
import { RADIUS } from '../tokens/radius';
import { TYPOGRAPHY } from '../tokens/typography';
import { SvkIcon } from '../icons/SvkIcon';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { tokens } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: tokens.content.secondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: tokens.surface.secondary,
            borderColor: error
              ? tokens.semantic.error
              : isFocused
              ? tokens.border.focus
              : tokens.border.default,
            borderRadius: RADIUS.md,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <RNTextInput
          style={[
            styles.input,
            TYPOGRAPHY.bodyM,
            { color: tokens.content.primary },
            style,
          ]}
          placeholderTextColor={tokens.content.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: tokens.semantic.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
  },
});
