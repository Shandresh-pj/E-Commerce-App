import React from 'react'
import {
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { LIQUID_GLASS_THEME, scaleFont } from '../../constants/theme'

const AnimatedTouchable = Animated.createAnimatedComponent(
  Animated.View
)

interface LiquidGlassButtonProps extends TouchableOpacityProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'glass' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  textStyle,
  ...props
}) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 14, stiffness: 220 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 })
  }

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#2563EB', '#3B82F6', '#60A5FA']
      case 'accent':
        return ['#EF4444', '#F87171', '#FCA5A5']
      case 'secondary':
        return ['rgba(255, 255, 255, 0.9)', 'rgba(241, 245, 249, 0.85)']
      case 'glass':
      default:
        return [
          'rgba(255, 255, 255, 0.65)',
          'rgba(255, 255, 255, 0.35)',
          'rgba(255, 255, 255, 0.55)',
        ]
    }
  }

  const getTextColor = () => {
    if (variant === 'secondary' || variant === 'glass') {
      return LIQUID_GLASS_THEME.colors.textPrimary
    }
    return '#FFFFFF'
  }

  const paddingVertical =
    size === 'sm' ? 8 : size === 'lg' ? 16 : 12
  const paddingHorizontal =
    size === 'sm' ? 16 : size === 'lg' ? 28 : 20
  const fontSize = scaleFont(size === 'sm' ? 12 : size === 'lg' ? 16 : 14)

  return (
    <AnimatedTouchable style={[animatedStyle, style]}>
      <Animated.View
        onTouchStart={handlePressIn}
        onTouchEnd={() => {
          handlePressOut()
          onPress()
        }}
        style={[
          styles.buttonWrapper,
          variant === 'glass' && LIQUID_GLASS_THEME.shadows.liquidGlass,
          variant === 'primary' && LIQUID_GLASS_THEME.shadows.subtleGlow,
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              paddingVertical,
              paddingHorizontal,
              borderColor:
                variant === 'glass' || variant === 'secondary'
                  ? LIQUID_GLASS_THEME.colors.glassBorder
                  : 'rgba(255, 255, 255, 0.5)',
            },
          ]}
        >
          {/* Subtle gloss highlight */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={styles.glossHighlight}
          />
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: LIQUID_GLASS_THEME.borderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LIQUID_GLASS_THEME.borderRadius.full,
    borderWidth: 1.2,
    gap: 8,
    position: 'relative',
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderTopLeftRadius: LIQUID_GLASS_THEME.borderRadius.full,
    borderTopRightRadius: LIQUID_GLASS_THEME.borderRadius.full,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
})

export default LiquidGlassButton
