import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Share,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';
import { fetchMyProfile } from '../../../shared/services/main-service';
import { logout } from '../../../shared/redux/actions/auth.action';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Defaults from '../../../config';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  header: '#1a1b2e',
  accent: '#7C6EF5',
  accentLight: 'rgba(124,110,245,0.1)',
  text: '#1C1C2E',
  textMid: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  dangerLight: 'rgba(239,68,68,0.09)',
  green: '#22C55E',
  greenLight: 'rgba(34,197,94,0.1)',
  border: '#F0F1F5',
  shadow: '#1C1C2E',
};

Dimensions.get('window');

// ─── Inline icon set ──────────────────────────────────────────────────────────
const Icon = {
  EditProfile: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Orders: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="9" y="3" width="6" height="4" rx="1" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12h6M9 16h4" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Wishlist: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Address: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={12} cy={10} r={3} stroke={C.accent} strokeWidth={1.8} />
    </Svg>
  ),

  Support: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={C.accent} strokeWidth={1.8} />
      <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  About: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={C.accent} strokeWidth={1.8} />
      <Path d="M12 8h.01M12 12v4" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Share: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={18} cy={5} r={3} stroke={C.accent} strokeWidth={1.8} />
      <Circle cx={6} cy={12} r={3} stroke={C.accent} strokeWidth={1.8} />
      <Circle cx={18} cy={19} r={3} stroke={C.accent} strokeWidth={1.8} />
      <Path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  ),
  Logout: () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={C.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  ChevronRight: ({ color = C.textLight }: { color?: string }) => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  Id: number;
  FirstName: string;
  LastName: string | null;
  Email: string;
  MobileNumber: string;
  UserType: string;
  ReferralCode: string;
  AadharNumber: string;
  AvailablePoints: number;
  TotalCreditPoints: number;
  TotalDebitPoints: number;
  CreatedAt: string;
  DOB: string | null;
  image?: string;
  Status: { StatusCode: string };
}

// ─── Animated menu row ────────────────────────────────────────────────────────
interface MenuRowProps {
  IconComp: React.FC;
  label: string;
  sublabel?: string;
  iconBg: string;
  onPress: () => void;
  isLast?: boolean;
  showChevron?: boolean;
}

const MenuRow: React.FC<MenuRowProps> = ({
  IconComp, label, sublabel, iconBg, onPress, isLast, showChevron = true,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View style={[s.menuRow, { transform: [{ scale }] }]}>
          <View style={[s.menuIconWrap, { backgroundColor: iconBg }]}>
            <IconComp />
          </View>
          <View style={s.menuTextWrap}>
            <Text style={s.menuLabel}>{label}</Text>
            {sublabel ? <Text style={s.menuSublabel}>{sublabel}</Text> : null}
          </View>
          {showChevron && <Icon.ChevronRight />}
        </Animated.View>
      </TouchableOpacity>
      {!isLast && <View style={s.rowDivider} />}
    </>
  );
};



