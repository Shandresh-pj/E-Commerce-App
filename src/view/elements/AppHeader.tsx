import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { LIQUID_GLASS_THEME, scaleFont } from '../../constants/theme'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface HeaderIconButtonProps {
  onPress: () => void
  badge?: number
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export const HeaderIconButton = ({
  onPress,
  badge,
  children,
  style,
}: HeaderIconButtonProps) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 12, stiffness: 220 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 })
  }

  return (
    <AnimatedTouchable
      style={[animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.45)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.iconBtn, style]}
      >
        {children}
        {badge !== undefined && badge > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  )
}

interface AppHeaderProps {
  title: string
  leftIcon?: 'back' | 'menu'
  onLeftPress?: () => void
  right?: React.ReactNode
}

const AppHeader = ({
  title,
  leftIcon = 'back',
  onLeftPress,
  right,
}: AppHeaderProps) => {
  const navigation = useNavigation<any>()

  const handleLeft = () => {
    if (onLeftPress) return onLeftPress()
    navigation.goBack()
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={s.headerWrapper}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.88)',
            'rgba(240,245,255,0.70)',
            'rgba(255,255,255,0.60)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <View style={s.left}>
            <HeaderIconButton onPress={handleLeft}>
              <Text style={s.leftIcon}>{leftIcon === 'menu' ? '☰' : '←'}</Text>
            </HeaderIconButton>
            <Text style={s.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {right ? <View style={s.right}>{right}</View> : null}
        </LinearGradient>
      </View>
    </>
  )
}

const s = StyleSheet.create({
  headerWrapper: {
    borderRadius: LIQUID_GLASS_THEME.borderRadius.lg,
    marginHorizontal: 12,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: LIQUID_GLASS_THEME.colors.glassBorder,
    ...LIQUID_GLASS_THEME.shadows.liquidGlass,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  leftIcon: { fontSize: 18, color: LIQUID_GLASS_THEME.colors.textPrimary },
  title: {
    flex: 1,
    color: LIQUID_GLASS_THEME.colors.textPrimary,
    fontSize: scaleFont(17),
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIQUID_GLASS_THEME.colors.glassBorder,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: LIQUID_GLASS_THEME.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
})

export default AppHeader
