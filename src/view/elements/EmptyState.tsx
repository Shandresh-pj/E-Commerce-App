import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { THEME } from '../assets/styles/theme'
import PrimaryButton from './PrimaryButton'

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
}: EmptyStateProps) => (
  <View style={styles.container}>
    {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {ctaLabel && onCtaPress ? (
      <PrimaryButton
        label={ctaLabel}
        onPress={onCtaPress}
        style={styles.cta}
      />
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.SPACING.xxxl,
    paddingTop: 80,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: THEME.COLOR.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.SPACING.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: THEME.SPACING.sm,
  },
  cta: {
    marginTop: THEME.SPACING.xl,
    minWidth: 180,
  },
})

export default EmptyState