// ─── Main screen ──────────────────────────────────────────────────────────────
const ProfileScreen = (props: any) => {
  const navigation = useNavigation<any>();
  const { dispatch } = props;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    setLoading(true);
    setImageError(false);
    try {
      const data = await fetchMyProfile();
      if (data) {
        if (data.name && !data.FirstName) {
          const parts = data.name.trim().split(/\s+/);
          data.FirstName = parts[0] || '';
          data.LastName = parts.slice(1).join(' ') || '';
        }
        if (data.email && !data.Email) data.Email = data.email;
        if (data.mobilenumber && !data.MobileNumber) data.MobileNumber = data.mobilenumber;
        if (data.usertype && !data.UserType) data.UserType = data.usertype;
        if (data.status && !data.Status) {
          data.Status = { StatusCode: String(data.status).toUpperCase() };
        }
        if (data.created_at && !data.CreatedAt) data.CreatedAt = data.created_at;
        setProfile(data);
      }
    } catch (e) {
      console.log('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          if (dispatch) dispatch(logout());
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'HomeDrawer',
                  state: { routes: [{ name: 'Login' }] },
                },
              ],
            }),
          );
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing shopping app! Download now.',
        title: 'Share the App',
      });
    } catch (e) { }
  };

  const getAvatarUri = (): string | undefined => {
    if (!profile?.image) return undefined;
    if (profile.image.startsWith('http://') || profile.image.startsWith('https://')) {
      return profile.image;
    }
    return `${Defaults.apis.baseUrl}${profile.image.startsWith('/') ? '' : '/'}${profile.image}`;
  };

  const initials = profile
    ? (profile.FirstName?.slice(0, 1) ?? '') + (profile.LastName?.slice(0, 1) ?? '')
    : '?';

  const fullName = profile
    ? `${profile.FirstName ?? ''}${profile.LastName ? ' ' + profile.LastName : ''}`
    : '—';

  const isActive = profile?.Status?.StatusCode === 'ACTIVE';

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.header} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.header }} />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={s.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* ── Header card ─────────────────────────────────── */}
          <View style={s.headerCard}>
            {/* Avatar */}
            <View style={s.avatarOuter}>
              {getAvatarUri() && !imageError ? (
                <Image
                  source={{ uri: getAvatarUri() }}
                  style={s.avatarImg}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={s.avatarInner}>
                  <Text style={s.avatarText}>{initials.toUpperCase()}</Text>
                </View>
              )}
            </View>

            <Text style={s.fullName}>{fullName}</Text>
            <Text style={s.email}>{profile?.Email ?? ''}</Text>

            {/* Status badge */}
            <View style={[s.statusBadge, isActive ? s.statusActive : s.statusInactive]}>
              <View style={[s.statusDot, { backgroundColor: isActive ? C.green : C.danger }]} />
              <Text style={[s.statusText, { color: isActive ? C.green : C.danger }]}>
                {isActive ? 'Active Account' : 'Inactive'}
              </Text>
            </View>

          </View>

          {/* ── Menu group 1: Account ────────────────────────── */}
          <Text style={s.groupLabel}>My Account</Text>
          <View style={s.card}>
            <MenuRow
              IconComp={Icon.EditProfile}
              iconBg={C.accentLight}
              label="Edit Profile"
              sublabel="Update your personal details"
              onPress={() => navigation.navigate('EditProfile', { profile })}
            />
            <MenuRow
              IconComp={Icon.Orders}
              iconBg={C.accentLight}
              label="My Orders"
              sublabel="Track, return or buy again"
              onPress={() => navigation.navigate('MyOrders')}
            />
            <MenuRow
              IconComp={Icon.Wishlist}
              iconBg={C.accentLight}
              label="Wishlist"
              sublabel="Items you've saved"
              onPress={() => navigation.navigate('WishList')}
            />
            <MenuRow
              IconComp={Icon.Address}
              iconBg={C.accentLight}
              label="Saved Addresses"
              sublabel="Manage delivery locations"
              onPress={() => navigation.navigate('Addresses')}
              isLast
            />
          </View>

          {/* ── Menu group 2: Preferences ───────────────────── */}
          <Text style={s.groupLabel}>Preferences</Text>
          <View style={s.card}>
            <MenuRow
              IconComp={Icon.Support}
              iconBg={C.accentLight}
              label="Help & Support"
              sublabel="FAQs, chat, and contact"
              onPress={() => navigation.navigate('ContactUs')}
            />
            <MenuRow
              IconComp={Icon.About}
              iconBg={C.accentLight}
              label="About"
              sublabel="Version, terms & privacy"
              onPress={() => { }}
            />
            <MenuRow
              IconComp={Icon.Share}
              iconBg={C.accentLight}
              label="Share the App"
              sublabel="Invite friends & earn rewards"
              onPress={handleShare}
              isLast
            />
          </View>

          {/* ── Logout ─────────────────────────────────────────── */}
          <View style={[s.card, s.logoutCard]}>
            <MenuRow
              IconComp={Icon.Logout}
              iconBg={C.dangerLight}
              label="Log Out"
              onPress={handleLogout}
              isLast
              showChevron={false}
            />
          </View>

          {/* Member since footer */}
          {profile?.CreatedAt ? (
            <Text style={s.memberSince}>
              Member since{' '}
              {new Date(profile.CreatedAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  scroll: {
    paddingBottom: 100,
  },

  /* Header card */
  headerCard: {
    backgroundColor: C.header,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 24,
    // shadow
    shadowColor: C.header,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(124,110,245,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2.5,
    borderColor: C.accent,
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusActive: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  /* Group label */
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMid,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },

  /* Card */
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)',
  },

  /* Menu row */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: C.text,
    letterSpacing: 0.1,
  },
  menuSublabel: {
    fontSize: 12,
    color: C.textMid,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 72,
  },

  /* Footer */
  memberSince: {
    textAlign: 'center',
    color: C.textLight,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
