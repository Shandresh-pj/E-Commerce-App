import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
  const { isDark } = useTheme()
  const activeIndex = state.index
  const totalTabs = state.routes.filter(r => TAB_CONFIG[r.name]).length

  const tabWidth = SCREEN_WIDTH / (totalTabs || 1)
  const activeSlideX = useSharedValue(activeIndex * tabWidth)

  useEffect(() => {
    activeSlideX.value = withSpring(activeIndex * tabWidth, {
      damping: 18,
      stiffness: 220,
    })
  }, [activeIndex, tabWidth, activeSlideX])

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeSlideX.value }],
    width: tabWidth - 16,
    marginHorizontal: 8,
  }))

  return (
    <LinearGradient
      colors={isDark ? ['#0F172A', '#1E293B'] : ['#0F172A', '#1E40AF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
      ]}
    >
      {/* 144FPS Animated Active Indicator Pill */}
      <Animated.View style={[styles.activePillContainer, animatedPillStyle]}>
        <LinearGradient
          colors={['#2563EB', '#1E40AF']}
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
  )
}

function TabButton({
  config,
  isFocused,
  onPress,
  onLongPress,
  tabWidth,
}: {
  config: { label: string; icon: React.FC<{ color: string; size?: number }> }
  isFocused: boolean
  onPress: () => void
  onLongPress: () => void
  tabWidth: number
}) {
  const scale = useSharedValue(isFocused ? 1.05 : 1)

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.08 : 1, {
      damping: 15,
      stiffness: 240,
    })
  }, [isFocused, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const IconComponent = config.icon
  const activeColor = '#FBBF24'
  const inactiveColor = '#94A3B8'
  const currentColor = isFocused ? activeColor : inactiveColor

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabItem, { width: tabWidth }, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <IconComponent color={currentColor} size={22} />
      <Text
        style={[
          styles.label,
          {
            color: currentColor,
            fontWeight: isFocused ? '700' : '500',
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
  container: {
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  activePillContainer: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 18,
    overflow: 'hidden',
  },
  activePillGradient: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 4,
  },
})

export default PremiumTabBar
