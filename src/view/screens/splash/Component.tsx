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
} from 'react-native'
import { initalStateAsync } from '../../../shared/redux/reducers/auth'
import { getAsyncData } from '../../../shared/utils/storage'

const { width: W, height: H } = Dimensions.get('window')

export interface Props {
  splashLaunched: Function
  isLoggedIn: boolean
  navigation: any
  dispatch: any
}

function Splash(props: any) {
  const { splashLaunched, navigation, dispatch } = props

  const scaleAnim = React.useRef(new Animated.Value(0.4)).current
  const rotateAnim = React.useRef(new Animated.Value(-0.1)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current
  const cardSlide = React.useRef(new Animated.Value(60)).current
  const cardFade = React.useRef(new Animated.Value(0)).current
  const badgeFade = React.useRef(new Animated.Value(0)).current
  const badgeSlide = React.useRef(new Animated.Value(20)).current
  const [autoNavigated, setAutoNavigated] = React.useState(false)

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0.03,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(badgeFade, {
          toValue: 1,
          duration: 500,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(badgeSlide, {
          toValue: 0,
          duration: 500,
          delay: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 600,
          delay: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    getInitialData()
  }, [])

  const getInitialData = async () => {
    await dispatch(initalStateAsync)
    const user = await getAsyncData('user')
    splashLaunched()
    if (user && Object.keys(user).length > 0) {
      setAutoNavigated(true)
      navigation.popTo('Home')
    }
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [-0.1, 0.1],
    outputRange: ['-12deg', '12deg'],
  })

  const handleGetStarted = () => {
    navigation.navigate('Login')
  }

  const handleLogin = () => {
    navigation.navigate('Login')
  }

  if (autoNavigated) return null

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFE000"
        translucent={false}
      />
      <View style={st.root}>
        {/* Yellow Hero Section */}
        <View style={st.heroSection}>
          <View style={st.bubbleLarge} />
          <View style={st.bubbleSmall} />

          <Animated.View
            style={[
              st.logoWrap,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }, { rotate }],
              },
            ]}
          >
            <View style={st.logoBox}>
              <Text style={st.logoEmoji}>🛵</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              st.deliveryBadge,
              {
                opacity: badgeFade,
                transform: [{ translateY: badgeSlide }],
              },
            ]}
          >
            <Text style={st.deliveryBadgeIcon}>⚡</Text>
            <Text style={st.deliveryBadgeText}>AVG DELIVERY 9 MIN 48 SEC</Text>
          </Animated.View>
        </View>

        {/* Dark Bottom Card */}
        <Animated.View
          style={[
            st.darkCard,
            {
              opacity: cardFade,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          <Text style={st.tagline}>
            Your groceries,{'\n'}
            <Text style={st.taglineHighlight}>crazy fast.</Text>
          </Text>

          <Text style={st.subtitle}>
            5,000+ products. One flat fee. Delivered to your{'\n'}door before your kettle boils.
          </Text>

          <View style={st.featureRow}>
            <View style={st.featureDot} />
            <Text style={st.featureText}>No order minimum</Text>
            <View style={[st.featureDot, { marginLeft: 20 }]} />
            <Text style={st.featureText}>Live tracking</Text>
          </View>

          <TouchableOpacity
            style={st.getStartedBtn}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Text style={st.getStartedText}>Get started →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} style={st.loginRow}>
            <Text style={st.loginText}>
              Already have an account?{' '}
              <Text style={st.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  )
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFE000',
  },

  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubbleLarge: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,213,0,0.6)',
  },
  bubbleSmall: {
    position: 'absolute',
    bottom: 40,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  logoWrap: {
    alignItems: 'center',
  },
  logoBox: {
    width: 120,
    height: 120,
    backgroundColor: '#141414',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 36,
    elevation: 20,
  },
  logoEmoji: {
    fontSize: 60,
    lineHeight: 72,
  },

  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 24,
    gap: 8,
  },
  deliveryBadgeIcon: {
    fontSize: 14,
  },
  deliveryBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#FFE000',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  darkCard: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
  },

  tagline: {
    fontFamily: 'DMSans-Bold',
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: -1,
  },
  taglineHighlight: {
    color: '#FFE000',
    fontStyle: 'italic',
  },

  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#9a9a9a',
    lineHeight: 22,
    marginTop: 14,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE000',
    marginRight: 8,
  },
  featureText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  getStartedBtn: {
    backgroundColor: '#FFE000',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  getStartedText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    color: '#141414',
    letterSpacing: 0.3,
  },

  loginRow: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  loginText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#9a9a9a',
  },
  loginLink: {
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
})

export default Splash
