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
  Dimensions,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native'
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg'
import LinearGradient from 'react-native-linear-gradient'
import { fetchMyProfile } from '../../../shared/services/main-service'
import { logout } from '../../../shared/redux/actions/auth.action'
import Defaults from '../../../config'
import { useTheme } from '../../../shared/context/ThemeContext'

/* Theme SVG Icons */
const SunSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const MoonSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
)

const { width: W } = Dimensions.get('window')
const isSmallDevice = W < 360

interface ProfileData {
  Id: number
  FirstName: string
  LastName: string | null
  Email: string
  MobileNumber: string
  image?: string
  [key: string]: any
}

/* -------------------------------------------------------------------------- */
/*                        CRISP VECTOR SVG ICONS                              */
/* -------------------------------------------------------------------------- */
const OrderSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M7 8H17M7 12H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const HeartSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
)

const AddressSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C16 17.5 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17.5 12 21Z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
)

const PaymentSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M2 10H22" stroke={color} strokeWidth="2" />
  </Svg>
)

const TicketSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 5V7M15 11V13M15 17V19M5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const SupportSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M9.09 9A3 3 0 0 1 15 9C15 11 12 10.75 12 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
)

const StarSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
)

const LogoutSvgIcon = ({ color = '#FF6B6B', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const EditSvgIcon = ({ color = '#0B1B36', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const MENU_ACCOUNT = [
  { icon: OrderSvgIcon, label: 'Your orders', screen: 'MyOrders', badge: '' },
  { icon: HeartSvgIcon, label: 'Wishlist', screen: 'WishList', badge: '' },
  { icon: AddressSvgIcon, label: 'Saved addresses', screen: 'Addresses', badge: '' },
  { icon: PaymentSvgIcon, label: 'Payment methods', screen: 'PaymentMethods', badge: '' },
  { icon: TicketSvgIcon, label: 'Coupons & offers', screen: 'Coupons', badge: '3 new' },
]

const MENU_SUPPORT = [
  { icon: SupportSvgIcon, label: 'Help & support', screen: 'ContactUs' },
  { icon: StarSvgIcon, label: 'Rate the app', screen: null },
]

const ProfileScreen = (props: any) => {
  const { isDark, colors, themeMode, setTheme } = useTheme()
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

  const fullName = profile
    ? `${profile.FirstName || ''}${profile.LastName ? ' ' + profile.LastName : ''}`.trim() || 'Valued Customer'
    : 'Valued Customer'

  const initial = profile?.FirstName?.[0]?.toUpperCase() || 'U'

  const profileImageUrl =
    profile?.image && !imageError
      ? profile.image.startsWith('http')
        ? profile.image
        : `${Defaults.apis.baseUrl}/${profile.image.replace(/^\/+/, '')}`
      : null

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBg} translucent={false} />

      {/* Header */}
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.topNav}
      >
        <Text style={[s.topTitle, { color: '#0B1B36' }]}>My Account</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* User info */}
        <View style={[s.userCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ padding: 24 }} />
          ) : (
            <View style={s.userInfoRow}>
              <View style={s.avatarWrap}>
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={s.avatarImg}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={[s.avatarFallback, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#F0F4FF' }]}>
                    <Text style={[s.avatarText, { color: colors.accent }]}>{initial}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[s.editBadge, { backgroundColor: colors.accent }]}
                  onPress={() => navigation.navigate('EditProfile', { profile })}
                  activeOpacity={0.8}
                >
                  <EditSvgIcon color={colors.accentText} size={13} />
                </TouchableOpacity>
              </View>

              <View style={s.userDetails}>
                <Text style={[s.userName, { color: colors.textPrimary }]} numberOfLines={1}>{fullName}</Text>
                {profile?.Email ? (
                  <Text style={[s.userSub, { color: colors.textSecondary }]} numberOfLines={1}>✉️ {profile.Email}</Text>
                ) : null}
                {profile?.MobileNumber ? (
                  <Text style={[s.userSub, { color: colors.textSecondary }]} numberOfLines={1}>📞 {profile.MobileNumber}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[s.editProfileBtn, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(11, 27, 54, 0.08)' }]}
                onPress={() => navigation.navigate('EditProfile', { profile })}
                activeOpacity={0.8}
              >
                <Text style={[s.editProfileText, { color: colors.accent }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account menu */}
        <Text style={[s.sectionHeader, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <View style={[s.menuBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {MENU_ACCOUNT.map((item, i) => {
            const IconComponent = item.icon
            return (
              <TouchableOpacity
                key={item.label}
                style={[s.menuRow, i < MENU_ACCOUNT.length - 1 && [s.menuBorder, { borderBottomColor: colors.divider }]]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                activeOpacity={0.75}
              >
                <View style={[s.menuIconDot, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(11, 27, 54, 0.06)', borderColor: colors.border }]}>
                  <IconComponent color={colors.accent} size={18} />
                </View>
                <Text style={[s.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                {item.badge ? (
                  <View style={s.badgePill}>
                    <Text style={s.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Text style={[s.menuChevron, { color: colors.textSecondary }]}>›</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Preferences */}
        <Text style={[s.sectionHeader, { color: colors.textSecondary }]}>PREFERENCES</Text>
        <View style={[s.menuBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {/* Theme selector */}
          <View style={[s.menuRow, s.menuBorder, { borderBottomColor: colors.divider }]}>
            <View style={s.menuIconDot}>
              {isDark ? <MoonSvgIcon color="#FBBF24" size={18} /> : <SunSvgIcon color="#FBBF24" size={18} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.menuLabel, { color: colors.textPrimary }]}>App Theme</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'DMSans-Regular' }}>
                {themeMode === 'system' ? 'System default' : themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
              </Text>
            </View>
            <View style={themeStyles.pillContainer}>
              <TouchableOpacity
                style={[themeStyles.pillBtn, themeMode === 'system' && themeStyles.pillActive]}
                onPress={() => setTheme('system')}
              >
                <Text style={[themeStyles.pillText, themeMode === 'system' && themeStyles.pillTextActive]}>Auto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[themeStyles.pillBtn, themeMode === 'light' && themeStyles.pillActive]}
                onPress={() => setTheme('light')}
              >
                <Text style={[themeStyles.pillText, themeMode === 'light' && themeStyles.pillTextActive]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[themeStyles.pillBtn, themeMode === 'dark' && themeStyles.pillActive]}
                onPress={() => setTheme('dark')}
              >
                <Text style={[themeStyles.pillText, themeMode === 'dark' && themeStyles.pillTextActive]}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.menuRow}>
            <View style={s.menuIconDot}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
            <Text style={[s.menuLabel, { color: colors.textPrimary }]}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#18345C', true: '#FBBF24' }}
              thumbColor={notifications ? '#0B1B36' : '#829AB8'}
            />
          </View>
        </View>

        {/* Support menu */}
        <Text style={[s.sectionHeader, { color: colors.textSecondary }]}>SUPPORT & ABOUT</Text>
        <View style={[s.menuBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {MENU_SUPPORT.map((item, i) => {
            const IconComponent = item.icon
            return (
              <TouchableOpacity
                key={item.label}
                style={[s.menuRow, i < MENU_SUPPORT.length - 1 && [s.menuBorder, { borderBottomColor: colors.divider }]]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                activeOpacity={0.75}
              >
                <View style={[s.menuIconDot, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(11, 27, 54, 0.06)', borderColor: colors.border }]}>
                  <IconComponent color={colors.accent} size={18} />
                </View>
                <Text style={[s.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[s.menuChevron, { color: colors.textSecondary }]}>›</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Logout CTA */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogoutSvgIcon color="#FF6B6B" size={18} />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={s.versionText}>Future Believe v2.4.0 • Enterprise Edition</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

/* -------------------------------------------------------------------------- */
/*                               STYLES                                       */
/* -------------------------------------------------------------------------- */
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071224',
  },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
    elevation: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  topTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: isSmallDevice ? 22 : 25,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  /* User Info Card */
  userCard: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#002B66',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#0B1B36',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0B1B36',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#829AB8',
    marginTop: 1,
  },
  editProfileBtn: {
    backgroundColor: '#162C50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  editProfileText: {
    color: '#FBBF24',
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
  },

  /* Reward Banner */
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162C50',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  rewardLeft: { flex: 1 },
  rewardTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12.5,
    color: '#FBBF24',
  },
  rewardSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#829AB8',
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pointsText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#0B1B36',
  },

  /* Section Header */
  sectionHeader: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#829AB8',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* Menu Box */
  menuBox: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuIconDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  badgePill: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: '#FBBF24',
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
  },
  menuChevron: {
    fontSize: 18,
    color: '#829AB8',
    fontFamily: 'DMSans-Bold',
  },

  /* Logout Button */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    gap: 10,
    marginBottom: 16,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
  },
  versionText: {
    color: '#829AB8',
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
})

const themeStyles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pillActive: {
    backgroundColor: '#FBBF24',
  },
  pillText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: '#829AB8',
  },
  pillTextActive: {
    color: '#0B1B36',
  },
})

export default ProfileScreen
