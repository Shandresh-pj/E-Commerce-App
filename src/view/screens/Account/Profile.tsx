import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  StyleSheet,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native'
import { fetchMyProfile } from '../../../shared/services/main-service'
import { logout } from '../../../shared/redux/actions/auth.action'
import Defaults from '../../../config'
import LinearGradient from 'react-native-linear-gradient'

interface ProfileData {
  Id: number
  FirstName: string
  LastName: string | null
  Email: string
  MobileNumber: string
  AvailablePoints: number
  image?: string
  [key: string]: any
}

const MENU_ACCOUNT = [
  { icon: '📦', label: 'Your orders', bg: '#FFF4D6', screen: 'MyOrders', badge: '' },
  { icon: '🤍', label: 'Wishlist', bg: '#FFEBEA', screen: 'WishList', badge: '' },
  { icon: '📍', label: 'Saved addresses', bg: '#E4F6E6', screen: 'Addresses', badge: '' },
  { icon: '💳', label: 'Payment methods', bg: '#EBE4FF', screen: 'PaymentMethods', badge: '' },
  { icon: '🎟️', label: 'Coupons & offers', bg: '#FFE9E0', screen: 'Coupons', badge: '3 new' },
]

const MENU_SUPPORT = [
  { icon: '💬', label: 'Help & support', bg: '#E4F6E6', screen: 'ContactUs' },
  { icon: '⭐', label: 'Rate the app', bg: '#FFF4D6', screen: null },
]

