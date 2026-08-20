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
import { scaleFont } from '../../constants/theme'
import { useTheme } from '../../shared/context/ThemeContext'
import { ArrowLeftIcon } from './SvgIcons'

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
  const { colors, isDark } = useTheme()
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
        colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.iconBtn, { borderColor: colors.border }, style]}
      >
        {children}
        {badge !== undefined && badge > 0 && (
          <View style={[s.badge, { backgroundColor: colors.accent }]}>
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

export const AppHeader = ({
  title,
  leftIcon = 'back',
  onLeftPress,
  right,
}: AppHeaderProps) => {
  const navigation = useNavigation<any>()
  const { colors, isDark } = useTheme()

  const handleLeft = () => {
    if (onLeftPress) return onLeftPress()
    navigation.goBack()
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={[s.headerWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceCard }]}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <View style={s.left}>
            <HeaderIconButton onPress={handleLeft}>
              {leftIcon === 'menu' ? (
                <Text style={{ fontSize: 18, color: colors.textPrimary }}>☰</Text>
              ) : (
                <ArrowLeftIcon size={20} color={colors.textPrimary} />
              )}
            </HeaderIconButton>
            <Text style={[s.title, { color: colors.textPrimary }]} numberOfLines={1}>
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
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  title: {
    flex: 1,
    fontSize: scaleFont(17),
    fontWeight: '700',
    marginLeft: 12,
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
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: { color: '#0F172A', fontSize: 9, fontWeight: '800' },
})

export default AppHeader
