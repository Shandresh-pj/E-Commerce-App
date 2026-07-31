import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'

function PartnerNavigateToCustomer({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const dropIndex: number = route.params.dropIndex || 0
  const drop = order.drops[dropIndex]
  const isBatch = order.drops.length > 1
  const [arriving, setArriving] = useState(false)

  const handleCall = () => {
    Linking.openURL(`tel:${drop.customerPhone}`)
  }

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${drop.addressLine} ${drop.subAddressLine}`)
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
  }

  const handleArrived = async () => {
    setArriving(true)
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 700))
      navigation.replace('PartnerDeliverToCustomer', { order, dropIndex })
    } finally {
      setArriving(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />

      <View style={st.map}>
        <View style={[st.road, { top: '10%', left: '48%', width: 3, height: '35%', transform: [{ rotate: '4deg' }] }]} />
        <View style={[st.road, { top: '42%', left: '38%', width: 3, height: '32%', transform: [{ rotate: '-14deg' }] }]} />
        <View style={[st.road, { top: '68%', left: '30%', width: 3, height: '26%', transform: [{ rotate: '10deg' }] }]} />
        <View style={[st.roadGrey, { top: '20%', left: 0, right: 0, height: 3 }]} />
        <View style={[st.roadGrey, { top: '60%', left: 0, right: 0, height: 3, transform: [{ rotate: '-5deg' }] }]} />

        <View style={st.currentDotRing}>
          <View style={st.currentDot} />
        </View>
      </View>

      <SafeAreaView style={st.overlaySafe} edges={['top']} pointerEvents="box-none">
        <View style={st.turnBanner}>
          <View style={st.turnIconBox}>
            <Text style={st.turnIcon}>↱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.turnDistance}>400 m</Text>
            <Text style={st.turnInstruction}>Turn right onto 80 Ft Road</Text>
          </View>
        </View>
      </SafeAreaView>

      <SafeAreaView style={st.bottomSafe} edges={['bottom']}>
        <View style={st.deliveryCard}>
          <View style={st.deliveryTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={st.deliveryLabel}>
                DELIVERING TO{isBatch ? ` · DROP ${dropIndex + 1} OF ${order.drops.length}` : ''}
              </Text>
              <Text style={st.deliveryAddress}>
                {drop.addressLine} · {drop.aptLabel}
              </Text>
            </View>
            <View style={st.etaWrap}>
              <Text style={st.etaMinutes}>{drop.etaMinutes} min</Text>
              <Text style={st.etaKm}>{drop.distanceKm} km</Text>
            </View>
          </View>

          <View style={st.actionsRow}>
            <TouchableOpacity style={st.callBtn} onPress={handleCall} activeOpacity={0.85}>
              <Text style={st.callIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.mapsBtn} onPress={handleOpenMaps} activeOpacity={0.85}>
              <Text style={st.mapsBtnText}>📍 Open in Maps</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={st.arrivedBtn}
            onPress={handleArrived}
            disabled={arriving}
            activeOpacity={0.85}
          >
            {arriving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={st.arrivedBtnText}>I've arrived</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8E9E5' },

  map: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  road: { position: 'absolute', backgroundColor: '#5B8DEF', borderRadius: 2 },
  roadGrey: { position: 'absolute', backgroundColor: '#FFFFFF' },
  currentDotRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(91,141,239,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120,
  },
  currentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2E5FD1',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  overlaySafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  turnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#141414',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  turnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnIcon: { fontSize: 22, color: '#141414' },
  turnDistance: { fontFamily: PARTNER_FONT.bold, fontSize: 22, color: '#FFFFFF' },
  turnInstruction: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#9a9a9a', marginTop: 2 },

  bottomSafe: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  deliveryTopRow: { flexDirection: 'row', marginBottom: 16 },
  deliveryLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  deliveryAddress: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#141414' },
  etaWrap: { alignItems: 'flex-end' },
  etaMinutes: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#141414' },
  etaKm: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: '#9a9a9a', marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 20 },
  mapsBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapsBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#FFFFFF' },

  arrivedBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivedBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerNavigateToCustomer
