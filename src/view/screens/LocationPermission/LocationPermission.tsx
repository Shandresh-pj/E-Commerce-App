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

const { width: W, height: H } = Dimensions.get('window')

interface LocationPermissionProps {
  navigation: any
}

export default function LocationPermission({ navigation }: LocationPermissionProps) {
  const [loading, setLoading] = useState(false)
  const sheetSlide = useRef(new Animated.Value(300)).current
  const sheetFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sheetSlide, {
        toValue: 0,
        tension: 50,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(sheetFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

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

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEE8" translucent={false} />

      {/* Map-like Background */}
      <View style={s.mapBg}>
        {/* Search bar overlay */}
        <SafeAreaView edges={['top']} style={s.searchOverlay}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>🔎</Text>
            <Text style={s.searchPlaceholder}>Search area, street, landmark...</Text>
          </View>
        </SafeAreaView>

        {/* Faux map grid lines */}
        <View style={s.gridContainer}>
          <View style={[s.gridLineH, { top: '25%' }]} />
          <View style={[s.gridLineH, { top: '50%' }]} />
          <View style={[s.gridLineH, { top: '75%' }]} />
          <View style={[s.gridLineV, { left: '20%' }]} />
          <View style={[s.gridLineV, { left: '45%' }]} />
          <View style={[s.gridLineV, { left: '70%' }]} />
          {/* Park-like green patches */}
          <View style={s.greenPatch1} />
          <View style={s.greenPatch2} />
          <View style={s.bluePatch} />
          {/* Road-like wider lines */}
          <View style={s.roadH} />
          <View style={s.roadV} />
        </View>
      </View>

      {/* Bottom Sheet */}
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
          <View style={s.locationHeader}>
            <View style={s.pinIconBox}>
              <Text style={s.pinIcon}>📍</Text>
            </View>
            <View style={s.locationTextWrap}>
              <Text style={s.locationTitle}>Where do we deliver?</Text>
              <Text style={s.locationSub}>
                We need your location to show stock & ETA near you.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={s.primaryBtn}
            onPress={handleRequestPermission}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={s.primaryBtnIcon}>⚡</Text>
                <Text style={s.primaryBtnText}>Use my current location</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={handleEnterManually}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={s.secondaryBtnText}>Enter location manually</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ECEEE8',
  },

  mapBg: {
    flex: 1,
    backgroundColor: '#ECEEE8',
  },

  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backArrow: {
    fontSize: 18,
    color: '#141414',
  },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { fontSize: 14 },
  searchPlaceholder: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#9a9a9a',
  },

  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(200,200,195,0.4)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(200,200,195,0.4)',
  },
  greenPatch1: {
    position: 'absolute',
    top: '22%',
    left: '35%',
    width: 80,
    height: 60,
    backgroundColor: 'rgba(200,220,190,0.5)',
    borderRadius: 4,
    transform: [{ rotate: '-5deg' }],
  },
  greenPatch2: {
    position: 'absolute',
    bottom: '25%',
    right: '5%',
    width: 70,
    height: 50,
    backgroundColor: 'rgba(200,220,190,0.4)',
    borderRadius: 4,
  },
  bluePatch: {
    position: 'absolute',
    bottom: '30%',
    left: '10%',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(190,210,230,0.35)',
    borderRadius: 4,
  },
  roadH: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roadV: {
    position: 'absolute',
    left: '55%',
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4E4E2',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 28,
  },
  pinIconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#FFE000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: 28,
  },
  locationTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  locationTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
    color: '#141414',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  locationSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8a8a8a',
    lineHeight: 20,
  },

  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  primaryBtnIcon: {
    fontSize: 16,
  },
  primaryBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  secondaryBtn: {
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E4E4E2',
  },
  secondaryBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#141414',
  },
})
