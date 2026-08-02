import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MovingBackground from '../../elements/MovingBackground'

const { width: W, height: H } = Dimensions.get('window')
const isSmallDevice = W < 360

const BRAND_LOGO = require('../../assets/images/brand_logo.png')
const CUSTOMER_ICON = require('../../assets/images/customer_icon.png')
const PARTNER_ICON = require('../../assets/images/delivery_partner_icon.png')

function RoleSelection({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideHeader = useRef(new Animated.Value(40)).current
  const slideCust = useRef(new Animated.Value(50)).current
  const slidePart = useRef(new Animated.Value(60)).current

  const logoScale = useRef(new Animated.Value(0.5)).current
  const logoPulse = useRef(new Animated.Value(1)).current
  const logoRotate = useRef(new Animated.Value(0)).current

  // Card Glow pulse animations
  const custGlow = useRef(new Animated.Value(0.2)).current
  const partGlow = useRef(new Animated.Value(0.3)).current

  // Card Press Scale states
  const custScale = useRef(new Animated.Value(1)).current
  const partScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // 144fps Staggered entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(slideHeader, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(slideCust, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(slidePart, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    // Continuous Logo breathing pulse & tilt
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoPulse, {
            toValue: 1.06,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoRotate, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoPulse, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoRotate, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Card rim glow continuous pulsing
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(custGlow, {
            toValue: 0.8,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(partGlow, {
            toValue: 0.9,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(custGlow, {
            toValue: 0.2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(partGlow, {
            toValue: 0.3,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()
  }, [])

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  })

  const goCustomer = () => navigation.navigate('Splash')
  const goPartner = () => navigation.navigate('PartnerApp')

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  return (
    <MovingBackground theme="yellow">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Brand Badge with Live Rotating Aura */}
          <Animated.View
            style={[
              st.brandBlock,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideHeader }],
              },
            ]}
          >
            <Animated.View
              style={[
                st.logoFrame,
                {
                  transform: [
                    { scale: Animated.multiply(logoScale, logoPulse) },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <Image source={BRAND_LOGO} style={st.logoImage} resizeMode="cover" />
            </Animated.View>

            <Text style={st.brandName}>Future Believe</Text>
            <Text style={st.tagline}>How would you like to continue?</Text>
          </Animated.View>

          {/* Role Choice Cards */}
          <View style={st.cardsContainer}>
            {/* Customer Role Card */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideCust }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPressIn={() => handlePressIn(custScale)}
                onPressOut={() => handlePressOut(custScale)}
                onPress={goCustomer}
              >
                <Animated.View
                  style={[
                    st.card,
                    st.customerCard,
                    { transform: [{ scale: custScale }] },
                  ]}
                >
                  <Animated.View
                    style={[
                      st.glowBorder,
                      { opacity: custGlow, borderColor: '#FFB800' },
                    ]}
                  />
                  <View style={[st.iconFrame, st.customerIconFrame]}>
                    <Image source={CUSTOMER_ICON} style={st.cardPngImage} resizeMode="cover" />
                  </View>
                  <View style={st.cardTextWrap}>
                    <Text style={st.customerTitle}>I'm a Customer</Text>
                    <Text style={st.customerSubtitle}>
                      Order groceries & essentials, delivered fast
                    </Text>
                  </View>
                  <View style={st.chevronBox}>
                    <Text style={st.customerChevron}>›</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            {/* Delivery Partner Role Card */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slidePart }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPressIn={() => handlePressIn(partScale)}
                onPressOut={() => handlePressOut(partScale)}
                onPress={goPartner}
              >
                <Animated.View
                  style={[
                    st.card,
                    st.partnerCard,
                    { transform: [{ scale: partScale }] },
                  ]}
                >
                  <Animated.View
                    style={[
                      st.glowBorder,
                      { opacity: partGlow, borderColor: '#FFE000' },
                    ]}
                  />
                  <View style={[st.iconFrame, st.partnerIconFrame]}>
                    <Image source={PARTNER_ICON} style={st.cardPngImage} resizeMode="cover" />
                  </View>
                  <View style={st.cardTextWrap}>
                    <Text style={st.partnerTitle}>I'm a Delivery Partner</Text>
                    <Text style={st.partnerSubtitle}>
                      Deliver orders and earn on your own schedule
                    </Text>
                  </View>
                  <View style={st.chevronBox}>
                    <Text style={st.partnerChevron}>›</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer Caption */}
          <Animated.Text style={[st.footerText, { opacity: fadeAnim }]}>
            You can switch anytime by relaunching the app
          </Animated.Text>
        </ScrollView>
      </SafeAreaView>
    </MovingBackground>
  )
}

const st = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Math.min(W * 0.06, 24),
    justifyContent: 'center',
    paddingVertical: 36,
  },

  brandBlock: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 32 : 44,
  },
  logoFrame: {
    width: isSmallDevice ? 86 : 100,
    height: isSmallDevice ? 86 : 100,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontFamily: 'DMSans-Bold',
    fontSize: isSmallDevice ? 24 : 28,
    color: '#141414',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14.5,
    color: 'rgba(20, 20, 20, 0.7)',
    textAlign: 'center',
  },

  cardsContainer: {
    gap: 18,
    width: '100%',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    padding: isSmallDevice ? 16 : 20,
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
  },

  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderWidth: 1.5,
  },

  customerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 7,
  },

  partnerCard: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    shadowColor: '#0B1B36',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 12,
  },

  iconFrame: {
    width: isSmallDevice ? 56 : 64,
    height: isSmallDevice ? 56 : 64,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerIconFrame: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  partnerIconFrame: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },

  cardPngImage: {
    width: '100%',
    height: '100%',
  },

  cardTextWrap: {
    flex: 1,
  },

  customerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16.5,
    color: '#0F172A',
    marginBottom: 4,
  },
  customerSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  customerChevron: {
    fontSize: 26,
    color: '#2563EB',
    fontWeight: '300',
  },

  partnerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16.5,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  partnerSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },
  partnerChevron: {
    fontSize: 26,
    color: '#FBBF24',
    fontWeight: '300',
  },

  chevronBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },

  footerText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: 'rgba(20, 20, 20, 0.55)',
    textAlign: 'center',
    marginTop: 38,
  },
})

export default RoleSelection
