import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'

const TAB_CONFIG: Record<string, { label: string; emoji: string }> = {
  HomeTab: { label: 'Home', emoji: '🏠' },
  ProductList: { label: 'Categories', emoji: '🧇' },
  Cart: { label: 'Cart', emoji: '🛒' },
  AccountTab: { label: 'Account', emoji: '👤' },
}

const PremiumTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        s.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
      ]}
    >
      <View style={s.tabRow}>
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
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.75}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              style={s.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Text style={s.emoji}>{config.emoji}</Text>
              <Text
                style={[
                  s.label,
                  {
                    color: isFocused ? '#141414' : '#9a9a9a',
                    fontFamily: isFocused ? 'DMSans-Bold' : 'DMSans-Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 12,
    paddingTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  emoji: {
    fontSize: 21,
    lineHeight: 26,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
})

export default PremiumTabBar
