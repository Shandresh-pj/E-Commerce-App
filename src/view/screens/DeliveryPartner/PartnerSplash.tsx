import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

const { width: W, height: H } = Dimensions.get('window')
const AUTO_ADVANCE_MS = 1800

const GridBackground = () => {
  const cols = Math.ceil(W / 32)
  const rows = Math.ceil(H / 32)
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: cols }).map((_, i) => (
        <View key={`v${i}`} style={[st.gridLineV, { left: i * 32 }]} />
      ))}
      {Array.from({ length: rows }).map((_, i) => (
        <View key={`h${i}`} style={[st.gridLineH, { top: i * 32 }]} />
      ))}
    </View>
  )
}

function PartnerSplash({ navigation }: any) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0.4)).current
  const wordmarkFade = useRef(new Animated.Value(0)).current
  const wordmarkSlide = useRef(new Animated.Value(14)).current
  const dotsFade = useRef(new Animated.Value(0)).current
  const [activeDot] = useState(0)

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(wordmarkFade, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkSlide, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(dotsFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    const timer = setTimeout(goToLogin, AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [])

  const goToLogin = () => {
    navigation.replace('PartnerLogin')
  }

  return (
    <TouchableWithoutFeedback onPress={goToLogin}>
      <View style={st.root}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PARTNER_COLOR.bg}
          translucent={false}
        />
        <GridBackground />

        <View style={st.center}>
          <Animated.View
            style={[
              st.glow,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.9, 1.15] }) }],
              },
            ]}
          />
          <Animated.View
            style={[
              st.logoBox,
              { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={st.logoEmoji}>⚡</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: wordmarkFade,
              transform: [{ translateY: wordmarkSlide }],
              alignItems: 'center',
            }}
          >
            <Text style={st.wordmarkTop}>DASH</Text>
            <Text style={st.wordmarkBottom}>PARTNER</Text>
          </Animated.View>
        </View>

        <Animated.View style={[st.dotsRow, { opacity: dotsFade }]}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[st.dot, i === activeDot && st.dotActive]}
            />
          ))}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: PARTNER_COLOR.grid,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: PARTNER_COLOR.grid,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: PARTNER_COLOR.limeSoft,
  },
  logoBox: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: PARTNER_COLOR.lime,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 26,
    elevation: 12,
  },
  logoEmoji: { fontSize: 40, lineHeight: 48 },

  wordmarkTop: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 34,
    color: PARTNER_COLOR.textPrimary,
    letterSpacing: -1,
  },
  wordmarkBottom: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 18,
    color: PARTNER_COLOR.lime,
    letterSpacing: 6,
    marginTop: 2,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 44,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PARTNER_COLOR.border,
  },
  dotActive: {
    backgroundColor: PARTNER_COLOR.textPrimary,
    width: 20,
  },
})

export default PartnerSplash
