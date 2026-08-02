import * as React from 'react'
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MovingBackground from '../../elements/MovingBackground'
import { initalStateAsync } from '../../../shared/redux/reducers/auth'
import { getAsyncData } from '../../../shared/utils/storage'

const { width: W, height: H } = Dimensions.get('window')
const isSmallDevice = W < 360

const SCOOTER_PNG = require('../../../assets/images/scooter.png')
const BRAND_LOGO_PNG = require('../../../assets/images/brand_logo.png')

export interface Props {
  splashLaunched: Function
  isLoggedIn: boolean
  navigation: any
  dispatch: any
}

function Splash(props: any) {
  const { splashLaunched, navigation, dispatch } = props

  const scaleAnim = React.useRef(new Animated.Value(0.4)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current
  const cardSlide = React.useRef(new Animated.Value(60)).current
  const cardFade = React.useRef(new Animated.Value(0)).current
  const badgeFade = React.useRef(new Animated.Value(0)).current
  const badgeSlide = React.useRef(new Animated.Value(20)).current
  const btnScale = React.useRef(new Animated.Value(1)).current

  // Live scooter bobbing + tilt
  const scooterY = React.useRef(new Animated.Value(0)).current
  const scooterTilt = React.useRef(new Animated.Value(0)).current

  // Badge pulse aura
  const badgePulse = React.useRef(new Animated.Value(1)).current

  const [autoNavigated, setAutoNavigated] = React.useState(false)

  React.useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(badgeFade, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badgeSlide, {
          toValue: 0,
          duration: 500,
          delay: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 550,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 550,
          delay: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    // Scooter live floating bobbing + gentle tilt
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scooterY, {
            toValue: -10,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scooterTilt, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scooterY, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scooterTilt, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Delivery badge live pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1.04,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    getInitialData()
  }, [])

  const tiltInterpolate = scooterTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  })

  const getInitialData = async () => {
    await dispatch(initalStateAsync)
    const user = await getAsyncData('user')
    splashLaunched()
    if (user && Object.keys(user).length > 0) {
      setAutoNavigated(true)
      navigation.popTo('Home')
    }
  }

  const handleGetStarted = () => {
    navigation.navigate('Login')
  }

  const handleLogin = () => {
    navigation.navigate('Login')
  }

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  if (autoNavigated) return null

  return (
    <MovingBackground theme="yellow">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={st.safe} edges={['top']}>
        <View style={st.rootContainer}>
          {/* Upper Hero Section */}
          <View style={st.heroSection}>
            <Animated.View
              style={[
                st.logoWrap,
                {
                  opacity: opacityAnim,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: scooterY },
                    { rotate: tiltInterpolate },
                  ],
                },
              ]}
            >
              <View style={st.logoBox}>
                <Image source={SCOOTER_PNG} style={st.scooterImage} resizeMode="cover" />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                st.deliveryBadge,
                {
                  opacity: badgeFade,
                  transform: [
                    { translateY: badgeSlide },
                    { scale: badgePulse },
                  ],
                },
              ]}
            >
              <View style={st.badgeIconFrame}>
                <Image source={BRAND_LOGO_PNG} style={st.badgeIcon} resizeMode="cover" />
              </View>
              <Text style={st.deliveryBadgeText}>AVG DELIVERY 9 MIN 48 SEC</Text>
            </Animated.View>
          </View>

          {/* Dark Bottom Card Container */}
          <Animated.View
            style={[
              st.darkCard,
              {
                opacity: cardFade,
                transform: [{ translateY: cardSlide }],
              },
            ]}
          >
            <SafeAreaView edges={['bottom']}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={st.cardScrollContent}
              >
                <Text style={st.tagline}>
                  Your groceries,{'\n'}
                  <Text style={st.taglineHighlight}>crazy fast.</Text>
                </Text>

                <Text style={st.subtitle}>
                  5,000+ products. One flat fee. Delivered to your door before your kettle boils.
                </Text>

                <View style={st.featureRow}>
                  <View style={st.featureItem}>
                    <View style={st.featureDot} />
                    <Text style={st.featureText}>No order minimum</Text>
                  </View>
                  <View style={[st.featureItem, { marginLeft: 18 }]}>
                    <View style={st.featureDot} />
                    <Text style={st.featureText}>Live tracking</Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleGetStarted}
                  style={st.btnWrap}
                >
                  <Animated.View
                    style={[
                      st.getStartedBtn,
                      { transform: [{ scale: btnScale }] },
                    ]}
                  >
                    <Text style={st.getStartedText}>Get started →</Text>
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin} style={st.loginRow} activeOpacity={0.8}>
                  <Text style={st.loginText}>
                    Already have an account? <Text style={st.loginLink}>Log in</Text>
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </SafeAreaView>
    </MovingBackground>
  )
}

const st = StyleSheet.create({
  safe: {
    flex: 1,
  },
  rootContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },

  logoWrap: {
    alignItems: 'center',
  },
  logoBox: {
    width: isSmallDevice ? 114 : 140,
    height: isSmallDevice ? 114 : 140,
    backgroundColor: '#141414',
    borderRadius: 38,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scooterImage: {
    width: '100%',
    height: '100%',
  },

  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: isSmallDevice ? 18 : 26,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 224, 0, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  badgeIconFrame: {
    width: 22,
    height: 22,
    borderRadius: 7,
    overflow: 'hidden',
  },
  badgeIcon: {
    width: '100%',
    height: '100%',
  },
  deliveryBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: isSmallDevice ? 10.5 : 12,
    color: '#FFE000',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  darkCard: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    paddingHorizontal: Math.min(W * 0.07, 28),
    shadowColor: '#0B1B36',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
  },

  cardScrollContent: {
    paddingTop: isSmallDevice ? 24 : 32,
    paddingBottom: 24,
  },

  tagline: {
    fontFamily: 'DMSans-Bold',
    fontSize: isSmallDevice ? 28 : 35,
    color: '#FFFFFF',
    lineHeight: isSmallDevice ? 34 : 42,
    letterSpacing: -0.8,
  },
  taglineHighlight: {
    color: '#FBBF24',
    fontStyle: 'italic',
  },

  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    marginTop: 12,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    marginRight: 8,
  },
  featureText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  btnWrap: {
    marginTop: 28,
    width: '100%',
  },
  getStartedBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  getStartedText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: '#0F172A',
    letterSpacing: 0.3,
  },

  loginRow: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  loginText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13.5,
    color: '#94A3B8',
  },
  loginLink: {
    fontFamily: 'DMSans-Bold',
    color: '#FBBF24',
    textDecorationLine: 'underline',
  },
})

export default Splash
