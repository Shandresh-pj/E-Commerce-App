import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

const TAB_CONFIG: Record<string, { label: string; emoji: string }> = {
  PartnerHomeTab: { label: 'Home', emoji: '🏠' },
  PartnerEarnings: { label: 'Earnings', emoji: '💰' },
  PartnerOrders: { label: 'Orders', emoji: '📦' },
  PartnerStats: { label: 'Stats', emoji: '📊' },
  PartnerProfile: { label: 'Profile', emoji: '👤' },
}

const PartnerTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[st.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
      <View style={st.tabRow}>
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
              style={st.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Text style={st.emoji}>{config.emoji}</Text>
              <Text
                style={[
                  st.label,
                  {
                    color: isFocused ? PARTNER_COLOR.lime : PARTNER_COLOR.textSecondary,
                    fontFamily: isFocused ? PARTNER_FONT.bold : PARTNER_FONT.medium,
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

const st = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: PARTNER_COLOR.border,
    paddingTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  emoji: { fontSize: 20, lineHeight: 24 },
  label: { fontSize: 10.5, letterSpacing: 0.1, textAlign: 'center' },
})

export default PartnerTabBar
