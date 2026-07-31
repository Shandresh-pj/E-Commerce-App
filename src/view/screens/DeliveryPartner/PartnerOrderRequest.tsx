import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'

function PartnerOrderRequest({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const isBatch = order.drops.length > 1
  const [secondsLeft, setSecondsLeft] = useState(order.autoRejectSeconds)
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start()
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleReject()
      return
    }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const handleAccept = () => {
    navigation.replace('PartnerPickup', { order: { ...order, acceptedAt: Date.now() } })
  }

  const handleReject = () => {
    navigation.goBack()
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.badgeRow}>
          <View style={[st.newOrderDot, isBatch && st.batchDot]} />
          <Text style={st.newOrderLabel}>
            {isBatch ? `BATCH ORDER · ${order.drops.length} DROPS` : 'NEW ORDER'}
          </Text>
        </View>

        {isBatch ? (
          <Animated.View style={[st.batchHeader, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={st.batchAmount}>₹{order.earn}</Text>
            <Text style={st.batchSubtitle}>
              One pickup · {order.drops.length} nearby drops · {order.distanceKm} km total
            </Text>
          </Animated.View>
        ) : (
          <Animated.View style={[st.countdownWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={st.countdownRing}>
              <Text style={st.earnLabel}>EARN</Text>
              <Text style={st.earnAmount}>₹{order.earn}</Text>
            </View>
            <Text style={st.autoRejectText}>Auto-rejects in {secondsLeft}s</Text>
          </Animated.View>
        )}

        <View style={st.detailsCard}>
          {isBatch ? (
            <>
              <Text style={st.stopLabel}>PICKUP · both orders</Text>
              <Text style={[st.stopTitle, { marginBottom: 16 }]}>{order.pickup.name}</Text>

              {order.drops.map((drop, i) => (
                <View key={i} style={st.stopRow}>
                  <View style={st.stopMarkerCol}>
                    <View style={st.dropNumberBadge}>
                      <Text style={st.dropNumberText}>{i + 1}</Text>
                    </View>
                    {i < order.drops.length - 1 && <View style={st.stopConnector} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.stopLabel}>
                      DROP {i + 1} · {drop.distanceKm} km
                    </Text>
                    <Text style={st.stopTitle}>{drop.addressLine}</Text>
                    <Text style={st.stopSubtitle}>{drop.itemsLabel}</Text>
                  </View>
                </View>
              ))}

              {!!order.batchBonus && (
                <View style={st.batchBonusPill}>
                  <Text style={st.batchBonusText}>+₹{order.batchBonus} batch bonus included</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={st.pillRow}>
                <View style={st.pill}>
                  <Text style={st.pillText}>{order.paymentType}</Text>
                </View>
                <View style={[st.pill, st.pillGrey]}>
                  <Text style={[st.pillText, st.pillTextGrey]}>{order.itemCount} items</Text>
                </View>
                <View style={{ flex: 1 }} />
                <Text style={st.distanceText}>
                  {order.distanceKm} km · {order.etaMinutes} min
                </Text>
              </View>

              <View style={st.stopRow}>
                <View style={st.stopMarkerCol}>
                  <View style={st.pickupDot} />
                  <View style={st.stopConnector} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.stopLabel}>PICKUP · {order.pickup.distanceKm} km</Text>
                  <Text style={st.stopTitle}>{order.pickup.name}</Text>
                  <Text style={st.stopSubtitle}>{order.pickup.addressLine}</Text>
                </View>
              </View>

              <View style={st.stopRow}>
                <View style={st.stopMarkerCol}>
                  <View style={st.dropDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.stopLabel}>DROP · {order.drops[0].distanceKm} km</Text>
                  <Text style={st.stopTitle}>{order.drops[0].addressLine}</Text>
                  <Text style={st.stopSubtitle}>{order.drops[0].subAddressLine}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={st.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
          <Text style={st.acceptBtnText}>{isBatch ? 'Accept batch →' : 'Accept order →'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.rejectBtn} onPress={handleReject} activeOpacity={0.7}>
          <Text style={st.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1, paddingHorizontal: 20 },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  newOrderDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: PARTNER_COLOR.lime },
  batchDot: { backgroundColor: '#0C831F' },
  newOrderLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 12,
    color: PARTNER_COLOR.textSecondary,
    letterSpacing: 1.4,
  },

  countdownWrap: { alignItems: 'center', marginTop: 28, marginBottom: 24 },
  countdownRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: PARTNER_COLOR.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  earnAmount: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 32,
    color: PARTNER_COLOR.textPrimary,
  },
  autoRejectText: {
    fontFamily: PARTNER_FONT.medium,
    fontSize: 13,
    color: PARTNER_COLOR.lime,
    marginTop: 14,
  },

  batchHeader: { alignItems: 'center', marginTop: 28, marginBottom: 24 },
  batchAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 40, color: '#FFFFFF', marginBottom: 8 },
  batchSubtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13,
    color: PARTNER_COLOR.textSecondary,
    textAlign: 'center',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  pill: {
    backgroundColor: '#E4F6E6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillGrey: { backgroundColor: '#F0F0EE' },
  pillText: { fontFamily: PARTNER_FONT.bold, fontSize: 11.5, color: '#0C831F' },
  pillTextGrey: { color: '#6B6B6B' },
  distanceText: { fontFamily: PARTNER_FONT.medium, fontSize: 12, color: '#6B6B6B' },

  stopRow: { flexDirection: 'row', gap: 12 },
  stopMarkerCol: { alignItems: 'center', width: 20 },
  pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#141414', marginTop: 4 },
  dropDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0C831F', marginTop: 4 },
  dropNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropNumberText: { fontFamily: PARTNER_FONT.bold, fontSize: 10.5, color: PARTNER_COLOR.lime },
  stopConnector: { width: 2, flex: 1, minHeight: 20, backgroundColor: '#D7D7D4', marginVertical: 4 },
  stopLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  stopTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#141414', marginBottom: 2 },
  stopSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#8A8A8A', marginBottom: 14 },

  batchBonusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E4F6E6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  batchBonusText: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: '#0C831F' },

  acceptBtn: {
    height: 58,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  acceptBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16.5, color: '#FFFFFF' },
  rejectBtn: { alignItems: 'center', paddingVertical: 8, marginBottom: 4 },
  rejectBtnText: { fontFamily: PARTNER_FONT.medium, fontSize: 14, color: PARTNER_COLOR.textSecondary },
})

export default PartnerOrderRequest
