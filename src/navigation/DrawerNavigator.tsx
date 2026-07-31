import React, { useEffect, useState } from 'react'
import { createDrawerNavigator, useDrawerStatus } from '@react-navigation/drawer'
import { CommonActions, getFocusedRouteNameFromRoute } from '@react-navigation/native'
import StackNavigator from './StackNavigator'
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { connect } from 'react-redux'
import { logout } from '../shared/redux/actions/auth.action'
import { fetchMyProfile } from '../shared/services/main-service'

const Drawer = createDrawerNavigator()
const DRAWER_DISABLED_ROUTES = ['Splash', 'Login', 'SignUp']

const MENU_ITEMS = [
  { emoji: '🏠', label: 'Home', screen: 'Home', bg: '#FFF4D6' },
  { emoji: '📦', label: 'My Orders', screen: 'MyOrders', bg: '#E4F6E6' },
  { emoji: '👤', label: 'My Profile', screen: 'Profile', bg: '#EBE4FF' },
  { emoji: '🤍', label: 'Wishlist', screen: 'WishList', bg: '#FFE9E0' },
  { emoji: '💬', label: 'Support', screen: 'ContactUs', bg: '#E0F0FF' },
]

const CustomDrawerContent = (props: any) => {
  const { navigation, dispatch } = props
  const drawerStatus = useDrawerStatus()
  const insets = useSafeAreaInsets()
  const [profileName, setProfileName] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  useEffect(() => {
    if (drawerStatus === 'open') loadData()
  }, [drawerStatus])

  const loadData = async () => {
    try {
      const profile = await fetchMyProfile()
      if (profile) {
        const nameParts = (profile.name || '').trim().split(' ')
        setProfileName({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: profile.email || '',
        })
      }
    } catch (error) {
      console.log('Drawer loadData error:', error)
    }
  }

  const initials =
    (profileName.firstName ? profileName.firstName[0].toUpperCase() : '') +
    (profileName.lastName ? profileName.lastName[0].toUpperCase() : '')

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          navigation.closeDrawer()
          dispatch(logout())
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'HomeDrawer', state: { routes: [{ name: 'Login' }] } },
              ],
            }),
          )
        },
      },
    ])
  }

  return (
    <View style={[s.drawerRoot, { paddingTop: insets.top }]}>
      {/* Profile Header */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={s.profileHeader}
        onPress={() => {
          navigation.closeDrawer()
          navigation.navigate('HomeDrawer', { screen: 'Profile' })
        }}
      >
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>{initials || '?'}</Text>
        </View>
        <View style={s.profileInfo}>
          <Text style={s.profileName} numberOfLines={1}>
            {profileName.firstName
              ? `${profileName.firstName}${profileName.lastName ? ' ' + profileName.lastName : ''}`
              : 'Guest User'}
          </Text>
          <Text style={s.profileEmail} numberOfLines={1}>
            {profileName.email || 'Tap to set up profile'}
          </Text>
        </View>
        <Text style={s.profileArrow}>›</Text>
      </TouchableOpacity>

      <View style={s.divider} />

      {/* Menu Items */}
      <ScrollView
        contentContainerStyle={[
          s.menuScroll,
          { paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={s.menuItem}
            onPress={() => {
              navigation.closeDrawer()
              navigation.navigate('HomeDrawer', { screen: item.screen })
            }}
            activeOpacity={0.75}
          >
            <View style={[s.menuIconBox, { backgroundColor: item.bg }]}>
              <Text style={s.menuEmoji}>{item.emoji}</Text>
            </View>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={s.logoutDivider} />
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={s.drawerFooter}>
        <Text style={s.footerText}>⚡ Future Believe</Text>
      </View>
    </View>
  )
}

const DrawerNavigator = (props: any) => {
  const { dispatch } = props

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F5F0"
        translucent={false}
      />
      <SafeAreaView edges={['left', 'right', 'top']} style={s.safe}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerType: 'slide',
            drawerHideStatusBarOnOpen: false,
            drawerStyle: { width: '78%', backgroundColor: 'transparent' },
          }}
          drawerContent={(drawerProps: any) => (
            <CustomDrawerContent {...drawerProps} dispatch={dispatch} />
          )}
        >
          <Drawer.Screen
            name="HomeDrawer"
            component={StackNavigator}
            options={({ route }) => {
              const focusedRouteName =
                getFocusedRouteNameFromRoute(route) ?? 'Splash'
              const disableDrawerSwipe =
                DRAWER_DISABLED_ROUTES.includes(focusedRouteName)
              return {
                swipeEnabled: !disableDrawerSwipe,
              }
            }}
          />
        </Drawer.Navigator>
      </SafeAreaView>
    </>
  )
}

const mapStateToProps = (state: any) => {
  const { isLoggedIn, user } = state.auth
  const { messages, otherData } = state
  return { isLoggedIn, messages, otherData, user }
}

export default connect(mapStateToProps)(DrawerNavigator)

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F0' },

  drawerRoot: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#FFE000',
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#141414',
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#9a9a9a',
  },
  profileArrow: {
    fontSize: 22,
    color: '#bbb',
    marginRight: -4,
  },

  divider: {
    height: 1,
    backgroundColor: '#ECECEA',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  logoutDivider: {
    height: 1,
    backgroundColor: '#ECECEA',
    marginHorizontal: 0,
    marginVertical: 12,
  },

  menuScroll: { paddingTop: 4, paddingHorizontal: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 12,
    marginBottom: 2,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: { fontSize: 18 },
  menuLabel: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: 'DMSans-Bold',
    color: '#141414',
  },
  menuChevron: {
    fontSize: 20,
    color: '#bbb',
  },

  logoutBtn: {
    marginHorizontal: 10,
    height: 48,
    backgroundColor: 'rgba(192,57,43,0.08)',
    borderWidth: 1.5,
    borderColor: '#F2C7C2',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#C0392B' },

  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ECECEA',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#bbb',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
