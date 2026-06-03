import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  DrawerActions,
} from '@react-navigation/native';
import styles from './ProfileStyle';
import { getData } from '../../../shared/services/main-service';
import UserIcon from '../../assets/images/svg/user-bar.svg';

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
  Status: { StatusCode: string };
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Refresh profile every time this screen gains focus ── */
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getData('/User/MyProfile');
      const data = res?.data?.data || res?.data?.object?.data || null;
      if (data) setProfile(data);
    } catch (e) {
      console.log('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const initials = profile
    ? (profile.FirstName?.slice(0, 1) ?? '') +
    (profile.LastName?.slice(0, 1) ?? '')
    : '';

  const memberSince = profile?.CreatedAt
    ? new Date(profile.CreatedAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color='#fff' />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor='#2a2c40'
      />
      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.backBtn}
            >
              <UserIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
          </View>
        </View>

        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", }}
          style={styles.bakcgroundImage}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* ── Avatar banner ── */}
            <View style={styles.banner}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
              </View>
              <Text style={styles.fullName}>
                {profile?.FirstName ?? ''}
                {profile?.LastName ? ' ' + profile.LastName : ''}
              </Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    profile?.Status?.StatusCode === "ACTIVE"
                      ? styles.badgeActive
                      : styles.badgeInactive,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {profile?.Status?.StatusCode}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Points row ── */}
            <View style={styles.pointsRow}>
              <View style={styles.pointCard}>
                <Text style={styles.pointValue}>
                  {profile?.AvailablePoints ?? 0}
                </Text>
                <Text style={styles.pointLabel}>Available</Text>
              </View>
              <View style={styles.pointDivider} />
              <View style={styles.pointCard}>
                <Text
                  style={[styles.pointValue]}
                >
                  {profile?.TotalCreditPoints ?? 0}
                </Text>
                <Text style={styles.pointLabel}>Credit</Text>
              </View>
              <View style={styles.pointDivider} />
              <View style={styles.pointCard}>
                <Text style={[styles.pointValue,]}>
                  {profile?.TotalDebitPoints ?? 0}
                </Text>
                <Text style={styles.pointLabel}>Debit</Text>
              </View>
            </View>

            {/* ── Info section ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Info</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.Email ?? '—'}</Text>
              </View>
              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>
                  {profile?.MobileNumber ?? '—'}
                </Text>
              </View>
              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Referral Code</Text>
                <Text style={[styles.infoValue, styles.referralCode]}>
                  {profile?.ReferralCode ?? '—'}
                </Text>
              </View>
              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {profile?.DOB
                    ? profile.DOB.split('-').reverse().join('-')
                    : '—'}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>AadharNumber</Text>
                <Text style={styles.infoValue}>
                  {profile?.AadharNumber ?? '—'}
                </Text>
              </View>
            </View>

            {/* ── Account section ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User Type</Text>
                <Text style={styles.infoValue}>{profile?.UserType ?? '—'}</Text>
              </View>
              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{memberSince}</Text>
              </View>
            </View>

            {/* ── Edit Profile button ── */}
            <TouchableOpacity
              style={[styles.btnPrimary, { marginHorizontal: 16, marginBottom: 40, }]}
              onPress={() => (navigation as any).navigate('EditProfile')}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

export default ProfileScreen;
