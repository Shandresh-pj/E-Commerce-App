import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
  AppState,
  AppStateStatus,
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import DeviceInfo from 'react-native-device-info';

const { width } = Dimensions.get('window');

// ─── Design Tokens (Matching Login Screen) ───────────────────────────────────
const BG = '#0F0E1A';
const SURFACE = '#1A1830';
const BORDER = '#2E2B50';
const ACCENT = '#6C63FF';
const ACCENT_DARK = '#4B44CC';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9B99B8';

interface LocationPermissionProps {
  navigation: any;
}

export default function LocationPermission({ navigation }: LocationPermissionProps) {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Subscribe to AppState changes to automatically transition when returning from system settings
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const navigateToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      try {
        let permissionGranted = false;
        if (Platform.OS === 'android') {
          permissionGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
        } else {
          permissionGranted = true;
        }

        if (permissionGranted) {
          const locationEnabled = await DeviceInfo.isLocationEnabled();
          if (locationEnabled) {
            navigateToHome();
          }
        }
      } catch (err) {
        console.warn('AppState verify error:', err);
      }
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      let permissionGranted = false;
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs access to your location to find nearby stores, show accurate delivery times, and customize your feed.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        permissionGranted = true;
      }

      if (permissionGranted) {
        if (Platform.OS === 'android') {
          try {
            // Trigger native in-screen Google GPS enablement dialog using our custom New-Arch-compatible native module
            const { LocationEnabler } = NativeModules;
            if (LocationEnabler) {
              await LocationEnabler.showLocationSettings();
              console.log('Location enabled inside screen successfully via custom native module');
            } else {
              console.warn('LocationEnabler native module not found');
            }
            navigateToHome();
          } catch (err: any) {
            console.warn('In-screen GPS enable cancelled or failed:', err.message);
            // Even if cancelled/failed, redirect to Home as a fallback
            navigateToHome();
          }
        } else {
          // iOS implementation
          const locationEnabled = await DeviceInfo.isLocationEnabled();
          if (locationEnabled) {
            navigateToHome();
          } else {
            navigateToHome();
          }
        }
      } else {
        // User denied the permission dialog
        navigateToHome();
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      navigateToHome();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} translucent={false} />

      {/* Decorative background blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Radar animation wrapper */}
          <View style={styles.radarWrapper}>
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={2500}
              style={[styles.radarRing, styles.ring1]}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={2500}
              delay={600}
              style={[styles.radarRing, styles.ring2]}
            />
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
          </View>

          {/* Texts */}
          <Text style={styles.title}>Enable Location Services</Text>
          <Text style={styles.subtitle}>
            To display products available in your area, estimate shipping times, and enjoy local delivery options, allow the app to access your device's location.
          </Text>

          {/* Action Card */}
          <View style={styles.card}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🛍️</Text>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Nearby Deals</Text>
                <Text style={styles.featureDesc}>Find exclusive offers around your location.</Text>
              </View>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🚚</Text>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Fast Delivery</Text>
                <Text style={styles.featureDesc}>Get products shipped to your exact address quickly.</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleRequestPermission}
              style={styles.primaryBtn}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Allow Location Access</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={navigateToHome}
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.secondaryBtnText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  // Background blobs
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  blob1: {
    width: 320,
    height: 320,
    backgroundColor: ACCENT,
    top: -120,
    right: -80,
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: '#FF6B9D',
    bottom: 40,
    left: -80,
  },
  // Radar visual
  radarWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  radarRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  ring1: {
    width: 180,
    height: 180,
    borderColor: `${ACCENT}30`,
  },
  ring2: {
    width: 140,
    height: 140,
    borderColor: `${ACCENT}60`,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: SURFACE,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 40,
  },
  // Typography
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  // Feature card
  card: {
    width: '100%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 36,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  // Buttons
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: ACCENT,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
});
