import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from '../../shared/context/ThemeContext'

interface UniqueGlassCardProps extends TouchableOpacityProps {
  gradientColors?: string[]
  borderColor?: string
}

export const UniqueGlassCard: React.FC<UniqueGlassCardProps> = ({
  onPress,
  activeOpacity = 0.88,
  gradientColors,
  borderColor,
  style,
  children,
  ...props
}) => {
  const { isDark, colors } = useTheme()
  const scale = useSharedValue(1)

  const defaultBorder = borderColor || (isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(0, 0, 0, 0.08)')
  const containerBg = isDark ? 'rgba(11, 27, 54, 0.96)' : '#FFFFFF'

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.96, { damping: 14, stiffness: 260 })
    }
  }

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 })
    }
  }

  const cardContent = (
    <View style={styles.cardInner}>
      {/* Top Gloss Sheen */}
      <LinearGradient
        colors={isDark ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.01)'] : ['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.35 }}
        style={styles.glossSheen}
      />
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.whiteContainer, { backgroundColor: containerBg }]}>{children}</View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        style={[styles.shadowWrapper, style]}
        {...props}
      >
        <Animated.View style={[styles.cardBorder, { borderColor: defaultBorder, backgroundColor: containerBg }, animatedStyle]}>
          {cardContent}
        </Animated.View>
      </TouchableOpacity>
    )
  }

  return (
    <Animated.View style={[styles.shadowWrapper, styles.cardBorder, { borderColor: defaultBorder, backgroundColor: containerBg }, animatedStyle, style]} {...props}>
      {cardContent}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardBorder: {
    borderRadius: 22,
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  cardInner: {
    position: 'relative',
    flex: 1,
  },
  glossSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    zIndex: 2,
    pointerEvents: 'none',
  },
  gradientContainer: {
    padding: 12,
    flex: 1,
  },
  whiteContainer: {
    padding: 12,
    flex: 1,
  },
})

export default UniqueGlassCard
