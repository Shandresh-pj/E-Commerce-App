import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LIQUID_GLASS_THEME } from '../../constants/theme'

interface LiquidGlassCardProps extends TouchableOpacityProps {
  gradientColors?: string[]
  borderColor?: string
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  onPress,
  activeOpacity = 0.85,
  gradientColors,
  borderColor = LIQUID_GLASS_THEME.colors.cardBorder,
  style,
  children,
  ...props
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 250 })
      opacity.value = withTiming(0.92, { duration: 100 })
    }
  }

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 })
      opacity.value = withTiming(1, { duration: 150 })
    }
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        style={[styles.wrapper, style]}
        {...props}
      >
        <Animated.View style={[styles.container, { borderColor }, animatedStyle]}>
          {gradientColors ? (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientFill}
            >
              {children}
            </LinearGradient>
          ) : (
            <View style={styles.plainFill}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.3 }}
                style={styles.glossHighlight}
              />
              {children}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    )
  }

  return (
    <Animated.View style={[styles.container, { borderColor }, animatedStyle, style]} {...props}>
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={styles.plainFill}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
            style={styles.glossHighlight}
          />
          {children}
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: LIQUID_GLASS_THEME.borderRadius.lg,
  },
  container: {
    borderRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...LIQUID_GLASS_THEME.shadows.glassSoft,
  },
  gradientFill: {
    padding: 12,
    flex: 1,
  },
  plainFill: {
    padding: 12,
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    borderTopLeftRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    borderTopRightRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    opacity: 0.6,
  },
})

export default LiquidGlassCard
