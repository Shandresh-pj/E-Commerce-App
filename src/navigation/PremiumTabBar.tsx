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
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { useTheme } from '../shared/context/ThemeContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/* ── Crisp Vector SVG Tab Icons ───────────────────────────────────── */
const HomeTabSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.25L12 3L21 10.25V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.25Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const CategoryTabSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
  </Svg>
)

const CartTabSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V6L18 2H6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 6H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const AccountTabSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4.5" stroke={color} strokeWidth="2" />
    <Path
      d="M4 20C4 16.13 7.58 13 12 13C16.42 13 20 16.13 20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const TAB_CONFIG: Record<string, { label: string; icon: React.FC<{ color: string; size?: number }> }> = {
  HomeTab: { label: 'Home', icon: HomeTabSvgIcon },
  ProductList: { label: 'Categories', icon: CategoryTabSvgIcon },
  Cart: { label: 'Cart', icon: CartTabSvgIcon },
  AccountTab: { label: 'Account', icon: AccountTabSvgIcon },
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
    <LinearGradient
      colors={['#ffff00', '#ffff00']}
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
          colors={['#0B1B36', '#1E3A8A']}
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
  const activeColor = '#ffff00'
  const inactiveColor = '#0066CC'
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
      <IconComponent color={currentColor} size={20} />
      <Text
        style={[
          styles.label,
          {
            color: currentColor,
            fontFamily: isFocused ? 'DMSans-Bold' : 'DMSans-Medium',
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  activePillContainer: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activePillGradient: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
    marginTop: 3,
  },
})

export default PremiumTabBar
