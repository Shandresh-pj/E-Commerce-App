import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
  Linking,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'

const { width: W } = Dimensions.get('window')

const STEPS = [
  { icon: '📦', title: 'Order confirmed', sub: 'Packed & ready at the store' },
  { icon: '🛵', title: 'Rider assigned', sub: 'Aman is picking up your order' },
  { icon: '⏱️', title: 'On the way', sub: 'Your order is arriving soon' },
  { icon: '🎉', title: 'Delivered', sub: 'Enjoy your goodies!' },
]

const OrderTrackingScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderNumber = route.params?.orderNumber ?? 'JIF348086'
  const total = route.params?.total ?? 0
  const itemCount = route.params?.itemCount ?? 1

  const [activeStep, setActiveStep] = useState(0)
  const riderX = useRef(new Animated.Value(0)).current

  // Advance the timeline for a live feel
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 4000)
    return () => clearInterval(id)
  }, [])

  // Nudge the rider marker along the route
  useEffect(() => {
    Animated.timing(riderX, {
      toValue: Math.min(activeStep / (STEPS.length - 1), 1),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [activeStep, riderX])

  const translateX = riderX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, W - 150],
  })

  const call = () => Linking.openURL('tel:+919876543210').catch(() => {})

  return (
    <View style={s.root}>
      <StatusBar backgroundColor="#ECEEE8" barStyle="dark-content" />

      {/* Faux map */}
      <LinearGradient colors={['#E9EDE6', '#F1F3EE']} style={s.map}>
        {[...Array(6)].map((_, i) => (
          <View key={`h${i}`} style={[s.gridLine, { top: 70 * (i + 1) }]} />
        ))}
        {[...Array(5)].map((_, i) => (
          <View key={`v${i}`} style={[s.gridLineV, { left: 70 * (i + 1) }]} />
        ))}
        <View style={s.roadDiag} />

        <SafeAreaView edges={['top']}>
          <View style={s.mapTop}>
            <TouchableOpacity style={s.roundBtn} onPress={() => navigation.goBack()}>
              <Text style={s.roundIcon}>←</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Route */}
        <View style={s.routeWrap}>
          <View style={s.dashRow}>
            {[...Array(14)].map((_, i) => (
              <View key={i} style={s.dash} />
            ))}
          </View>
          <Animated.View style={[s.riderMarker, { transform: [{ translateX }] }]}>
            <Text style={{ fontSize: 20 }}>🛵</Text>
          </Animated.View>
          <View style={s.youMarker}>
            <Text style={s.youText}>YOU</Text>
          </View>
          <View style={s.youDot} />
        </View>
      </LinearGradient>

      {/* Sheet */}
      <View style={s.sheet}>
        <View style={s.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          {/* ETA */}
          <View style={s.etaCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.etaLabel}>ESTIMATED ARRIVAL</Text>
              <Text style={s.etaValue}>8 min</Text>
              <Text style={s.etaOrder}>Order #{orderNumber}</Text>
            </View>
            <View style={s.etaBolt}>
              <Text style={{ fontSize: 30 }}>⚡</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={s.timelineCard}>
            {STEPS.map((step, idx) => {
              const done = idx <= activeStep
              const isLast = idx === STEPS.length - 1
              return (
                <View key={step.title} style={s.stepRow}>
                  <View style={s.stepIconCol}>
                    <View style={[s.stepIcon, done ? s.stepIconDone : s.stepIconIdle]}>
                      <Text style={{ fontSize: 15, opacity: done ? 1 : 0.5 }}>{step.icon}</Text>
                    </View>
                    {!isLast && <View style={[s.stepLine, done && s.stepLineDone]} />}
                  </View>
                  <View style={s.stepInfo}>
                    <Text style={[s.stepTitle, !done && s.stepTitleIdle]}>{step.title}</Text>
                    <Text style={s.stepSub}>{step.sub}</Text>
                  </View>
                </View>
              )
            })}
          </View>

          {/* Delivery partner */}
          <View style={s.riderCard}>
            <View style={s.riderAvatar}>
              <Text style={s.riderAvatarText}>A</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.riderNameRow}>
                <Text style={s.riderName}>Aman K.</Text>
                <View style={s.riderRating}>
                  <Text style={s.riderRatingText}>4.9 ★</Text>
                </View>
              </View>
              <Text style={s.riderSub}>Your delivery partner · KA-01 8821</Text>
            </View>
            <TouchableOpacity style={s.riderCall} onPress={call} activeOpacity={0.85}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.riderChat} activeOpacity={0.85}>
              <Text style={{ fontSize: 17 }}>💬</Text>
            </TouchableOpacity>
          </View>

          {/* Order summary */}
          <TouchableOpacity
            style={s.summaryCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View>
              <Text style={s.summaryTitle}>Order summary</Text>
              <Text style={s.summarySub}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.summaryLink}>View details ›</Text>
              {total > 0 && <Text style={s.summaryTotal}>₹{total.toLocaleString('en-IN')}</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.homeBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={s.homeBtnText}>Back to home</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECEEE8' },

  map: { height: 360, overflow: 'hidden' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.04)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.04)' },
  roadDiag: {
    position: 'absolute',
    top: 150,
    left: -40,
    right: -40,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.7)',
    transform: [{ rotate: '-4deg' }],
  },
  mapTop: { paddingHorizontal: 16, paddingTop: 8 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  roundIcon: { fontSize: 19, color: '#141414' },

  routeWrap: { position: 'absolute', top: 210, left: 40, right: 40 },
  dashRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dash: { width: 12, height: 3, borderRadius: 2, backgroundColor: '#141414' },
  riderMarker: {
    position: 'absolute',
    top: -22,
    left: -6,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFE000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  youMarker: {
    position: 'absolute',
    right: -14,
    top: -30,
    backgroundColor: '#0C831F',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  youText: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 11 },
  youDot: {
    position: 'absolute',
    right: -4,
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0C831F',
    borderWidth: 3,
    borderColor: '#fff',
  },

  sheet: {
    flex: 1,
    marginTop: -26,
    backgroundColor: '#F7F8F4',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D9D9D5', alignSelf: 'center', marginTop: 10 },
  sheetContent: { padding: 16, paddingBottom: 30 },

  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  etaLabel: { fontFamily: 'DMSans-Bold', fontSize: 11, color: '#8f8f8f', letterSpacing: 0.6 },
  etaValue: { fontFamily: 'DMSans-Bold', fontSize: 34, color: '#FFE000', marginTop: 2, letterSpacing: -0.5 },
  etaOrder: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#fff', marginTop: 4 },
  etaBolt: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: '#FFE000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepIconCol: { alignItems: 'center', width: 36 },
  stepIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepIconDone: { backgroundColor: '#0C831F' },
  stepIconIdle: { backgroundColor: '#EDEDEA' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#EDEDEA', marginVertical: 2, minHeight: 20 },
  stepLineDone: { backgroundColor: '#0C831F' },
  stepInfo: { flex: 1, paddingBottom: 20 },
  stepTitle: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  stepTitleIdle: { color: '#B4B4B0' },
  stepSub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#9a9a9a', marginTop: 2 },

  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#141414' },
  riderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riderName: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  riderRating: { backgroundColor: '#E4F6E6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  riderRatingText: { fontFamily: 'DMSans-Bold', fontSize: 11, color: '#0C831F' },
  riderSub: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#9a9a9a', marginTop: 3 },
  riderCall: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#0C831F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderChat: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },
  summaryTitle: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  summarySub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#9a9a9a', marginTop: 3 },
  summaryLink: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#0C831F' },
  summaryTotal: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414', marginTop: 3 },

  homeBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#E4E4E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
})

export default OrderTrackingScreen
