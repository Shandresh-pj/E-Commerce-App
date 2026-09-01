import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../shared/context/ThemeContext';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { MovingBackground } from '../../elements/MovingBackground';
import { SPACING } from '../../../design-system/tokens/spacing';
import { getAsyncData } from '../../../shared/utils/storage';
import { fetchMyProfile } from '../../../shared/services/main-service';
import authService from '../../../shared/services/auth.service';

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark, themeMode, setTheme } = useTheme();
  const [user, setUser] = useState<any>({
    name: 'SVK Member',
    email: 'member@svkecom.com',
    phone: '+1 555 000 0000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await getAsyncData('user');
        if (stored) {
          setUser((prev: any) => ({ ...prev, ...stored }));
        }
        const apiUser = await fetchMyProfile();
        if (apiUser) {
          setUser((prev: any) => ({
            ...prev,
            name: apiUser.name || apiUser.fullname || prev.name,
            email: apiUser.email || prev.email,
            phone: apiUser.phone || apiUser.mobilenumber || prev.phone,
            avatar: apiUser.avatar || apiUser.image || prev.avatar,
          }));
        }
      } catch (e) {
        console.log('Profile loading error:', e);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const menuSections = [
    {
      title: 'Shopping Details',
      items: [
        { label: 'My Orders', icon: 'truck' as const, route: 'MyOrders' },
        { label: 'Wishlist', icon: 'heart' as const, route: 'WishList' },
        { label: 'Saved Addresses', icon: 'mapPin' as const, route: 'Addresses' },
        { label: 'Payment Methods', icon: 'card' as const, route: 'PaymentMethods' },
      ],
    },
    {
      title: 'Financial & Rewards',
      items: [
        { label: 'SVK Wallet', icon: 'wallet' as const, route: 'Wallet' },
        { label: 'Coupons & Offers', icon: 'tag' as const, route: 'Coupons' },
      ],
    },
    {
      title: 'App Settings & Support',
      items: [
        { label: 'Notifications', icon: 'bell' as const, route: 'Notifications' },
        { label: 'Language', icon: 'globe' as const, route: 'Language' },
        { label: 'Legal & Policies', icon: 'shieldCheck' as const, route: 'Legal' },
        { label: 'Contact Us', icon: 'phone' as const, route: 'ContactUs' },
      ],
    },
  ];

  const glassBg = isDark ? 'rgba(13, 23, 43, 0.88)' : 'rgba(255, 255, 255, 0.92)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';

  return (
    <MovingBackground theme={isDark ? 'dark' : 'yellow'} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: insets.bottom + 110,
          },
        ]}
      >
        {/* Profile Identity Header Card */}
        <View style={[styles.profileCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          <Image
            source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.name, { color: tokens.content.primary }]}>{user.name}</Text>
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>VIP MEMBER</Text>
              </View>
            </View>
            <Text style={[styles.email, { color: tokens.content.secondary }]}>{user.email}</Text>
            <Text style={[styles.phone, { color: tokens.content.tertiary }]}>{user.phone}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.editBtn}>
            <SvkIcon name="chevronRight" size={18} color={tokens.content.tertiary} />
          </Pressable>
        </View>

        {/* Three Theme Selector Card */}
        <View style={[styles.themeCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          <Text style={[styles.themeHeaderLabel, { color: tokens.content.secondary }]}>APPEARANCE MODE</Text>
          <View style={styles.themePillsRow}>
            <Pressable
              onPress={() => setTheme('light')}
              style={[
                styles.themePill,
                themeMode === 'light' && styles.themePillActive,
              ]}
            >
              <Text style={[styles.themePillText, themeMode === 'light' && styles.themePillTextActive]}>
                ☀️ Light
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTheme('dark')}
              style={[
                styles.themePill,
                themeMode === 'dark' && styles.themePillActive,
              ]}
            >
              <Text style={[styles.themePillText, themeMode === 'dark' && styles.themePillTextActive]}>
                🌙 Dark
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTheme('system')}
              style={[
                styles.themePill,
                themeMode === 'system' && styles.themePillActive,
              ]}
            >
              <Text style={[styles.themePillText, themeMode === 'system' && styles.themePillTextActive]}>
                ⚙️ System
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: tokens.content.secondary }]}>
              {section.title}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
              {section.items.map((item, iIdx) => (
                <Pressable
                  key={iIdx}
                  onPress={() => navigation.navigate(item.route)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    iIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: tokens.border.subtle },
                    pressed && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
                  ]}
                >
                  <View style={styles.menuIconBox}>
                    <SvkIcon name={item.icon} size={18} color="#2563EB" />
                  </View>
                  <Text style={[styles.menuItemLabel, { color: tokens.content.primary }]}>
                    {item.label}
                  </Text>
                  <SvkIcon name="chevronRight" size={16} color={tokens.content.tertiary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Action Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.88 },
          ]}
        >
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </MovingBackground>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#F6C453',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  vipBadge: {
    backgroundColor: '#F6C453',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  vipText: {
    color: '#050816',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  phone: {
    fontSize: 11.5,
    marginTop: 1,
    fontWeight: '500',
  },
  editBtn: {
    padding: 6,
  },
  themeCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  themePillsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 14,
    padding: 3,
  },
  themePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  themePillActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  themePillTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
  },
  logoutBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#EF4444',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
