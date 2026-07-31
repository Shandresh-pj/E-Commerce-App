import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'
import { usePartnerEarnings } from './PartnerEarningsContext'

function PartnerOrderComplete({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const { earnings, completeDelivery } = usePartnerEarnings()
  const [todayTotal] = useState(earnings.amount + order.earn + order.tip)
  const settledRef = useRef(false)
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const checkScale = useRef(new Animated.Value(0)).current

  const baseEarn = order.batchBonus ? order.earn - order.batchBonus : order.earn

  const deliveryMinutes = order.acceptedAt
    ? Math.max(1, Math.round((Date.now() - order.acceptedAt) / 60000))
    : order.etaMinutes

  useEffect(() => {
    if (!settledRef.current) {
      settledRef.current = true
      completeDelivery(order.earn + order.tip)
    }

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start()
  }, [])

  const goToHome = () => navigation.reset({ index: 0, routes: [{ name: 'PartnerHomeTabs' }] })

  const handleBreak = () => {
    Alert.alert('Break started', "You're offline for the next 15 minutes.", [
      { text: 'OK', onPress: goToHome },
    ])
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <Animated.View
          style={[st.centerBlock, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={st.glow} />
          <Animated.View style={[st.successCircle, { transform: [{ scale: checkScale }] }]}>
            <Text style={st.successCheck}>✓</Text>
          </Animated.View>
          <Text style={st.title}>Delivered!</Text>
          <Text style={st.subtitle}>
            Order #{order.id} · {deliveryMinutes} min
          </Text>
        </Animated.View>

        <View style={st.summaryCard}>
          <View style={st.summaryRow}>
            <Text style={st.summaryLabel}>Order earning</Text>
            <Text style={st.summaryValuePositive}>+₹{baseEarn}</Text>
          </View>
          {!!order.batchBonus && (
            <View style={st.summaryRow}>
              <Text style={st.summaryLabel}>Batch bonus</Text>
              <Text style={st.summaryValuePositive}>+₹{order.batchBonus}</Text>
            </View>
          )}
          {order.tip > 0 && (
            <View style={st.summaryRow}>
              <Text style={st.summaryLabel}>Customer tip</Text>
              <Text style={st.summaryValuePositive}>+₹{order.tip}</Text>
            </View>
          )}
          <View style={st.summaryDivider} />
          <View style={st.summaryRow}>
            <Text style={st.summaryTotalLabel}>Today's total</Text>
            <Text style={st.summaryTotalValue}>₹{todayTotal}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={st.findingRow}>
          <View style={st.findingDot} />
          <Text style={st.findingText}>Finding your next order…</Text>
        </View>

        <TouchableOpacity style={st.nextOrderBtn} onPress={goToHome} activeOpacity={0.85}>
          <Text style={st.nextOrderBtnText}>Ready for next order</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBreak} style={st.breakWrap}>
          <Text style={st.breakText}>Take a 15-min break</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1, paddingHorizontal: 20 },

  centerBlock: { alignItems: 'center', marginTop: 40, marginBottom: 28 },
  glow: {
    position: 'absolute',
    top: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(12,131,31,0.18)',
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successCheck: { fontSize: 40, color: '#FFFFFF', fontFamily: PARTNER_FONT.bold },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 26, color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 13.5, color: PARTNER_COLOR.textSecondary },

  summaryCard: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 14, color: PARTNER_COLOR.textSecondary },
  summaryValuePositive: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: PARTNER_COLOR.lime },
  summaryDivider: { height: 1, backgroundColor: PARTNER_COLOR.border, marginVertical: 4, marginBottom: 12 },
  summaryTotalLabel: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#FFFFFF' },
  summaryTotalValue: { fontFamily: PARTNER_FONT.bold, fontSize: 17, color: '#FFFFFF' },

  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  findingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: PARTNER_COLOR.lime },
  findingText: { fontFamily: PARTNER_FONT.medium, fontSize: 13, color: PARTNER_COLOR.textSecondary },

  nextOrderBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nextOrderBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
  breakWrap: { alignItems: 'center', paddingBottom: 8 },
  breakText: { fontFamily: PARTNER_FONT.medium, fontSize: 13, color: PARTNER_COLOR.textSecondary },
})

export default PartnerOrderComplete
