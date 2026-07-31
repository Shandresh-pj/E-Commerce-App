import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { usePartnerEarnings } from './PartnerEarningsContext'
import { getMockOrder, getMockBatchOrder } from './mockOrder'
import { WEEKLY_EARNINGS } from './partnerMockData'

const PARTNER_NAME = 'Rahul'
const LOCATION = 'HSR Layout, Bengaluru'
const ORDER_ARRIVAL_DELAY_MS = 6000

const formatDuration = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${h}h ${m}m`
}

const OfflineMap = () => (
  <View style={st.map}>
    <View style={[st.road, { top: '30%', left: 0, right: 0, height: 3 }]} />
    <View style={[st.road, { top: '55%', left: 0, right: 0, height: 3, transform: [{ rotate: '-6deg' }] }]} />
    <View style={[st.road, { left: '35%', top: 0, bottom: 0, width: 3 }]} />
    <View style={[st.road, { left: '68%', top: 0, bottom: 0, width: 3, transform: [{ rotate: '8deg' }] }]} />
    <View style={st.locationDot} />
  </View>
)

const SearchingPanel = ({ onOpenSurgeZone }: { onOpenSurgeZone: () => void }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return (
    <View style={st.searchingBody}>
      <View style={{ alignItems: 'center' }}>
        <View style={st.searchRingWrap}>
          <Animated.View
            style={[
              st.searchPulseRing,
              {
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
              },
            ]}
          />
          <View style={st.searchCircle}>
            <Text style={st.searchIcon}>🔍</Text>
          </View>
        </View>
        <Text style={st.searchingTitle}>Looking for orders…</Text>
        <Text style={st.searchingSubtitle}>
          No orders in your area yet. Stay online — we'll buzz you the moment one drops.
        </Text>
      </View>

      <TouchableOpacity style={st.surgeZoneCard} onPress={onOpenSurgeZone} activeOpacity={0.85}>
        <View style={st.surgeZoneIconBox}>
          <Text style={st.surgeZoneIcon}>⭐</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.surgeZoneTitle}>Busier zone nearby</Text>
          <Text style={st.surgeZoneSubtitle}>
            {WEEKLY_EARNINGS.surgeZone.area} · {WEEKLY_EARNINGS.surgeZone.bonusLabel}
          </Text>
        </View>
        <Text style={st.surgeZoneChevron}>›</Text>
      </TouchableOpacity>
    </View>
  )
}

function PartnerHome({ navigation, route }: any) {
  const { earnings } = usePartnerEarnings()
  const [isOnline, setIsOnline] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef<number | null>(null)
  const orderToggleCount = useRef(0)

  useEffect(() => {
    if (route.params?.goOnline) {
      setIsOnline(true)
      navigation.setParams({ goOnline: undefined })
    }
  }, [route.params?.goOnline])

  useEffect(() => {
    if (!isOnline) return
    startedAt.current = Date.now()
    setElapsed(0)
    const interval = setInterval(() => {
      if (startedAt.current) {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isOnline])

  useEffect(() => {
    if (!isOnline) return
    const timer = setTimeout(() => {
      orderToggleCount.current += 1
      const order = orderToggleCount.current % 2 === 0 ? getMockBatchOrder() : getMockOrder()
      navigation.getParent()?.navigate('PartnerOrderRequest', { order })
    }, ORDER_ARRIVAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isOnline])

  const handleGoOnlinePress = () => {
    navigation.getParent()?.navigate('PartnerGoOnlineGate')
  }

  const handleGoOffline = () => setIsOnline(false)

  const openNotifications = () => navigation.getParent()?.navigate('PartnerNotifications')

  const openSurgeZone = () => {
    navigation.navigate('PartnerEarnings')
  }

  return (
    <View style={st.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isOnline ? PARTNER_COLOR.green : PARTNER_COLOR.bg}
        translucent={false}
      />
      <SafeAreaView
        edges={['top']}
        style={[st.headerSafe, isOnline && st.headerSafeOnline]}
      >
        <View style={st.headerRow}>
          <View style={[st.avatarCircle, isOnline && st.avatarCircleOnline]}>
            <Text style={[st.avatarText, isOnline && st.avatarTextOnline]}>
              {PARTNER_NAME[0]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {isOnline ? (
              <>
                <View style={st.onlineStatusRow}>
                  <View style={st.onlineDot} />
                  <Text style={st.onlineStatusText}>You're online</Text>
                </View>
                <Text style={st.searchingText}>Quiet right now</Text>
              </>
            ) : (
              <>
                <Text style={st.greeting}>Hi, {PARTNER_NAME}</Text>
                <Text style={st.locationText}>📍 {LOCATION}</Text>
              </>
            )}
          </View>

          {isOnline ? (
            <View style={st.onlineBadgeWrap}>
              <View style={st.onlineBadge}>
                <Text style={st.onlineBadgeText}>ONLINE</Text>
              </View>
              <Text style={st.durationText}>{formatDuration(elapsed)}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={st.bellBtn}
              onPress={openNotifications}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={st.bellIcon}>🔔</Text>
              <View style={st.bellDot} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {isOnline ? <SearchingPanel onOpenSurgeZone={openSurgeZone} /> : <OfflineMap />}

      {isOnline ? (
        <View style={st.goOfflineFooter}>
          <TouchableOpacity style={st.goOfflinePill} onPress={handleGoOffline} activeOpacity={0.85}>
            <View style={st.goOfflineDot} />
            <Text style={st.goOfflinePillText}>Go offline</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={st.floatingCard}>
          <View style={st.cardLight}>
            <View style={st.earningsRow}>
              <View>
                <Text style={st.earningsLabel}>TODAY'S EARNINGS</Text>
                <Text style={st.earningsAmount}>
                  ₹{earnings.amount} · {earnings.orders} orders
                </Text>
              </View>
              <View style={st.gpsPill}>
                <View style={st.gpsDot} />
                <Text style={st.gpsText}>GPS Strong</Text>
              </View>
            </View>

            <View style={st.offlineBar}>
              <View>
                <Text style={st.offlineTitle}>You're offline</Text>
                <Text style={st.offlineSubtitle}>Go online to receive orders</Text>
              </View>
              <TouchableOpacity style={st.goOnlineBtn} onPress={handleGoOnlinePress} activeOpacity={0.85}>
                <Text style={st.goOnlineText}>GO ONLINE →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F0' },

  headerSafe: { backgroundColor: '#FFFFFF' },
  headerSafeOnline: { backgroundColor: PARTNER_COLOR.green },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleOnline: { backgroundColor: '#FFFFFF' },
  avatarText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 17,
    color: PARTNER_COLOR.lime,
  },
  avatarTextOnline: { color: PARTNER_COLOR.green },

  greeting: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#141414' },
  locationText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12.5,
    color: '#8A8A8A',
    marginTop: 2,
  },

  onlineStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  onlineStatusText: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#FFFFFF' },
  searchingText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  onlineBadgeWrap: { alignItems: 'flex-end', gap: 4 },
  onlineBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  onlineBadgeText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: PARTNER_COLOR.green,
    letterSpacing: 0.5,
  },
  durationText: {
    fontFamily: PARTNER_FONT.medium,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.9)',
  },

  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F4F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 17 },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C0392B',
    borderWidth: 1.5,
    borderColor: '#F4F5F0',
  },

  map: {
    flex: 1,
    backgroundColor: '#E4E4E2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  road: { position: 'absolute', backgroundColor: '#FFFFFF' },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#9a9a9a',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  searchingBody: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  searchRingWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  searchPulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#9a9a9a',
  },
  searchCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  searchIcon: { fontSize: 28 },
  searchingTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 17, color: '#141414', marginBottom: 8 },
  searchingSubtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },

  surgeZoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  surgeZoneIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(198,255,77,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surgeZoneIcon: { fontSize: 18 },
  surgeZoneTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF', marginBottom: 2 },
  surgeZoneSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#9a9a9a' },
  surgeZoneChevron: { fontSize: 20, color: '#6B7076' },

  goOfflineFooter: { paddingHorizontal: 24, paddingBottom: 28 },
  goOfflinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  goOfflineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0C831F' },
  goOfflinePillText: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#141414' },

  floatingCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
  },

  cardLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    gap: 14,
  },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  earningsLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  earningsAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 19, color: '#141414' },
  gpsPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gpsDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0C831F' },
  gpsText: { fontFamily: PARTNER_FONT.medium, fontSize: 12, color: '#0C831F' },

  offlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offlineTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },
  offlineSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: '#9a9a9a', marginTop: 1 },
  goOnlineBtn: {
    backgroundColor: PARTNER_COLOR.green,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  goOnlineText: { fontFamily: PARTNER_FONT.bold, fontSize: 13, color: '#FFFFFF' },
})

export default PartnerHome
