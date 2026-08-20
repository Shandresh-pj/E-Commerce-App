import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';
import { SvkLogo } from '../../../design-system/logo/SvkLogo';

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  renderIllustration: (width: number, height: number) => React.ReactNode;
}

export const OnboardingScreen = ({ navigation }: any) => {
  const { isDark } = useTheme();
  const { width: W, height: H } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: 'Discover Better',
      subtitle: 'Curated Excellence & Smart Search',
      description:
        'Explore thousands of authentic products curated specifically for your lifestyle with intelligent visual search.',
      renderIllustration: (w, h) => (
        <Svg width={Math.min(w * 0.75, 340)} height={Math.min(h * 0.32, 240)} viewBox="0 0 300 240" fill="none">
          <Defs>
            <LinearGradient id="discoverGrad" x1="0" y1="0" x2="300" y2="240">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#1E40AF" stopOpacity="0.9" />
            </LinearGradient>
            <LinearGradient id="goldHighlight" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
          </Defs>
          <Circle cx="150" cy="120" r="100" fill="url(#discoverGrad)" opacity="0.15" />
          <Rect x="40" y="50" width="130" height="130" rx="20" fill="rgba(37, 99, 235, 0.12)" stroke="#2563EB" strokeWidth="2" />
          <Rect x="130" y="80" width="130" height="130" rx="20" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="2" />
          <Circle cx="150" cy="120" r="45" stroke="url(#goldHighlight)" strokeWidth="4" fill="none" />
          <Path d="M 182 152 L 210 180" stroke="url(#goldHighlight)" strokeWidth="6" strokeLinecap="round" />
          <Circle cx="80" cy="90" r="4" fill="#FBBF24" />
          <Circle cx="220" cy="65" r="6" fill="#3B82F6" />
        </Svg>
      ),
    },
    {
      id: '2',
      title: 'Shop Smarter',
      subtitle: 'Flash Deals & One-Touch Checkout',
      description:
        'Unlock exclusive member pricing, instant cashbacks to your SVK Wallet, and seamless 1-click tokenized checkout.',
      renderIllustration: (w, h) => (
        <Svg width={Math.min(w * 0.75, 340)} height={Math.min(h * 0.32, 240)} viewBox="0 0 300 240" fill="none">
          <Defs>
            <LinearGradient id="smartGrad" x1="0" y1="0" x2="300" y2="240">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
          </Defs>
          <Circle cx="150" cy="120" r="95" fill="rgba(251, 191, 36, 0.1)" />
          <Path
            d="M 150 40 L 220 70 V 130 C 220 175 150 205 150 205 C 150 205 80 175 80 130 V 70 Z"
            fill="rgba(15, 23, 42, 0.8)"
            stroke="#2563EB"
            strokeWidth="3"
          />
          <Path
            d="M 155 75 L 125 125 H 155 L 145 165 L 180 115 H 150 Z"
            fill="url(#smartGrad)"
          />
        </Svg>
      ),
    },
    {
      id: '3',
      title: 'Stay in Control',
      subtitle: 'Real-Time Tracking & Instant Support',
      description:
        'Track your shipment live on an interactive map from dispatch to doorstep with transparent timeline milestones.',
      renderIllustration: (w, h) => (
        <Svg width={Math.min(w * 0.75, 340)} height={Math.min(h * 0.32, 240)} viewBox="0 0 300 240" fill="none">
          <Defs>
            <LinearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#2563EB" />
              <Stop offset="100%" stopColor="#60A5FA" />
            </LinearGradient>
          </Defs>
          <Rect x="50" y="40" width="200" height="150" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />
          <Path d="M 70 140 Q 130 80 230 110" stroke="url(#mapGrad)" strokeWidth="4" strokeDasharray="6 6" fill="none" />
          <Circle cx="230" cy="110" r="16" fill="rgba(251, 191, 36, 0.25)" />
          <Circle cx="230" cy="110" r="8" fill="#FBBF24" />
          <Rect x="100" y="110" width="30" height="30" rx="6" fill="#2563EB" />
        </Svg>
      ),
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slideContainer, { width: W }]}>
      <View style={styles.illustrationWrapper}>{item.renderIllustration(W, H)}</View>
      <View style={styles.textWrapper}>
        <Text style={[styles.slideTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {item.title}
        </Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        <Text style={[styles.slideDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0B1329' : '#F8FAFC' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent={false} />

      {/* Top Bar */}
      <View style={styles.headerBar}>
        <SvkLogo variant="compact" size="sm" mode={isDark ? 'dark' : 'light'} showTagline={false} />
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={[styles.skipText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / W);
          setCurrentIndex(index);
        }}
      />

      {/* Footer */}
      <View style={styles.footerBar}>
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  isActive
                    ? { width: 28, backgroundColor: '#FBBF24' }
                    : { width: 8, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={styles.nextButton}
          accessibilityRole="button"
          accessibilityLabel={currentIndex === slides.length - 1 ? 'Get Started' : 'Next slide'}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  slideSubtitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 6,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 340,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  nextButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
