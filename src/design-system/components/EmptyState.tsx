import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { TYPOGRAPHY } from '../tokens/typography';
import { SPACING } from '../tokens/spacing';
import {
  EmptyCartIllustration,
  EmptyWishlistIllustration,
  NoOrdersIllustration,
  NoResultsIllustration,
  ConnectionErrorIllustration,
} from '../../view/elements/SvgIllustrations';

export interface EmptyStateProps {
  type?: 'cart' | 'wishlist' | 'orders' | 'search' | 'error' | 'generic';
  icon?: string;
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  const { tokens, isDark } = useTheme();

  const lowerTitle = title.toLowerCase();
  let resolvedType = type;
  if (resolvedType === 'generic') {
    if (lowerTitle.includes('cart')) resolvedType = 'cart';
    else if (lowerTitle.includes('wishlist') || lowerTitle.includes('favorite')) resolvedType = 'wishlist';
    else if (lowerTitle.includes('order')) resolvedType = 'orders';
    else if (lowerTitle.includes('search') || lowerTitle.includes('found') || lowerTitle.includes('result')) resolvedType = 'search';
    else if (lowerTitle.includes('error') || lowerTitle.includes('connection')) resolvedType = 'error';
  }

  const renderIllustration = () => {
    switch (resolvedType) {
      case 'cart':
        return <EmptyCartIllustration size={160} isDark={isDark} />;
      case 'wishlist':
        return <EmptyWishlistIllustration size={160} isDark={isDark} />;
      case 'orders':
        return <NoOrdersIllustration size={160} isDark={isDark} />;
      case 'search':
        return <NoResultsIllustration size={160} isDark={isDark} />;
      case 'error':
        return <ConnectionErrorIllustration size={160} isDark={isDark} />;
      default:
        return <EmptyCartIllustration size={160} isDark={isDark} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationWrapper}>
        {renderIllustration()}
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
    marginVertical: SPACING.lg,
  },
  illustrationWrapper: {
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.headingM,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyM,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    maxWidth: 300,
  },
  button: {
    minWidth: 180,
  },
});
