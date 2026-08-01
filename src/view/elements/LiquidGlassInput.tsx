import React, { useState } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { LIQUID_GLASS_THEME, scaleFont } from '../../constants/theme'

interface LiquidGlassInputProps extends TextInputProps {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({
  leftIcon,
  rightIcon,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  const borderOpacity = useSharedValue(0.4)

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }))

  const handleFocus = (e: any) => {
    setFocused(true)
    borderOpacity.value = withTiming(1, { duration: 200 })
    if (onFocus) onFocus(e)
  }

  const handleBlur = (e: any) => {
    setFocused(false)
    borderOpacity.value = withTiming(0.4, { duration: 200 })
    if (onBlur) onBlur(e)
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[
          focused ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
          focused ? 'rgba(240, 245, 255, 0.75)' : 'rgba(255, 255, 255, 0.45)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.borderOverlay,
            {
              borderColor: focused
                ? LIQUID_GLASS_THEME.colors.primary
                : LIQUID_GLASS_THEME.colors.glassBorder,
            },
            animatedBorderStyle,
          ]}
        />
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={LIQUID_GLASS_THEME.colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, style]}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    overflow: 'hidden',
    ...LIQUID_GLASS_THEME.shadows.liquidGlass,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    position: 'relative',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  iconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: scaleFont(14),
    color: LIQUID_GLASS_THEME.colors.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
  },
})

export default LiquidGlassInput
