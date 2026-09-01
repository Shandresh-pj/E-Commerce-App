import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PrimaryButton from './PrimaryButton'
import { useTheme } from '../../shared/context/ThemeContext'
import {
  EmptyCartIllustration,
  EmptyWishlistIllustration,
  NoOrdersIllustration,
  NoResultsIllustration,
} from './SvgIllustrations'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  ctaLabel?: string
  onCtaPress?: () => void
}

const EmptyState = ({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
}: EmptyStateProps) => {
  const { isDark, colors } = useTheme()

  const lower = title.toLowerCase()
  let illustration = icon

  if (!illustration) {
    if (lower.includes('wishlist') || lower.includes('favorite')) {
      illustration = <EmptyWishlistIllustration size={150} isDark={isDark} />
    } else if (lower.includes('order')) {
      illustration = <NoOrdersIllustration size={150} isDark={isDark} />
    } else if (lower.includes('search') || lower.includes('found')) {
      illustration = <NoResultsIllustration size={150} isDark={isDark} />
    } else {
      illustration = <EmptyCartIllustration size={150} isDark={isDark} />
    }
  }

  return (
    <View style={styles.container}>
      {illustration ? <View style={styles.iconWrap}>{illustration}</View> : null}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      {ctaLabel && onCtaPress ? (
        <PrimaryButton
          label={ctaLabel}
          onPress={onCtaPress}
          style={styles.cta}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 280,
  },
  cta: {
    marginTop: 20,
    minWidth: 180,
  },
})

export default EmptyState
