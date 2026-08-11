import React, { useState, useRef, useEffect } from 'react'
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
  AppState,
  AppStateStatus,
  NativeModules,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DeviceInfo from 'react-native-device-info'
import Svg, { Path, Circle, Rect } from 'react-native-svg'

const { width: W, height: H } = Dimensions.get('window')
const isSmallDevice = W < 360

/* -------------------------------------------------------------------------- */
/*                        CRISP VECTOR SVG ICONS                              */
/* -------------------------------------------------------------------------- */
const BackSvgIcon = ({ color = '#FFFFFF', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const SearchSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path
      d="M20 20L16 16"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
)

const CompassSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path
      d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
)

const MapPinSvgIcon = ({ color = '#0B1B36', size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C16 17.5 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17.5 12 21Z"
      fill="#FBBF24"
      stroke="#F59E0B"
      strokeWidth="1.5"
    />
    <Circle cx="12" cy="9" r="3" fill={color} />
  </Svg>
)

const NavigationSvgIcon = ({ color = '#0B1B36', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11L22 2L13 21L11 13L3 11Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </Svg>
)

const EditLocationSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

interface LocationPermissionProps {
  navigation: any
}

export default function LocationPermission({ navigation }: LocationPermissionProps) {
  const [loading, setLoading] = useState(false)
  const sheetSlide = useRef(new Animated.Value(350)).current
  const sheetFade = useRef(new Animated.Value(0)).current

  // Map animation values
  const pulseAnim1 = useRef(new Animated.Value(0.4)).current
  const pulseAnim2 = useRef(new Animated.Value(0.4)).current
  const radarRotate = useRef(new Animated.Value(0)).current
  const pinBounce = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Sheet animation
    Animated.parallel([
      Animated.spring(sheetSlide, {
        toValue: 0,
        tension: 60,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(sheetFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse rings animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1.8,
            duration: 2600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(1300),
          Animated.timing(pulseAnim2, {
            toValue: 1.8,
            duration: 2600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Radar beam rotation
    Animated.loop(
      Animated.timing(radarRotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Pin bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(pinBounce, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pinBounce, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    checkExistingPermission()
    return () => {
      subscription.remove()
    }
  }, [])

  const checkExistingPermission = async () => {
    try {
      let permissionGranted = false
      if (Platform.OS === 'android') {
        permissionGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        )
      } else {
        permissionGranted = true
      }

      if (permissionGranted) {
        const locationEnabled = await DeviceInfo.isLocationEnabled()
        if (locationEnabled) {
          navigateToHome()
        }
      }
    } catch (err) {
      console.warn('Initial permission check error:', err)
    }
  }

  const navigateToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    })
  }

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      try {
        let permissionGranted = false
        if (Platform.OS === 'android') {
          permissionGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          )
        } else {
          permissionGranted = true
        }

        if (permissionGranted) {
          const locationEnabled = await DeviceInfo.isLocationEnabled()
          if (locationEnabled) {
            navigateToHome()
          }
        }
      } catch (err) {
        console.warn('AppState verify error:', err)
      }
    }
  }

  const handleRequestPermission = async () => {
    setLoading(true)
    try {
      let permissionGranted = false
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message:
              'This app needs access to your location to find nearby stores, show accurate delivery times, and customize your feed.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        )
        permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        permissionGranted = true
      }

      if (permissionGranted) {
        if (Platform.OS === 'android') {
          try {
            const { LocationEnabler } = NativeModules
            if (LocationEnabler) {
              await LocationEnabler.showLocationSettings()
            }
            navigateToHome()
          } catch (err: any) {
            console.warn('In-screen GPS enable cancelled or failed:', err.message)
            navigateToHome()
          }
        } else {
          navigateToHome()
        }
      } else {
        navigateToHome()
      }
    } catch (err) {
      console.warn('Permission request error:', err)
      navigateToHome()
    } finally {
      setLoading(false)
    }
  }

  const handleEnterManually = () => {
    navigateToHome()
  }

  const radarSpin = radarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#071224" translucent={false} />

      {/* Map background */}
      <View style={s.mapBg}>
        {/* Search bar header */}
        <SafeAreaView edges={['top']} style={s.searchOverlay}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackSvgIcon color="#FFFFFF" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.searchBar}
            onPress={handleEnterManually}
            activeOpacity={0.9}
          >
            <SearchSvgIcon color="#FBBF24" size={18} />
            <Text style={s.searchPlaceholder}>Search area, street, landmark...</Text>
            <CompassSvgIcon color="#829AB8" size={18} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Vector map elements */}
        <View style={s.gridContainer}>
          {/* Map roads */}
          <View style={s.roadH1} />
          <View style={s.roadH2} />
          <View style={s.roadV1} />
          <View style={s.roadV2} />
          <View style={s.roadDiagonal} />

          {/* Buildings */}
          <View style={s.building1} />
          <View style={s.building2} />
          <View style={s.building3} />
          <View style={s.parkArea} />
          <View style={s.riverArea} />

          {/* Radar marker */}
          <View style={s.pinCenterAnchor}>
            {/* Pulse wave 1 */}
            <Animated.View
              style={[
                s.pulseRing,
                {
                  transform: [{ scale: pulseAnim1 }],
                  opacity: pulseAnim1.interpolate({
                    inputRange: [0.4, 1.8],
                    outputRange: [0.7, 0],
                  }),
                },
              ]}
            />
            {/* Pulse wave 2 */}
            <Animated.View
              style={[
                s.pulseRing,
                {
                  transform: [{ scale: pulseAnim2 }],
                  opacity: pulseAnim2.interpolate({
                    inputRange: [0.4, 1.8],
                    outputRange: [0.7, 0],
                  }),
                },
              ]}
            />

            {/* Radar beam */}
            <Animated.View
              style={[
                s.radarBeam,
                { transform: [{ rotate: radarSpin }] },
              ]}
            />

            {/* Bouncing pin */}
            <Animated.View
              style={[
                s.bouncingPinWrap,
                { transform: [{ translateY: pinBounce }] },
              ]}
            >
              {/* ETA tag */}
              <View style={s.etaBadge}>
                <Text style={s.etaBadgeText}>⚡ 10-Min Delivery Zone</Text>
              </View>

              {/* Pin frame */}
              <View style={s.pinGlowFrame}>
                <MapPinSvgIcon color="#0B1B36" size={28} />
              </View>

              {/* Shadow base dot */}
              <View style={s.pinShadowDot} />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Floating sheet */}
      <Animated.View
        style={[
          s.bottomSheet,
          {
            opacity: sheetFade,
            transform: [{ translateY: sheetSlide }],
          },
        ]}
      >
        <View style={s.sheetHandle} />

        <View style={s.sheetContent}>
          {/* Header row */}
          <View style={s.locationHeader}>
            <View style={s.pinIconBox}>
              <MapPinSvgIcon color="#0B1B36" size={30} />
            </View>
            <View style={s.locationTextWrap}>
              <Text style={s.locationTitle}>Where do we deliver?</Text>
              <Text style={s.locationSub}>
                We need your location to show live inventory & 10-Min ETA near you.
              </Text>
            </View>
          </View>

          {/* Perks badges */}
          <View style={s.perksRow}>
            <View style={s.perkPill}>
              <Text style={s.perkIcon}>⚡</Text>
              <Text style={s.perkText}>10-Min Delivery</Text>
            </View>
            <View style={s.perkPill}>
              <Text style={s.perkIcon}>📍</Text>
              <Text style={s.perkText}>Precise GPS</Text>
            </View>
            <View style={s.perkPill}>
              <Text style={s.perkIcon}>🎁</Text>
              <Text style={s.perkText}>Local Rewards</Text>
            </View>
          </View>

          {/* Use current location button */}
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={handleRequestPermission}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0B1B36" size="small" />
            ) : (
              <>
                <NavigationSvgIcon color="#0B1B36" size={18} />
                <Text style={s.primaryBtnText}>Use my current location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Enter location manually button */}
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={handleEnterManually}
            activeOpacity={0.8}
            disabled={loading}
          >
            <EditLocationSvgIcon color="#FBBF24" size={18} />
            <Text style={s.secondaryBtnText}>Enter location manually</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

