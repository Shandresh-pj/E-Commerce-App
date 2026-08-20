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

type Variant = 'primary' | 'accent' | 'success' | 'dark' | 'outline'
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
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start()

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start()

  const containerStyle: ViewStyle[] = [
    s.base,
    size === 'sm' ? s.sm : s.md,
    variant === 'primary' && s.primary,
    variant === 'accent' && s.accent,
    variant === 'success' && s.success,
    variant === 'dark' && s.dark,
    variant === 'outline' && s.outline,
    isDisabled && s.disabled,
  ].filter(Boolean) as ViewStyle[]

  const labelColor =
    variant === 'accent'
      ? isDisabled ? '#9CA3AF' : '#0F172A'
      : variant === 'outline'
      ? isDisabled ? '#9CA3AF' : '#2563EB'
      : '#FFFFFF'

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
          <ActivityIndicator size="small" color={variant === 'accent' ? '#0F172A' : '#FFFFFF'} />
        ) : (
          <>
            {leftIcon}
            <Text style={[s.label, size === 'sm' && s.labelSm, { color: labelColor }, textStyle]}>
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 8,
  },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  sm: { paddingVertical: 10, paddingHorizontal: 16 },

  primary: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  accent: {
    backgroundColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  success: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dark: { backgroundColor: '#0F172A' },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  disabled: { opacity: 0.45 },

  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  labelSm: { fontSize: 13 },
})

export default PrimaryButton
