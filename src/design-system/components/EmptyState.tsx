import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SvkIcon, SvkIconName } from '../icons/SvkIcon';
import { Button } from './Button';
import { TYPOGRAPHY } from '../tokens/typography';
import { SPACING } from '../tokens/spacing';

export interface EmptyStateProps {
  icon?: SvkIconName;
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bag',
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  const { tokens } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: tokens.brand.primarySoft }]}>
        <SvkIcon name={icon} size={48} color={tokens.brand.primary} />
      </View>
      <Text style={[styles.title, { color: tokens.content.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: tokens.content.secondary }]}>
        {subtitle}
      </Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
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
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.headingM,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyM,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 180,
  },
});
