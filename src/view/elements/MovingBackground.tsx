import React, { useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

const { width: W, height: H } = Dimensions.get('window')

interface MovingBackgroundProps {
  theme?: 'yellow' | 'dark' | 'yellow-dark'
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export const MovingBackground: React.FC<MovingBackgroundProps> = ({
  theme = 'yellow',
  children,
  style,
}) => {
  // 1. Rotating rays
  const rotateRays1 = useRef(new Animated.Value(0)).current
  const rotateRays2 = useRef(new Animated.Value(0)).current

  // 2. Floating aurora orbs
  const orb1X = useRef(new Animated.Value(0)).current
  const orb1Y = useRef(new Animated.Value(0)).current
  const orb1Scale = useRef(new Animated.Value(1)).current

  const orb2X = useRef(new Animated.Value(0)).current
  const orb2Y = useRef(new Animated.Value(0)).current
  const orb2Scale = useRef(new Animated.Value(1)).current

  const orb3X = useRef(new Animated.Value(0)).current
  const orb3Y = useRef(new Animated.Value(0)).current

  const orb4X = useRef(new Animated.Value(0)).current
  const orb4Y = useRef(new Animated.Value(0)).current

  const orb5X = useRef(new Animated.Value(0)).current
  const orb5Y = useRef(new Animated.Value(0)).current
  const orb5Scale = useRef(new Animated.Value(1)).current

  const orb6X = useRef(new Animated.Value(0)).current
  const orb6Y = useRef(new Animated.Value(0)).current

  // 3. Ripple pulse rings
  const ring1Scale = useRef(new Animated.Value(0.7)).current
  const ring1Opacity = useRef(new Animated.Value(0.6)).current

  const ring2Scale = useRef(new Animated.Value(0.5)).current
  const ring2Opacity = useRef(new Animated.Value(0.4)).current

  const ring3Scale = useRef(new Animated.Value(0.3)).current
  const ring3Opacity = useRef(new Animated.Value(0.2)).current

  // 4. Light streaks
  const streak1X = useRef(new Animated.Value(-W * 0.5)).current
  const streak1Opacity = useRef(new Animated.Value(0)).current

  // 5. Particle matrix
  const particlesUp = useRef(
    Array.from({ length: 16 }).map(() => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(0.8),
    })),
  ).current

  useEffect(() => {
    // Ray rotation 1
    Animated.loop(
      Animated.timing(rotateRays1, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Ray rotation 2
    Animated.loop(
      Animated.timing(rotateRays2, {
        toValue: 1,
        duration: 28000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Light streaks
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(streak1X, {
            toValue: W * 1.2,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(streak1Opacity, {
              toValue: 0.6,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(streak1Opacity, {
              toValue: 0,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(streak1X, {
          toValue: -W * 0.5,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
      ]),
    ).start()

    // Orb 1 animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1X, {
            toValue: W * 0.35,
            duration: 4600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Y, {
            toValue: H * 0.18,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1.35,
            duration: 4200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1X, {
            toValue: -W * 0.25,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Y, {
            toValue: -H * 0.1,
            duration: 6600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 0.9,
            duration: 4600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Orb 2 animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb2X, {
            toValue: -W * 0.32,
            duration: 6600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Y, {
            toValue: -H * 0.22,
            duration: 5600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1.4,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb2X, {
            toValue: W * 0.28,
            duration: 6000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Y, {
            toValue: H * 0.15,
            duration: 7000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 0.95,
            duration: 5600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Orbs 3 & 4 animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb3X, {
            toValue: W * 0.25,
            duration: 7500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb3Y, {
            toValue: H * 0.25,
            duration: 6000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb4X, {
            toValue: -W * 0.3,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(orb4Y, {
            toValue: -H * 0.15,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb3X, {
            toValue: -W * 0.2,
            duration: 8000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb3Y, {
            toValue: -H * 0.18,
            duration: 6600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb4X, {
            toValue: W * 0.25,
            duration: 7500,
            useNativeDriver: true,
          }),
          Animated.timing(orb4Y, {
            toValue: H * 0.2,
            duration: 8500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Orb 5 animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb5X, { toValue: W * 0.15, duration: 5600, useNativeDriver: true }),
          Animated.timing(orb5Y, { toValue: -H * 0.12, duration: 5600, useNativeDriver: true }),
          Animated.timing(orb5Scale, { toValue: 1.3, duration: 2800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orb5X, { toValue: -W * 0.15, duration: 5600, useNativeDriver: true }),
          Animated.timing(orb5Y, { toValue: H * 0.12, duration: 5600, useNativeDriver: true }),
          Animated.timing(orb5Scale, { toValue: 0.8, duration: 2800, useNativeDriver: true }),
        ]),
      ]),
    ).start()

    // Orb 6 animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb6X, { toValue: -W * 0.22, duration: 6200, useNativeDriver: true }),
          Animated.timing(orb6Y, { toValue: H * 0.14, duration: 6200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orb6X, { toValue: W * 0.22, duration: 6200, useNativeDriver: true }),
          Animated.timing(orb6Y, { toValue: -H * 0.14, duration: 6200, useNativeDriver: true }),
        ]),
      ]),
    ).start()

    // Ripple ring 1
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 1.7,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Opacity, {
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 0.7,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Opacity, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Ripple ring 2
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 1.8,
            duration: 5600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0.6,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 0.5,
            duration: 5600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0.15,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Ripple ring 3
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring3Scale, {
            toValue: 1.9,
            duration: 7000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring3Opacity, {
            toValue: 0.5,
            duration: 3500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring3Scale, {
            toValue: 0.3,
            duration: 7000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring3Opacity, {
            toValue: 0.1,
            duration: 3500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()

    // Floating particles
    particlesUp.forEach((p, idx) => {
      const dur = 4400 + (idx % 6) * 1000
      const delay = idx * 300
      const sway = (idx % 2 === 0 ? 1 : -1) * (18 + (idx % 5) * 7)

      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.y, {
              toValue: -H * 0.75,
              duration: dur,
              easing: Easing.out(Easing.linear),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(p.x, {
                toValue: sway,
                duration: dur * 0.5,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(p.x, {
                toValue: 0,
                duration: dur * 0.5,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(p.opacity, {
                toValue: 0.9,
                duration: dur * 0.35,
                useNativeDriver: true,
              }),
              Animated.timing(p.opacity, {
                toValue: 0,
                duration: dur * 0.65,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(p.scale, {
                toValue: 1.6,
                duration: dur * 0.5,
                useNativeDriver: true,
              }),
              Animated.timing(p.scale, {
                toValue: 0.4,
                duration: dur * 0.5,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(p.y, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(p.x, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.1, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      ).start()
    })
  }, [])

  const rotateRays1Interpolate = rotateRays1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const rotateRays2Interpolate = rotateRays2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  })

  const getGradientColors = () => {
    if (theme === 'dark') {
      return ['#0F172A', '#1E40AF', '#020617']
    }
    if (theme === 'yellow-dark') {
      return ['#0F172A', '#1E293B', '#1E40AF']
    }
    return ['#2563EB', '#1E40AF', '#0F172A']
  }

  const orb1Color =
    theme === 'dark' ? 'rgba(37, 99, 235, 0.25)' : 'rgba(251, 191, 36, 0.45)'
  const orb2Color =
    theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(37, 99, 235, 0.35)'
  const orb3Color =
    theme === 'dark' ? 'rgba(30, 64, 175, 0.18)' : 'rgba(245, 158, 11, 0.35)'
  const orb4Color =
    theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(219, 234, 254, 0.4)'
  const orb5Color =
    theme === 'dark' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(251, 191, 36, 0.3)'
  const orb6Color =
    theme === 'dark' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255, 255, 255, 0.35)'

  return (
    <View style={[styles.container, style]}>
      {/* Gradient backdrop */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Energy rays 1 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
        style={[
          styles.raysContainer,
          { transform: [{ perspective: 1000 }, { rotate: rotateRays1Interpolate }] },
        ]}
      >
        <LinearGradient
          colors={
            theme === 'dark'
              ? ['rgba(255,224,0,0.06)', 'transparent', 'rgba(255,224,0,0.06)']
              : ['rgba(255,255,255,0.4)', 'transparent', 'rgba(255,255,255,0.4)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Energy rays 2 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
        style={[
          styles.raysContainer,
          { transform: [{ perspective: 1000 }, { rotate: rotateRays2Interpolate }, { scale: 1.15 }] },
        ]}
      >
        <LinearGradient
          colors={
            theme === 'dark'
              ? ['rgba(255,180,0,0.04)', 'transparent', 'rgba(255,180,0,0.04)']
              : ['rgba(255,230,100,0.3)', 'transparent', 'rgba(255,230,100,0.3)']
          }
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Light streaks */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.cosmicStreak,
          {
            opacity: streak1Opacity,
            transform: [
              { perspective: 1000 },
              { translateX: streak1X },
              { rotate: '-35deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.45)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Ripple ring 1 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.ring,
          styles.ring1,
          {
            borderColor: theme === 'dark' ? 'rgba(255,224,0,0.15)' : 'rgba(255,255,255,0.5)',
            transform: [{ perspective: 1000 }, { scale: ring1Scale }],
            opacity: ring1Opacity,
          },
        ]}
      />

      {/* Ripple ring 2 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.ring,
          styles.ring2,
          {
            borderColor: theme === 'dark' ? 'rgba(255,200,0,0.12)' : 'rgba(255,255,255,0.4)',
            transform: [{ perspective: 1000 }, { scale: ring2Scale }],
            opacity: ring2Opacity,
          },
        ]}
      />

      {/* Ripple ring 3 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.ring,
          styles.ring3,
          {
            borderColor: theme === 'dark' ? 'rgba(255,180,0,0.1)' : 'rgba(255,255,255,0.3)',
            transform: [{ perspective: 1000 }, { scale: ring3Scale }],
            opacity: ring3Opacity,
          },
        ]}
      />

      {/* Sphere 1 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.orb,
          styles.orb1,
          { backgroundColor: orb1Color },
          {
            transform: [
              { perspective: 1000 },
              { translateX: orb1X },
              { translateY: orb1Y },
              { scale: orb1Scale },
            ],
          },
        ]}
      />

      {/* Sphere 2 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.orb,
          styles.orb2,
          { backgroundColor: orb2Color },
          {
            transform: [
              { perspective: 1000 },
              { translateX: orb2X },
              { translateY: orb2Y },
              { scale: orb2Scale },
            ],
          },
        ]}
      />

      {/* Sphere 3 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.orb,
          styles.orb3,
          { backgroundColor: orb3Color },
          {
            transform: [{ perspective: 1000 }, { translateX: orb3X }, { translateY: orb3Y }],
          },
        ]}
      />

      {/* Sphere 4 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.orb,
          styles.orb4,
          { backgroundColor: orb4Color },
          {
            transform: [{ perspective: 1000 }, { translateX: orb4X }, { translateY: orb4Y }],
          },
        ]}
      />

      {/* Sphere 5 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.orb,
          styles.orb5,
          { backgroundColor: orb5Color },
          {
            transform: [
              { perspective: 1000 },
              { translateX: orb5X },
              { translateY: orb5Y },
              { scale: orb5Scale },
            ],
          },
        ]}
      />

      {/* Sphere 6 */}
      <Animated.View
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
        style={[
          styles.orb,
          styles.orb6,
          { backgroundColor: orb6Color },
          {
            transform: [{ perspective: 1000 }, { translateX: orb6X }, { translateY: orb6Y }],
          },
        ]}
      />

      {/* Particle matrix */}
      {particlesUp.map((p, idx) => (
        <Animated.View
          pointerEvents="none"
          renderToHardwareTextureAndroid={true}
          key={`up-${idx}`}
          style={[
            styles.particleUp,
            {
              left: `${6 + (idx * 6) % 88}%`,
              top: `${40 + (idx % 4) * 13}%`,
              width: 4 + (idx % 3) * 2,
              height: 4 + (idx % 3) * 2,
              opacity: p.opacity,
            },
            {
              transform: [
                { perspective: 1000 },
                { translateY: p.y },
                { translateX: p.x },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}

      {/* Foreground content */}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  raysContainer: {
    position: 'absolute',
    top: -H * 0.45,
    left: -W * 0.45,
    width: W * 1.9,
    height: H * 1.9,
    borderRadius: W,
  },
  cosmicStreak: {
    position: 'absolute',
    top: H * 0.2,
    width: W * 0.8,
    height: 4,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 999,
  },
  ring1: {
    top: H * 0.08,
    left: W * 0.05,
    width: W * 0.9,
    height: W * 0.9,
  },
  ring2: {
    top: H * 0.25,
    right: W * 0.02,
    width: W * 0.8,
    height: W * 0.8,
  },
  ring3: {
    top: H * 0.45,
    left: W * 0.15,
    width: W * 0.7,
    height: W * 0.7,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    top: H * 0.05,
    left: W * 0.1,
    width: W * 0.65,
    height: W * 0.65,
  },
  orb2: {
    top: H * 0.3,
    right: W * 0.08,
    width: W * 0.55,
    height: W * 0.55,
  },
  orb3: {
    top: H * 0.55,
    left: W * 0.15,
    width: W * 0.45,
    height: W * 0.45,
  },
  orb4: {
    top: H * 0.18,
    right: W * 0.25,
    width: W * 0.38,
    height: W * 0.38,
  },
  orb5: {
    top: H * 0.4,
    left: W * 0.35,
    width: W * 0.42,
    height: W * 0.42,
  },
  orb6: {
    top: H * 0.22,
    left: W * 0.05,
    width: W * 0.48,
    height: W * 0.48,
  },
  particleUp: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
})

export default MovingBackground
