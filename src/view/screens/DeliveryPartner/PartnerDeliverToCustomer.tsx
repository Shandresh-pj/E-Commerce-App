import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { launchImageLibrary } from 'react-native-image-picker'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'
import { usePartnerCod } from './PartnerCodContext'

const OTP_LENGTH = 4
const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

function PartnerDeliverToCustomer({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const dropIndex: number = route.params.dropIndex || 0
  const drop = order.drops[dropIndex]
  const isBatch = order.drops.length > 1
  const isLastDrop = dropIndex === order.drops.length - 1
  const { addCollectedCash } = usePartnerCod()
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [cashCollected, setCashCollected] = useState(false)
  const [photoAdded, setPhotoAdded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const hasSimulatedNetworkLoss = useRef(false)
  const inputs = useRef<TextInput[]>([])

  const isCod = order.paymentType === 'COD'
  const otpComplete = otp.join('').length === OTP_LENGTH
  const canConfirm = otpComplete && (!isCod || cashCollected)

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()
  }

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
      const next = [...otp]
      next[idx - 1] = ''
      setOtp(next)
    }
  }

  const handleCall = () => Linking.openURL(`tel:${drop.customerPhone}`)

  const handleCantReach = () => {
    navigation.navigate('PartnerUnableToDeliver', { order, dropIndex })
  }

  const handlePhotoProof = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      if (res.didCancel || !res.assets?.[0]?.uri) return
      setPhotoAdded(true)
    })
  }

  const nextRoute = isLastDrop ? 'PartnerOrderComplete' : 'PartnerNavigateToCustomer'
  const nextParams = isLastDrop ? { order } : { order, dropIndex: dropIndex + 1 }

  const handleConfirm = async () => {
    if (!canConfirm || confirming) return
    setConfirming(true)
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 700))
      if (isCod) addCollectedCash(order.codAmount)

      if (!hasSimulatedNetworkLoss.current) {
        hasSimulatedNetworkLoss.current = true
        navigation.replace('PartnerNetworkLost', { order, nextRoute, nextParams })
        return
      }
      navigation.replace(nextRoute, nextParams)
    } finally {
      setConfirming(false)
    }
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
          <View style={{ flex: 1 }}>
            <Text style={st.stepLabel}>
              Order #{order.id} · {isBatch ? `Drop ${dropIndex + 1} of ${order.drops.length}` : 'Step 2 of 2'}
            </Text>
            <Text style={st.title}>Deliver to customer</Text>
          </View>
          <TouchableOpacity style={st.callBtn} onPress={handleCall} activeOpacity={0.85}>
            <Text style={st.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {isCod && (
            <TouchableOpacity
              style={st.codPill}
              onPress={() => setCashCollected(v => !v)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={st.codLabel}>💳 COLLECT CASH (COD)</Text>
                <Text style={st.codAmount}>₹{order.codAmount}</Text>
              </View>
              <View style={[st.codCheckbox, cashCollected && st.codCheckboxChecked]}>
                {cashCollected && <Text style={st.codCheckboxTick}>✓</Text>}
              </View>
            </TouchableOpacity>
          )}

          <View style={st.otpCard}>
            <Text style={st.otpTitle}>Enter delivery OTP</Text>
            <Text style={st.otpSubtitle}>Ask the customer for their 4-digit code</Text>
            <View style={st.otpRow}>
              {Array(OTP_LENGTH)
                .fill(0)
                .map((_, i) => (
                  <TextInput
                    key={i}
                    ref={el => {
                      if (el) inputs.current[i] = el
                    }}
                    style={[st.otpBox, otp[i] && st.otpBoxFilled]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[i]}
                    onChangeText={v => handleChange(v, i)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                    selectTextOnFocus
                  />
                ))}
            </View>
          </View>

          <TouchableOpacity onPress={handleCantReach} style={st.cantReachWrap}>
            <Text style={st.cantReachText}>can't reach customer?</Text>
          </TouchableOpacity>

          <View style={st.actionsRow}>
            <TouchableOpacity style={st.actionBtn} onPress={handlePhotoProof} activeOpacity={0.8}>
              <Text style={st.actionBtnText}>
                {photoAdded ? '✓ Photo added' : '📷 Photo proof'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={st.actionBtn}
              onPress={() => Alert.alert('Support', 'Reach us at partners@dash.app')}
              activeOpacity={0.8}
            >
              <Text style={st.actionBtnText}>💬 Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={st.footer}>
          <TouchableOpacity
            style={[st.confirmBtn, !canConfirm && st.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm || confirming}
            activeOpacity={0.85}
          >
            {confirming ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={st.confirmBtnText}>Confirm delivery</Text>
            )}
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
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 17 },

  body: { padding: 20, paddingBottom: 8, gap: 18 },

  codPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0D6',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F0CE85',
    padding: 16,
  },
  codLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11,
    color: '#B9791A',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  codAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 22, color: '#141414' },
  codCheckbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D98A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codCheckboxChecked: { backgroundColor: '#0C831F', borderColor: '#0C831F' },
  codCheckboxTick: { color: '#FFFFFF', fontSize: 14, fontFamily: PARTNER_FONT.bold },

  otpCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  otpTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: TEXT_DARK, marginBottom: 4 },
  otpSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#8A8A8A', marginBottom: 16 },
  otpRow: { flexDirection: 'row', gap: 10 },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: LIGHT_BG,
    borderWidth: 1.5,
    borderColor: '#D7D7D4',
    textAlign: 'center',
    fontSize: 22,
    fontFamily: PARTNER_FONT.bold,
    color: TEXT_DARK,
  },
  otpBoxFilled: { borderColor: PARTNER_COLOR.green, backgroundColor: '#E4F6E6' },

  cantReachWrap: { alignItems: 'center', paddingVertical: 4 },
  cantReachText: { fontFamily: PARTNER_FONT.medium, fontSize: 13, color: '#8A8A8A' },

  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D7D7D4',
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: TEXT_DARK },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  confirmBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#D7D7D4' },
  confirmBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerDeliverToCustomer
