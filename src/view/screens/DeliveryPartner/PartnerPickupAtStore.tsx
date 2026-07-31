import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'

const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

function PartnerPickupAtStore({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const [checked, setChecked] = useState<boolean[]>(order.verifyItems.map(() => false))
  const [handoverConfirmed, setHandoverConfirmed] = useState(false)

  useEffect(() => {
    if (route.params?.handoverConfirmed) {
      setHandoverConfirmed(true)
      navigation.setParams({ handoverConfirmed: undefined })
    }
  }, [route.params?.handoverConfirmed])

  const checkedCount = checked.filter(Boolean).length
  const allChecked = checkedCount === order.verifyItems.length
  const canConfirmPickup = allChecked && handoverConfirmed

  const toggleItem = (index: number) => {
    setChecked(prev => prev.map((v, i) => (i === index ? !v : v)))
  }

  const handleCall = () => {
    Linking.openURL(`tel:${order.pickup.phone}`)
  }

  const handleScanQr = () => {
    Alert.alert('Scanning…', 'Point the camera at the bag QR code.', [
      {
        text: 'Simulate scan',
        onPress: () => setHandoverConfirmed(true),
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleEnterOtp = () => {
    navigation.navigate('PartnerPickupOtpEntry', { order })
  }

  const handleConfirmPickup = () => {
    if (!canConfirmPickup) return
    navigation.replace('PartnerNavigateToCustomer', { order })
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_BG} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.headerRow}>
          <TouchableOpacity
            style={st.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={st.stepLabel}>Order #{order.id} · Step 1 of 2</Text>
            <Text style={st.title}>Pickup at store</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <View style={st.storeCard}>
            <View style={st.storeIconBox}>
              <Text style={st.storeEmoji}>🏬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.storeName}>{order.pickup.name}</Text>
              <Text style={st.storeSub}>
                Pickup bay {order.pickup.bay} · {order.pickup.counter}
              </Text>
            </View>
            <TouchableOpacity style={st.callBtn} onPress={handleCall} activeOpacity={0.85}>
              <Text style={st.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          <View style={st.sectionHeaderRow}>
            <Text style={st.sectionTitle}>Verify items</Text>
            <Text style={st.sectionCount}>
              {checkedCount}/{order.verifyItems.length} checked
            </Text>
          </View>

          <View style={st.itemsCard}>
            {order.verifyItems.map((item, index) => {
              const isChecked = checked[index]
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[st.itemRow, index === order.verifyItems.length - 1 && st.itemRowLast]}
                  onPress={() => toggleItem(index)}
                  activeOpacity={0.75}
                >
                  <View style={[st.checkbox, isChecked && st.checkboxChecked]}>
                    {isChecked && <Text style={st.checkboxTick}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.itemName}>{item.name}</Text>
                    <Text style={st.itemQty}>x{item.qty}</Text>
                  </View>
                  {!isChecked && <Text style={st.tapToCheck}>Tap to check</Text>}
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={st.handoverCard}>
            <Text style={st.sectionTitle}>Confirm handover</Text>
            <Text style={st.handoverSub}>Scan the bag QR or enter the store OTP</Text>
            <View style={st.handoverRow}>
              <TouchableOpacity
                style={[st.handoverBtn, st.handoverBtnDark, handoverConfirmed && st.handoverBtnDone]}
                onPress={handleScanQr}
                activeOpacity={0.85}
              >
                <Text style={st.handoverBtnDarkText}>
                  {handoverConfirmed ? '✓ Confirmed' : '⬛ Scan QR'}
                </Text>
              </TouchableOpacity>
              {!handoverConfirmed && (
                <TouchableOpacity
                  style={[st.handoverBtn, st.handoverBtnLight]}
                  onPress={handleEnterOtp}
                  activeOpacity={0.85}
                >
                  <Text style={st.handoverBtnLightText}>Enter OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={st.footer}>
          <TouchableOpacity
            style={[st.confirmBtn, !canConfirmPickup && st.confirmBtnDisabled]}
            onPress={handleConfirmPickup}
            disabled={!canConfirmPickup}
            activeOpacity={0.85}
          >
            <Text style={[st.confirmBtnText, !canConfirmPickup && st.confirmBtnTextDisabled]}>
              {canConfirmPickup ? 'Confirm pickup' : 'Confirm pickup · check all items'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },
  safe: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEA',
  },
  backIcon: { fontSize: 17, color: TEXT_DARK },
  stepLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#9a9a9a' },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: TEXT_DARK, marginTop: 1 },

  body: { padding: 20, paddingBottom: 8, gap: 20 },

  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  storeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PARTNER_COLOR.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeEmoji: { fontSize: 21 },
  storeName: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: TEXT_DARK },
  storeSub: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 17 },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -8,
  },
  sectionTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: TEXT_DARK },
  sectionCount: { fontFamily: PARTNER_FONT.medium, fontSize: 12.5, color: '#8A8A8A' },

  itemsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
  },
  itemRowLast: { borderBottomWidth: 0 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D7D7D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#0C831F', borderColor: '#0C831F' },
  checkboxTick: { color: '#FFFFFF', fontSize: 13, fontFamily: PARTNER_FONT.bold },
  itemName: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: TEXT_DARK },
  itemQty: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#9a9a9a', marginTop: 2 },
  tapToCheck: { fontFamily: PARTNER_FONT.bold, fontSize: 12, color: '#0C831F' },

  handoverCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  handoverSub: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#8A8A8A', marginTop: 4, marginBottom: 14 },
  handoverRow: { flexDirection: 'row', gap: 10 },
  handoverBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handoverBtnDark: { backgroundColor: '#141414' },
  handoverBtnDone: { backgroundColor: '#0C831F' },
  handoverBtnDarkText: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: '#FFFFFF' },
  handoverBtnLight: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#D7D7D4' },
  handoverBtnLightText: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: TEXT_DARK },

  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  confirmBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#E4E4E2' },
  confirmBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: '#FFFFFF' },
  confirmBtnTextDisabled: { color: '#9a9a9a' },
})

export default PartnerPickupAtStore
