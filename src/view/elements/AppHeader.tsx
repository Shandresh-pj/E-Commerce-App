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
import { useNavigation, DrawerActions } from '@react-navigation/native'
import Svg, { Rect } from 'react-native-svg'
import { THEME } from '../assets/styles/theme'
import { ChevronLeftIcon } from '../assets/images/svg/Svg2/ChevronLeftIcon'

const HEADER_BG = '#2a2c40'

// ── Reusable round icon button with optional count badge ──────────────────────
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
  <TouchableOpacity
    style={[styles.iconBtn, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {children}
    {badge !== undefined && badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </TouchableOpacity>
)

const MenuIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x="3" y="6" width="18" height="2" rx="1" fill="#fff" />
    <Rect x="3" y="11" width="18" height="2" rx="1" fill="#fff" />
    <Rect x="3" y="16" width="18" height="2" rx="1" fill="#fff" />
  </Svg>
)

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
    if (leftIcon === 'menu') {
      navigation.dispatch(DrawerActions.openDrawer())
    } else {
      navigation.goBack()
    }
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={HEADER_BG}
        translucent={false}
      />
      <View style={styles.header}>
        <View style={styles.left}>
          <TouchableOpacity
            style={styles.leftBtn}
            onPress={handleLeft}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {leftIcon === 'menu' ? <MenuIcon /> : <ChevronLeftIcon color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: HEADER_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.SPACING.lg,
    paddingVertical: THEME.SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: THEME.SPACING.md,
  },
  title: {
    flex: 1,
    color: THEME.COLOR.textWhite,
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    letterSpacing: 0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.SPACING.md,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: THEME.COLOR.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: HEADER_BG,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
})

export default AppHeader
