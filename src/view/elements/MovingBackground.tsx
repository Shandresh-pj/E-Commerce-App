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
import Svg, { Defs, RadialGradient, Stop, Circle, Rect } from 'react-native-svg'

const { width: W, height: H } = Dimensions.get('window')

interface MovingBackgroundProps {
  theme?: 'yellow' | 'dark' | 'yellow-dark'
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export const MovingBackground: React.FC<MovingBackgroundProps> = ({
  theme = 'dark',
  children,
  style,
}) => {
  const isDark = theme === 'dark' || theme === 'yellow-dark'

  // Slow ambient rotation for light field rays
  const rotateRays = useRef(new Animated.Value(0)).current

  // Extremely slow floating motion for 4 aurora blobs
  const orb1TranslateX = useRef(new Animated.Value(0)).current
  const orb1TranslateY = useRef(new Animated.Value(0)).current
  const orb1Scale = useRef(new Animated.Value(1)).current

  const orb2TranslateX = useRef(new Animated.Value(0)).current
  const orb2TranslateY = useRef(new Animated.Value(0)).current
  const orb2Scale = useRef(new Animated.Value(1)).current

  const orb3TranslateX = useRef(new Animated.Value(0)).current
  const orb3TranslateY = useRef(new Animated.Value(0)).current

  // Floating particles
  const particles = useRef(
    Array.from({ length: 12 }).map((_, i) => ({
      x: (i * (W / 12)) + (Math.random() * 20 - 10),
      startY: H + Math.random() * 100,
      animY: new Animated.Value(0),
      animOpacity: new Animated.Value(0.1 + Math.random() * 0.2),
      size: 2 + Math.random() * 3,
      speed: 16000 + Math.random() * 12000,
    }))
  ).current

  useEffect(() => {
    // 1. Slow rotation (45s cycle)
    Animated.loop(
      Animated.timing(rotateRays, {
        toValue: 1,
        duration: 45000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    // 2. Orb 1 (Cyan/Sapphire blob) floating
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1TranslateX, {
            toValue: W * 0.2,
            duration: 12000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1TranslateY, {
            toValue: H * 0.12,
            duration: 15000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1.25,
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1TranslateX, {
            toValue: -W * 0.15,
            duration: 14000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1TranslateY, {
            toValue: -H * 0.08,
            duration: 13000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 0.9,
            duration: 12000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start()

    // 3. Orb 2 (Violet/Gold blob) floating
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb2TranslateX, {
            toValue: -W * 0.25,
            duration: 16000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2TranslateY, {
            toValue: -H * 0.15,
            duration: 18000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1.3,
            duration: 14000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb2TranslateX, {
            toValue: W * 0.1,
            duration: 15000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2TranslateY, {
            toValue: H * 0.1,
            duration: 16000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1.0,
            duration: 15000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start()

    // 4. Orb 3 (Sapphire central glow) floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb3TranslateY, {
          toValue: H * 0.1,
          duration: 14000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb3TranslateY, {
          toValue: -H * 0.05,
          duration: 14000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // 5. Particles rising
    particles.forEach((p, idx) => {
      const animateParticle = () => {
        p.animY.setValue(0)
        Animated.timing(p.animY, {
          toValue: -H * 1.2,
          duration: p.speed,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => animateParticle())
      }
      setTimeout(() => animateParticle(), idx * 800)
    })
  }, [rotateRays, orb1TranslateX, orb1TranslateY, orb1Scale, orb2TranslateX, orb2TranslateY, orb2Scale, orb3TranslateY, particles])

  const spin = rotateRays.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  // Theme color variables
  const bgBaseColor = isDark ? '#050816' : '#F6F8FC'
  const gradientBase = isDark
    ? ['#050816', '#081126', '#0D172B']
    : ['#F6F8FC', '#EEF3FA', '#F6F8FC']

  return (
    <View style={[styles.container, { backgroundColor: bgBaseColor }, style]}>
      {/* Base Atmospheric Linear Gradient */}
      <LinearGradient
        colors={gradientBase}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Rotating Background Ambient Rays */}
      <Animated.View
        style={[
          styles.raysContainer,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Svg width={W * 2} height={W * 2} viewBox="0 0 400 400">
          <Defs>
            <RadialGradient id="rayGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={isDark ? '#2563EB' : '#3B82F6'} stopOpacity={isDark ? '0.15' : '0.08'} />
              <Stop offset="60%" stopColor={isDark ? '#8B5CF6' : '#22D3EE'} stopOpacity={isDark ? '0.06' : '0.04'} />
              <Stop offset="100%" stopColor={bgBaseColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="200" cy="200" r="200" fill="url(#rayGrad)" />
        </Svg>
      </Animated.View>

      {/* Floating Aurora Blob 1: Sapphire / Cyan */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            transform: [
              { translateX: orb1TranslateX },
              { translateY: orb1TranslateY },
              { scale: orb1Scale },
            ],
          },
        ]}
      >
        <Svg width={W * 1.2} height={W * 1.2} viewBox="0 0 300 300">
          <Defs>
            <RadialGradient id="aurora1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={isDark ? '#22D3EE' : '#3B82F6'} stopOpacity={isDark ? '0.22' : '0.12'} />
              <Stop offset="50%" stopColor={isDark ? '#2563EB' : '#22D3EE'} stopOpacity={isDark ? '0.14' : '0.06'} />
              <Stop offset="100%" stopColor={bgBaseColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="150" cy="150" r="150" fill="url(#aurora1)" />
        </Svg>
      </Animated.View>

      {/* Floating Aurora Blob 2: Violet / Gold */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            transform: [
              { translateX: orb2TranslateX },
              { translateY: orb2TranslateY },
              { scale: orb2Scale },
            ],
          },
        ]}
      >
        <Svg width={W * 1.1} height={W * 1.1} viewBox="0 0 300 300">
          <Defs>
            <RadialGradient id="aurora2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={isDark ? '#8B5CF6' : '#F6C453'} stopOpacity={isDark ? '0.20' : '0.10'} />
              <Stop offset="60%" stopColor={isDark ? '#F6C453' : '#8B5CF6'} stopOpacity={isDark ? '0.10' : '0.05'} />
              <Stop offset="100%" stopColor={bgBaseColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="150" cy="150" r="150" fill="url(#aurora2)" />
        </Svg>
      </Animated.View>

      {/* Floating Aurora Blob 3: Deep Atmosphere Glow */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            transform: [{ translateY: orb3TranslateY }],
          },
        ]}
      >
        <Svg width={W * 1.4} height={W * 1.4} viewBox="0 0 300 300">
          <Defs>
            <RadialGradient id="aurora3" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2563EB" stopOpacity={isDark ? '0.18' : '0.08'} />
              <Stop offset="100%" stopColor={bgBaseColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="150" cy="150" r="150" fill="url(#aurora3)" />
        </Svg>
      </Animated.View>

      {/* Subtle Rising Particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.startY,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.animOpacity,
              backgroundColor: isDark ? '#22D3EE' : '#2563EB',
              transform: [{ translateY: p.animY }],
            },
          ]}
        />
      ))}

      {/* Children Content Layer */}
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
    top: -W * 0.5,
    left: -W * 0.5,
    width: W * 2,
    height: W * 2,
    borderRadius: W,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    top: H * 0.02,
    left: -W * 0.2,
  },
  orb2: {
    top: H * 0.4,
    right: -W * 0.2,
  },
  orb3: {
    top: H * 0.2,
    left: W * 0.1,
  },
  particle: {
    position: 'absolute',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
})

export default MovingBackground
