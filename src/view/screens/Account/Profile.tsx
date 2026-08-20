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
  Switch,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';
import { getAsyncData } from '../../../shared/utils/storage';
import { fetchMyProfile } from '../../../shared/services/main-service';
import authService from '../../../shared/services/auth.service';

export const ProfileScreen = ({ navigation }: any) => {
  const { tokens, isDark, toggleTheme } = useTheme();
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Identity Header Card */}
        <Surface variant="card" radius="xl" elevation="medium" style={styles.profileCard}>
          <Image
            source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.name, { color: tokens.content.primary }]}>{user.name}</Text>
              <Badge label="VIP MEMBER" variant="gold" size="sm" style={{ marginLeft: 8 }} />
            </View>
            <Text style={[styles.email, { color: tokens.content.secondary }]}>{user.email}</Text>
            <Text style={[styles.phone, { color: tokens.content.tertiary }]}>{user.phone}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.editBtn}>
            <SvkIcon name="chevronRight" size={20} color={tokens.content.tertiary} />
          </Pressable>
        </Surface>

        {/* Dark Mode Toggle Item */}
        <Surface variant="card" radius="lg" bordered style={styles.themeToggleCard}>
          <View style={styles.themeToggleRow}>
            <SvkIcon name="bell" size={22} color={tokens.brand.primary} />
            <Text style={[styles.themeText, { color: tokens.content.primary }]}>Dark Theme</Text>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#CBD5E1', true: tokens.brand.primary }} />
          </View>
        </Surface>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: tokens.content.secondary }]}>
              {section.title}
            </Text>
            <Surface variant="card" radius="lg" bordered style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <Pressable
                  key={iIdx}
                  onPress={() => navigation.navigate(item.route)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    iIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: tokens.border.subtle },
                    pressed && { backgroundColor: tokens.surface.interactive },
                  ]}
                >
                  <SvkIcon name={item.icon} size={20} color={tokens.brand.primary} />
                  <Text style={[styles.menuItemLabel, { color: tokens.content.primary }]}>
                    {item.label}
                  </Text>
                  <SvkIcon name="chevronRight" size={16} color={tokens.content.tertiary} />
                </Pressable>
              ))}
            </Surface>
          </View>
        ))}

        {/* Logout Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={{ marginTop: SPACING.xl, marginBottom: SPACING.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.title,
  },
  email: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  phone: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  editBtn: {
    padding: SPACING.xs,
  },
  themeToggleCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    flex: 1,
    marginLeft: SPACING.md,
    ...TYPOGRAPHY.bodyM,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuItemLabel: {
    flex: 1,
    marginLeft: SPACING.md,
    ...TYPOGRAPHY.bodyM,
    fontWeight: '500',
  },
});
