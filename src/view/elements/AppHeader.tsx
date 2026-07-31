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
}: HeaderIconButtonProps) => (
  <TouchableOpacity style={[s.iconBtn, style]} onPress={onPress} activeOpacity={0.8}>
    {children}
    {badge !== undefined && badge > 0 && (
      <View style={s.badge}>
        <Text style={s.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </TouchableOpacity>
)

interface AppHeaderProps {
  title: string
  leftIcon?: 'back' | 'menu'
  onLeftPress?: () => void
  right?: React.ReactNode
}

const AppHeader = ({ title, leftIcon = 'back', onLeftPress, right }: AppHeaderProps) => {
  const navigation = useNavigation<any>()

  const handleLeft = () => {
    if (onLeftPress) return onLeftPress()
    navigation.goBack()
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(255,255,255,0.55)" translucent={false} />
      <View style={s.header}>
        <View style={s.left}>
          <TouchableOpacity
            style={s.leftBtn}
            onPress={handleLeft}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.leftIcon}>{leftIcon === 'menu' ? '☰' : '←'}</Text>
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
        </View>
        {right ? <View style={s.right}>{right}</View> : null}
      </View>
    </>
  )
}

const s = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEA',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  leftBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.34)',
    marginRight: 12,
  },
  leftIcon: { fontSize: 17, color: '#141414' },
  title: {
    flex: 1,
    color: '#141414',
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#FFE000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#141414', fontSize: 9, fontFamily: 'DMSans-Bold' },
})

export default AppHeader
