import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

const BENEFITS = [
  {
    emoji: '📋',
    title: 'Match you to nearby orders',
    subtitle: 'Only stores & drops close to you',
  },
  {
    emoji: '⚡',
    title: 'Accurate navigation & ETA',
    subtitle: 'Best route to store and customer',
  },
  {
    emoji: '🛡',
    title: 'Your safety on the road',
    subtitle: 'Share live location during SOS',
  },
]

function PartnerLocationPriming({ navigation }: any) {
  const [requesting, setRequesting] = useState(false)
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const handleAllow = async () => {
    setRequesting(true)
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location permission',
          message: 'DASH needs your location while using the app to put you to work.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        })
      }
      navigation.replace('PartnerOnboarding')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.pinWrap}>
          <Animated.View
            style={[
              st.pulseRing,
              {
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] }) }],
              },
            ]}
          />
          <View style={st.pinCircle}>
            <Text style={st.pinIcon}>📍</Text>
          </View>
        </View>

        <Text style={st.title}>Turn on location</Text>
        <Text style={st.subtitle}>
          DASH needs your location while using the app to put you to work. Here's why:
        </Text>

        <View style={st.benefitsList}>
          {BENEFITS.map(b => (
            <View key={b.title} style={st.benefitRow}>
              <View style={st.benefitIconBox}>
                <Text style={st.benefitEmoji}>{b.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.benefitTitle}>{b.title}</Text>
                <Text style={st.benefitSubtitle}>{b.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={st.allowBtn}
          onPress={handleAllow}
          disabled={requesting}
          activeOpacity={0.85}
        >
          {requesting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={st.allowBtnText}>Allow location access</Text>
          )}
        </TouchableOpacity>
        <Text style={st.hintText}>Choose "Allow while using app" on the next prompt</Text>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },

  pinWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PARTNER_COLOR.lime,
  },
  pinCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: { fontSize: 36 },

  title: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: PARTNER_COLOR.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },

  benefitsList: { gap: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitEmoji: { fontSize: 18 },
  benefitTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF', marginBottom: 2 },
  benefitSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted },

  allowBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  allowBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
  hintText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    textAlign: 'center',
    marginBottom: 6,
  },
})

export default PartnerLocationPriming
