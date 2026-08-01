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
import { LIQUID_GLASS_THEME, scaleFont } from '../constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const TAB_CONFIG: Record<string, { label: string; emoji: string }> = {
  HomeTab: { label: 'Home', emoji: '🏠' },
  ProductList: { label: 'Categories', emoji: '🧇' },
  Cart: { label: 'Cart', emoji: '🛒' },
  AccountTab: { label: 'Account', emoji: '👤' },
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export const PremiumTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets()
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
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
      ]}
    >
      {/* Glossy Top Glass Border Line */}
      <View style={styles.topBorderLine} />

      {/* 144FPS Animated Active Indicator Pill */}
      <Animated.View style={[styles.activePillContainer, animatedPillStyle]}>
        <LinearGradient
          colors={['rgba(255, 229, 0, 0.25)', 'rgba(255, 221, 0, 0.15)']}
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
    </View>
  )
}

function TabButton({
  config,
  isFocused,
  onPress,
  onLongPress,
  tabWidth,
}: {
  config: { label: string; emoji: string }
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

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabItem, { width: tabWidth }, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text
        style={[
          styles.label,
          {
            color: isFocused
              ? '#141414'
              : '#8E8E93',
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
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  topBorderLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  activePillContainer: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activePillGradient: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 221, 0, 0.4)',
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
  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontSize: scaleFont(10.5),
    letterSpacing: 0.1,
    marginTop: 2,
  },
})

export default PremiumTabBar
