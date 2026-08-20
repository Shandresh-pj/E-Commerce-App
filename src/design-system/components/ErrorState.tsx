import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SvkIcon } from '../icons/SvkIcon';
import { Button } from './Button';
import { TYPOGRAPHY } from '../tokens/typography';
import { SPACING } from '../tokens/spacing';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'We encountered an unexpected error. Please check your connection and try again.',
  onRetry,
  style,
}) => {
  const { tokens } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: tokens.semantic.errorSoft }]}>
        <SvkIcon name="alertCircle" size={48} color={tokens.semantic.error} />
      </View>
      <Text style={[styles.title, { color: tokens.content.primary }]}>{title}</Text>
      <Text style={[styles.message, { color: tokens.content.secondary }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.headingM,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.bodyM,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 160,
  },
});
