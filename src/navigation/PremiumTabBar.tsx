import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from '../shared/context/ThemeContext'
import {
  HomeIcon,
  CategoryIcon,
  HeartIcon,
  CartIcon,
  UserIcon,
} from '../view/elements/SvgIcons'

const TAB_CONFIG: Record<string, { label: string; icon: React.FC<{ color: string; size?: number }> }> = {
  HomeTab: { label: 'Home', icon: HomeIcon },
  ProductList: { label: 'Categories', icon: CategoryIcon },
  WishList: { label: 'Wishlist', icon: HeartIcon },
  Cart: { label: 'Cart', icon: CartIcon },
  AccountTab: { label: 'Profile', icon: UserIcon },
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export const PremiumTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const { isDark } = useTheme()
  const activeIndex = state.index
  const totalTabs = state.routes.filter(r => TAB_CONFIG[r.name]).length

  // Calculate inner tab width based on floating bar width (maxWidth 560 for tablets)
  const barWidth = Math.min(screenWidth - 32, 560)
  const tabWidth = barWidth / (totalTabs || 1)
  const activeSlideX = useSharedValue(activeIndex * tabWidth)

  useEffect(() => {
    activeSlideX.value = withSpring(activeIndex * tabWidth, {
      damping: 20,
      stiffness: 240,
    })
  }, [activeIndex, tabWidth, activeSlideX])

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeSlideX.value }],
    width: tabWidth - 8,
    marginHorizontal: 4,
  }))

  const containerBgColors = isDark
    ? ['rgba(17, 29, 52, 0.92)', 'rgba(8, 17, 38, 0.95)']
    : ['rgba(255, 255, 255, 0.94)', 'rgba(238, 243, 250, 0.94)']

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(255, 255, 255, 0.70)'

  return (
    <View style={[styles.outerWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <LinearGradient
        colors={containerBgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.floatingContainer,
          { width: barWidth, borderColor },
        ]}
      >
        {/* Animated Active Floating Illuminated Pill */}
        <Animated.View style={[styles.activePillContainer, animatedPillStyle]}>
          <LinearGradient
            colors={isDark ? ['#2563EB', '#1D4ED8'] : ['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activePillGradient}
          />
        </Animated.View>

        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index
            const config = TAB_CONFIG[route.name]
            if (!config) return null

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name)
              }
            }

            return (
              <TabButton
                key={route.key}
                config={config}
                isFocused={isFocused}
                isDark={isDark}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: 'tabLongPress', target: route.key })
                }
                tabWidth={tabWidth}
              />
            )
          })}
        </View>
      </LinearGradient>
    </View>
  )
}

function TabButton({
  config,
  isFocused,
  isDark,
  onPress,
  onLongPress,
  tabWidth,
}: {
  config: { label: string; icon: React.FC<{ color: string; size?: number }> }
  isFocused: boolean
  isDark: boolean
  onPress: () => void
  onLongPress: () => void
  tabWidth: number
}) {
  const scale = useSharedValue(isFocused ? 1.08 : 1)

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, {
      damping: 16,
      stiffness: 260,
    })
  }, [isFocused, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const IconComponent = config.icon
  const activeColor = isFocused ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#475569')

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabItem, { width: tabWidth }, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <IconComponent color={activeColor} size={21} />
      <Text
        style={[
          styles.label,
          {
            color: activeColor,
            fontWeight: isFocused ? '800' : '600',
            opacity: isFocused ? 1 : 0.75,
          },
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  floatingContainer: {
    height: 64,
    borderRadius: 26,
    borderWidth: 1.5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  activePillContainer: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 22,
    overflow: 'hidden',
  },
  activePillGradient: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.45)',
    shadowColor: '#F6C453',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.3,
    marginTop: 3,
  },
})

export default PremiumTabBar