const ProfileScreen = (props: any) => {
  const navigation = useNavigation<any>()
  const { dispatch } = props
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [notifications, setNotifications] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, []),
  )

  const loadProfile = async () => {
    setLoading(true)
    setImageError(false)
    try {
      const data = await fetchMyProfile()
      if (data) {
        if (data.name && !data.FirstName) {
          const parts = data.name.trim().split(/\s+/)
          data.FirstName = parts[0] || ''
          data.LastName = parts.slice(1).join(' ') || ''
        }
        if (data.email && !data.Email) data.Email = data.email
        if (data.mobilenumber && !data.MobileNumber) data.MobileNumber = data.mobilenumber
        setProfile(data)
      }
    } catch (e) {
      console.log('Profile fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          if (dispatch) dispatch(logout())
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
          )
        },
      },
    ])
  }

  const getAvatarUri = (): string | undefined => {
    if (!profile?.image) return undefined
    if (profile.image.startsWith('http')) return profile.image
    return `${Defaults.apis.baseUrl}${profile.image.startsWith('/') ? '' : '/'}${profile.image}`
  }

  const initials = profile
    ? ((profile.FirstName?.slice(0, 1) ?? '') + (profile.LastName?.slice(0, 1) ?? ''))
    : '?'
  const fullName = profile
    ? `${profile.FirstName ?? ''}${profile.LastName ? ' ' + profile.LastName : ''}`.trim()
    : '—'

  if (loading) {
    return (
      <LinearGradient colors={['#FFE000', '#FFFCE8', '#E9EDEE']} style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFE000" translucent={false} />
        <View style={s.center}>
          <ActivityIndicator size="large" color="#141414" />
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#FFE000', '#FFFBE0', '#EDEFEA']} locations={[0, 0.24, 1]} style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFE000" translucent={false} />
      <SafeAreaView style={s.safe} edges={[]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Yellow Header */}
          <View style={s.header}>
            <View style={s.headerTopRow}>
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                <Text style={s.backArrow}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditProfile', { profile })}>
                <Text style={s.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
            <View style={s.profileRow}>
              <View style={s.avatar}>
                {getAvatarUri() && !imageError ? (
                  <Image source={{ uri: getAvatarUri() }} style={s.avatarImg} onError={() => setImageError(true)} />
                ) : (
                  <Text style={s.avatarText}>{initials.toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName} numberOfLines={1}>{fullName}</Text>
                <Text style={s.userSub}>{profile?.MobileNumber ? `+91 ${profile.MobileNumber}` : profile?.Email || ''}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statDark}>
              <Text style={{ fontSize: 18 }}>⚡</Text>
              <Text style={s.statValueYellow}>{(profile?.AvailablePoints ?? 0).toLocaleString('en-IN')}</Text>
              <Text style={s.statLabelDark}>Wallet points</Text>
            </View>
            <View style={s.statGlass}>
              <Text style={{ fontSize: 18 }}>🎉</Text>
              <Text style={s.statValueGreen}>₹0</Text>
              <Text style={s.statLabelGlass}>Total saved</Text>
            </View>
            <View style={s.statGlass}>
              <Text style={{ fontSize: 18 }}>📦</Text>
              <Text style={s.statValueDark}>{profile?.OrdersCount ?? 0}</Text>
              <Text style={s.statLabelGlass}>Orders</Text>
            </View>
          </View>

          {/* Account */}
          <Text style={s.sectionLabel}>ACCOUNT</Text>
          <View style={s.menuCard}>
            {MENU_ACCOUNT.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[s.menuRow, idx < MENU_ACCOUNT.length - 1 && s.menuBorder]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                activeOpacity={0.75}
              >
                <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 17 }}>{item.icon}</Text>
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                {!!item.badge && (
                  <View style={s.badge}><Text style={s.badgeText}>{item.badge}</Text></View>
                )}
                <Text style={s.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preferences */}
          <Text style={s.sectionLabel}>PREFERENCES</Text>
          <View style={s.menuCard}>
            <TouchableOpacity
              style={[s.menuRow, s.menuBorder]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={[s.menuIcon, { backgroundColor: '#E0F0FF' }]}>
                <Text style={{ fontSize: 17 }}>🔔</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.menuLabel}>Order notifications</Text>
                <Text style={s.menuSub}>Live updates & offers</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D9D9D5', true: '#0C831F' }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={s.menuRow} activeOpacity={0.75} onPress={() => navigation.navigate('Language')}>
              <View style={[s.menuIcon, { backgroundColor: '#E0F0FF' }]}>
                <Text style={{ fontSize: 17 }}>🌐</Text>
              </View>
              <Text style={s.menuLabel}>Language</Text>
              <Text style={s.menuValue}>English</Text>
              <Text style={s.menuChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Support */}
          <Text style={s.sectionLabel}>SUPPORT</Text>
          <View style={s.menuCard}>
            {MENU_SUPPORT.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[s.menuRow, idx < MENU_SUPPORT.length - 1 && s.menuBorder]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                activeOpacity={0.75}
              >
                <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 17 }}>{item.icon}</Text>
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={s.logoutText}>Log out</Text>
          </TouchableOpacity>

          <Text style={s.version}>Made with ⚡ • v1.0</Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 30 },

  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 26 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(20,20,20,0.08)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 17, color: '#141414' },
  editBtn: { backgroundColor: 'rgba(20,20,20,0.08)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10 },
  editBtnText: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#141414' },

  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 62, height: 62 },
  avatarText: { fontFamily: 'DMSans-Bold', fontSize: 24, color: '#FFE000' },
  userName: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#141414', letterSpacing: -0.3 },
  userSub: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#141414', opacity: 0.7, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginTop: -14 },
  statDark: { flex: 1, backgroundColor: '#141414', borderRadius: 16, padding: 13 },
  statGlass: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 16,
    padding: 13,
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  statValueYellow: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#FFE000', marginTop: 5 },
  statValueGreen: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#0C831F', marginTop: 5 },
  statValueDark: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#141414', marginTop: 5 },
  statLabelDark: { fontFamily: 'DMSans-Bold', fontSize: 10.5, color: '#aaa', marginTop: 1 },
  statLabelGlass: { fontFamily: 'DMSans-Bold', fontSize: 10.5, color: '#9a9a9a', marginTop: 1 },

  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#8a8a8a',
    marginTop: 20,
    marginBottom: 9,
    marginHorizontal: 18,
  },

  menuCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F0' },
  menuIcon: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  menuSub: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#9a9a9a', marginTop: 2 },
  menuValue: { fontFamily: 'DMSans-Medium', fontSize: 13.5, color: '#9a9a9a', marginRight: 4 },
  menuChevron: { fontSize: 18, color: '#bbb' },
  badge: { backgroundColor: '#FFE000', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, marginRight: 4 },
  badgeText: { fontFamily: 'DMSans-Bold', fontSize: 11, color: '#141414' },

  logoutBtn: {
    marginHorizontal: 14,
    marginTop: 20,
    height: 54,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5,
    borderColor: '#F2C7C2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#C0392B' },

  version: { textAlign: 'center', color: '#b4b4b0', fontSize: 12, fontFamily: 'DMSans-Medium', marginTop: 16 },
})

export default ProfileScreen
