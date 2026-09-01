import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  AccessibilityInfo,
  useWindowDimensions,
  Pressable,
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
import Svg, { Path, Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { SvkLogo } from '../../../design-system/logo/SvkLogo';
import { useResponsive } from '../../../hooks/useResponsive';

export interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { width: W, height: H } = useWindowDimensions();
  const { isTablet } = useResponsive();

  // 6-Stage Animation Sequence Shared Values
  // Stage 1: Background expand
  const bgExpand = useSharedValue(0.1);
  const bgOpacity = useSharedValue(0);

  // Stage 2: Logo reveal
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  // Stage 3: Product Ecosystem Floating Objects
  const ecoOpacity = useSharedValue(0);
  const ecoFloat = useSharedValue(0);

  // Stage 4: Brand Typography reveal
  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  // Stage 5: CTA reveal
  const ctaY = useSharedValue(40);
  const ctaOpacity = useSharedValue(0);

  // Stage 6: Exit transition scale
  const screenScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reducedMotion) => {
      const durationMultiplier = reducedMotion ? 0.3 : 1;

      // STAGE 1 — Background Central Blue Light Expansion
      bgOpacity.value = withTiming(1, { duration: 700 * durationMultiplier });
      bgExpand.value = withSpring(1, { damping: 18, stiffness: 80 });

      // STAGE 2 — Brand Reveal (Logo)
      setTimeout(() => {
        logoOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });
        logoScale.value = withSpring(1, { damping: 12, stiffness: 110 });
      }, 250 * durationMultiplier);

      // STAGE 3 — Product Ecosystem Floating Cards
      setTimeout(() => {
        ecoOpacity.value = withTiming(1, { duration: 700 * durationMultiplier });
      }, 500 * durationMultiplier);

      // STAGE 4 — Brand Typography Reveal
      setTimeout(() => {
        titleOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });
        titleY.value = withSpring(0, { damping: 16 });
      }, 700 * durationMultiplier);

      setTimeout(() => {
        subtitleOpacity.value = withTiming(1, { duration: 600 * durationMultiplier });
      }, 900 * durationMultiplier);

      // STAGE 5 — Primary CTA Reveal
      setTimeout(() => {
        ctaOpacity.value = withTiming(1, { duration: 700 * durationMultiplier });
        ctaY.value = withSpring(0, { damping: 18, stiffness: 120 });
      }, 1100 * durationMultiplier);

      // Continuous Floating Oscillation for Product Ecosystem
      if (!reducedMotion) {
        ecoFloat.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(8, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }
    });
  }, []);

  const handleGetStarted = () => {
    // STAGE 6 — Smooth Liquid Morph Transition into App
    screenOpacity.value = withTiming(0, { duration: 350 });
    screenScale.value = withTiming(0.96, { duration: 350 });
    setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 360);
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const animatedBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scale: bgExpand.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedEcoStyle = useAnimatedStyle(() => ({
    opacity: ecoOpacity.value,
    transform: [{ translateY: ecoFloat.value }],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const animatedCtaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#050816" translucent />

      {/* STAGE 1: Liquid Aurora Atmospheric Background */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]}>
        <View style={styles.bgCanvas}>
          <Svg width={W * 1.8} height={W * 1.8} viewBox="0 0 400 400">
            <Defs>
              <RadialGradient id="auroraCore" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
                <Stop offset="40%" stopColor="#22D3EE" stopOpacity="0.25" />
                <Stop offset="75%" stopColor="#8B5CF6" stopOpacity="0.12" />
                <Stop offset="100%" stopColor="#050816" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="200" cy="200" r="200" fill="url(#auroraCore)" />
          </Svg>
        </View>
      </Animated.View>

      {/* Main Poster Layout Container */}
      <View style={[styles.content, isTablet && styles.contentTablet]}>
        
        {/* Poster Top Headline */}
        <Animated.View style={[styles.posterHeader, animatedSubtitleStyle]}>
          <Text style={styles.posterBadge}>LIQUID AURORA OS</Text>
          <Text style={styles.posterSubHeader}>PREMIUM COMMERCE</Text>
          <Text style={styles.posterMeta}>Modern • Intelligent • Responsive • Fluid</Text>
        </Animated.View>

        {/* Hero Ecosystem Center: Logo + Floating 3D Cards */}
        <View style={styles.heroCenter}>
          {/* STAGE 3: Floating Product Ecosystem Objects */}
          <Animated.View style={[styles.floatingCard, styles.cardTopLeft, animatedEcoStyle]}>
            <LinearGradient colors={['rgba(37,99,235,0.25)', 'rgba(13,23,43,0.85)']} style={styles.glassCardInner}>
              <Text style={styles.cardIcon}>🛍️</Text>
              <Text style={styles.cardLabel}>Luxury Bag</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.floatingCard, styles.cardTopRight, animatedEcoStyle]}>
            <LinearGradient colors={['rgba(246,196,83,0.25)', 'rgba(13,23,43,0.85)']} style={styles.glassCardInner}>
              <Text style={styles.cardIcon}>🎧</Text>
              <Text style={styles.cardLabel}>Audio Pro</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.floatingCard, styles.cardBottomLeft, animatedEcoStyle]}>
            <LinearGradient colors={['rgba(34,211,238,0.25)', 'rgba(13,23,43,0.85)']} style={styles.glassCardInner}>
              <Text style={styles.cardIcon}>⌚</Text>
              <Text style={styles.cardLabel}>Smart Watch</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.floatingCard, styles.cardBottomRight, animatedEcoStyle]}>
            <LinearGradient colors={['rgba(139,92,246,0.25)', 'rgba(13,23,43,0.85)']} style={styles.glassCardInner}>
              <Text style={styles.cardIcon}>📱</Text>
              <Text style={styles.cardLabel}>Flagship Phone</Text>
            </LinearGradient>
          </Animated.View>

          {/* STAGE 2: Central Brand Logo Reveal */}
          <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
            <View style={styles.logoGlowRing} />
            <SvkLogo variant="symbol" size="hero" />
          </Animated.View>
        </View>

        {/* STAGE 4: Brand Typography */}
        <Animated.View style={[styles.brandTypographySection, animatedTitleStyle]}>
          <Text style={styles.brandTitleText}>
            SVK <Text style={styles.goldTitleText}>E-COM</Text>
          </Text>
          <Text style={styles.taglineText}>Shop Smart. Live Better.</Text>

          {/* Feature Highlights Pills */}
          <Animated.View style={[styles.featureRow, animatedSubtitleStyle]}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Floating Navigation</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Liquid Product Cards</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Aurora Motion</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>120Hz Quality</Text>
            </View>
          </Animated.View>
        </Animated.View>

      </View>

      {/* STAGE 5: Bottom CTA Action */}
      <Animated.View style={[styles.bottomSection, isTablet && styles.bottomSectionTablet, animatedCtaStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get Started with SHOPX"
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <LinearGradient
            colors={['#2563EB', '#3B82F6', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Get Started →</Text>
          </LinearGradient>
        </Pressable>

        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign In to existing account"
          onPress={handleSignIn}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? <Text style={styles.signInText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: '12%',
    paddingBottom: 36,
  },
  bgCanvas: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  contentTablet: {
    maxWidth: 540,
    alignSelf: 'center',
  },
  posterHeader: {
    alignItems: 'center',
    marginTop: 8,
  },
  posterBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#22D3EE',
    letterSpacing: 3,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  posterSubHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  posterMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.8,
  },
  heroCenter: {
    width: 280,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(13, 23, 43, 0.90)',
    borderWidth: 1.5,
    borderColor: 'rgba(246, 196, 83, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 10,
  },
  logoGlowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(37, 99, 235, 0.20)',
  },
  floatingCard: {
    position: 'absolute',
    width: 95,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 5,
  },
  glassCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  cardTopLeft: {
    top: 0,
    left: 0,
  },
  cardTopRight: {
    top: 0,
    right: 0,
  },
  cardBottomLeft: {
    bottom: 0,
    left: 0,
  },
  cardBottomRight: {
    bottom: 0,
    right: 0,
  },
  brandTypographySection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  goldTitleText: {
    color: '#F6C453',
  },
  taglineText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 18,
    justifyContent: 'center',
  },
  featurePill: {
    backgroundColor: 'rgba(17, 29, 52, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  featurePillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  bottomSectionTablet: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
    marginBottom: 14,
  },
  primaryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 13.5,
    color: '#94A3B8',
  },
  signInText: {
    color: '#F6C453',
    fontWeight: '700',
  },
});
