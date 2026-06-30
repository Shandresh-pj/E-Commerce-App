import React, { useRef } from 'react'
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { THEME } from '../assets/styles/theme'

type Variant = 'primary' | 'success' | 'outline'
type Size = 'sm' | 'md'

interface PrimaryButtonProps {
  label: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const PrimaryButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  style,
  textStyle,
}: PrimaryButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current

  const isDisabled = disabled || loading

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()

  const containerStyle: ViewStyle[] = [
    styles.base,
    size === 'sm' ? styles.sm : styles.md,
    variant === 'primary' && styles.primary,
    variant === 'success' && styles.success,
    variant === 'outline' && styles.outline,
    isDisabled && variant !== 'outline' && styles.disabled,
    isDisabled && variant === 'outline' && styles.outlineDisabled,
  ].filter(Boolean) as ViewStyle[]

  const labelColor =
    variant === 'outline'
      ? isDisabled
        ? THEME.COLOR.textTertiary
        : THEME.COLOR.primary
      : '#fff'

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={containerStyle}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? THEME.COLOR.primary : '#fff'}
          />
        ) : (
          <>
            {leftIcon}
            <Text
              style={[
                styles.label,
                size === 'sm' && styles.labelSm,
                { color: labelColor },
                textStyle,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.RADIUS.medium,
    gap: THEME.SPACING.sm,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: THEME.SPACING.xl,
  },
  sm: {
    paddingVertical: 9,
    paddingHorizontal: THEME.SPACING.lg,
  },
  primary: {
    backgroundColor: THEME.COLOR.primary,
  },
  success: {
    backgroundColor: THEME.COLOR.success,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: THEME.COLOR.primary,
  },
  disabled: {
    backgroundColor: THEME.COLOR.bgGrey,
  },
  outlineDisabled: {
    borderColor: THEME.COLOR.border,
  },
  label: {
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Bold,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 13,
  },
})

export default PrimaryButton
