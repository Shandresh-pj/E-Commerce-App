import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

interface UniqueGlassCardProps extends TouchableOpacityProps {
  gradientColors?: string[]
  borderColor?: string
}

export const UniqueGlassCard: React.FC<UniqueGlassCardProps> = ({
  onPress,
  activeOpacity = 0.88,
  gradientColors,
  borderColor = 'rgba(255, 255, 255, 0.8)',
  style,
  children,
  ...props
}) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95, { damping: 14, stiffness: 260 })
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
        colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.1)']}
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
        <View style={styles.whiteContainer}>{children}</View>
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
        <Animated.View style={[styles.cardBorder, { borderColor }, animatedStyle]}>
          {cardContent}
        </Animated.View>
      </TouchableOpacity>
    )
  }

  return (
    <Animated.View style={[styles.shadowWrapper, styles.cardBorder, { borderColor }, animatedStyle, style]} {...props}>
      {cardContent}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 5,
  },
  cardBorder: {
    borderRadius: 22,
    borderWidth: 1.2,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },
})

export default UniqueGlassCard
