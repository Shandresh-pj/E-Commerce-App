import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { SvkLogo } from '../../../design-system/logo/SvkLogo';
import { useResponsive } from '../../../hooks/useResponsive';

export interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { width: W, height: H } = useWindowDimensions();
  const { isTablet } = useResponsive();

  // Animation shared values for staged entrance
  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.65);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(24);
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const chipsOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(32);
  const ctaOpacity = useSharedValue(0);

  // Ambient motion
  const orbitRotation = useSharedValue(0);
  const glowPulse = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reducedMotion) => {
      const durationMultiplier = reducedMotion ? 0.3 : 1;

      // 1. Background fade in
      bgOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });

      // 2. Logo scale & reveal
      logoOpacity.value = withTiming(1, { duration: 700 * durationMultiplier });
      logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });

      // 3. Title reveal
      setTimeout(() => {
        titleOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });
        titleTranslateY.value = withSpring(0, { damping: 16 });
      }, 300 * durationMultiplier);

      // 4. Tagline reveal
      setTimeout(() => {
        taglineOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });
      }, 550 * durationMultiplier);

      // 5. Feature chips reveal
      setTimeout(() => {
        chipsOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });
      }, 750 * durationMultiplier);

      // 6. CTA buttons reveal
      setTimeout(() => {
        ctaOpacity.value = withTiming(1, { duration: 700 * durationMultiplier });
        ctaTranslateY.value = withSpring(0, { damping: 18 });
      }, 950 * durationMultiplier);

      // Ambient background continuous subtle orbit rotation
      if (!reducedMotion) {
        orbitRotation.value = withRepeat(
          withTiming(360, { duration: 24000, easing: Easing.linear }),
          -1,
          false
        );
        glowPulse.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }
    });
  }, []);

  const animatedBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const animatedChipsStyle = useAnimatedStyle(() => ({
    opacity: chipsOpacity.value,
  }));

  const animatedCtaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowPulse.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1329" translucent />

      {/* Atmospheric Background & Ambient Network Lines */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]}>
        <View style={styles.bgCanvas}>
          {/* Soft atmospheric blue glow */}
          <Animated.View style={[styles.atmosphericGlow, animatedGlowStyle]}>
            <Svg width={W * 1.5} height={W * 1.5} viewBox="0 0 400 400">
              <Defs>
                <RadialGradient id="blueAtmosphere" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <Stop offset="50%" stopColor="#1E40AF" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#0B1329" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="200" cy="200" r="200" fill="url(#blueAtmosphere)" />
            </Svg>
          </Animated.View>

          {/* Flowing tech network geometry lines */}
          <Animated.View style={[styles.networkContainer, animatedOrbitStyle]}>
            <Svg width={Math.min(W * 1.3, 500)} height={Math.min(W * 1.3, 500)} viewBox="0 0 400 400">
              <Defs>
                <SvgLinearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#FBBF24" stopOpacity="0.1" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx="200" cy="200" r="160" stroke="url(#lineGrad1)" strokeWidth="1" strokeDasharray="6 8" fill="none" />
              <Circle cx="200" cy="200" r="110" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" fill="none" />
              <Path d="M 60 200 Q 200 40 340 200 Q 200 360 60 200 Z" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="1" fill="none" />
              <Circle cx="200" cy="40" r="4" fill="#FBBF24" opacity="0.8" />
              <Circle cx="340" cy="200" r="3.5" fill="#3B82F6" opacity="0.7" />
              <Circle cx="90" cy="200" r="3" fill="#60A5FA" opacity="0.6" />
            </Svg>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Main Content Hub */}
      <View style={[styles.content, isTablet && styles.contentTablet]}>
        {/* Centered Staggered Logo & Branding */}
        <Animated.View style={[styles.logoSection, animatedLogoStyle]}>
          <SvkLogo variant="symbol" size="hero" />
        </Animated.View>

        <Animated.View style={[styles.titleSection, animatedTitleStyle]}>
          <Text style={styles.brandTitle}>
            SVK <Text style={styles.goldText}>E-COM</Text>
          </Text>
        </Animated.View>

        <Animated.View style={[styles.taglineSection, animatedTaglineStyle]}>
          <Text style={styles.taglineText}>Shop Smart. Live Better.</Text>
          <View style={styles.accentDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.goldDot} />
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Feature Highlight Chips */}
        <Animated.View style={[styles.chipsContainer, animatedChipsStyle]}>
          <View style={styles.chipItem}>
            <Text style={styles.chipText}>⚡ Flash Deals</Text>
          </View>
          <View style={styles.chipItem}>
            <Text style={styles.chipText}>📍 Live Map Tracking</Text>
          </View>
          <View style={styles.chipItem}>
            <Text style={styles.chipText}>💳 SVK Wallet</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA Actions */}
      <Animated.View style={[styles.bottomSection, isTablet && styles.bottomSectionTablet, animatedCtaStyle]}>
        {/* Primary CTA: Get Started */}
        <TouchableOpacity
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Get Started with SVK E-COM"
          onPress={() => navigation.navigate('Onboarding')}
          style={styles.primaryButton}
        >
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary Action: Sign In */}
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign In to existing account"
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? <Text style={styles.signInText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1329',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: '12%',
    paddingBottom: 44,
  },
  bgCanvas: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  atmosphericGlow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  contentTablet: {
    maxWidth: 540,
    alignSelf: 'center',
  },
  logoSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  goldText: {
    color: '#FBBF24',
  },
  taglineSection: {
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  accentDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: 140,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FBBF24',
    marginHorizontal: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chipItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  bottomSectionTablet: {
    maxWidth: 540,
    alignSelf: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  primaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 10,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  signInText: {
    color: '#FBBF24',
    fontWeight: '700',
  },
});