/* -------------------------------------------------------------------------- */
/*                               STYLES                                       */
/* -------------------------------------------------------------------------- */
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071224',
  },

  mapBg: {
    flex: 1,
    backgroundColor: '#0A1A34',
    position: 'relative',
  },

  /* Search Overlay Header */
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(11, 27, 54, 0.92)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(11, 27, 54, 0.92)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 13.5,
    color: '#829AB8',
  },

  /* Grid & Map Styling */
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071224',
  },

  /* Map Roads */
  roadH1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#102446',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roadH2: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#122A50',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  roadV1: {
    position: 'absolute',
    left: '30%',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#102446',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roadV2: {
    position: 'absolute',
    left: '65%',
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: '#122A50',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  roadDiagonal: {
    position: 'absolute',
    width: W * 1.4,
    height: 12,
    backgroundColor: '#0F2242',
    transform: [{ rotate: '35deg' }],
  },

  /* Buildings & Parks */
  building1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 80,
    height: 70,
    backgroundColor: '#0A1830',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  building2: {
    position: 'absolute',
    top: '38%',
    right: '8%',
    width: 90,
    height: 60,
    backgroundColor: '#0A1830',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  building3: {
    position: 'absolute',
    bottom: '28%',
    left: '12%',
    width: 75,
    height: 75,
    backgroundColor: '#0A1830',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  parkArea: {
    position: 'absolute',
    top: '18%',
    right: '12%',
    width: 85,
    height: 85,
    backgroundColor: 'rgba(12, 131, 31, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(12, 131, 31, 0.25)',
  },
  riverArea: {
    position: 'absolute',
    bottom: '22%',
    right: '-10%',
    width: 140,
    height: 90,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },

  /* Pin & Radar Center */
  pinCenterAnchor: {
    position: 'absolute',
    top: '42%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  radarBeam: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
    borderTopColor: '#FBBF24',
  },
  bouncingPinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  etaBadgeText: {
    fontSize: 10.5,
    fontFamily: 'DMSans-Bold',
    color: '#0B1B36',
  },
  pinGlowFrame: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B1B36',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  pinShadowDot: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: 4,
  },

  /* SLEEK FLOATING SAPPHIRE BLUE SHEET */
  bottomSheet: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    paddingBottom: Platform.OS === 'android' ? 24 : 32,
    shadowColor: '#002B66',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FBBF24',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  pinIconBox: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  locationTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: isSmallDevice ? 20 : 23,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  locationSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },

  /* Feature Perks */
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  perkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18345C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    gap: 4,
  },
  perkIcon: { fontSize: 11 },
  perkText: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: '#E2E8F0',
  },

  /* Primary Button */
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15.5,
    color: '#0B1B36',
    letterSpacing: 0.3,
  },

  /* Secondary Button */
  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#162C50',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  secondaryBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#FBBF24',
  },
})
