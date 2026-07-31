import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'

const OTP_LENGTH = 4
const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
]

function PartnerPickupOtpEntry({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const [otp, setOtp] = useState('')
  const [confirming, setConfirming] = useState(false)

  const handleKeyPress = (key: string) => {
    if (key === '') return
    if (key === '⌫') {
      setOtp(prev => prev.slice(0, -1))
      return
    }
    if (otp.length < OTP_LENGTH) setOtp(prev => prev + key)
  }

  const handleConfirm = async () => {
    if (otp.length !== OTP_LENGTH || confirming) return
    setConfirming(true)
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 600))
      navigation.navigate('PartnerPickup', { order, handoverConfirmed: true })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.topSafe} edges={['top']}>
        <TouchableOpacity
          style={st.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={st.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={st.stepLabel}>Order #{order.id} · handover</Text>
        <Text style={st.title}>Store pickup OTP</Text>
        <Text style={st.subtitle}>
          Ask counter {order.pickup.bay} staff for the 4-digit handover code.
        </Text>

        <View style={st.otpRow}>
          {Array(OTP_LENGTH)
            .fill(0)
            .map((_, i) => (
              <View key={i} style={[st.otpBox, otp[i] && st.otpBoxFilled]}>
                <Text style={st.otpDigit}>{otp[i] || ''}</Text>
              </View>
            ))}
        </View>
      </SafeAreaView>

      <View style={st.keypadPanel}>
        <View style={st.keypadGrid}>
          {KEYPAD_ROWS.map((row, ri) => (
            <View key={ri} style={st.keypadRow}>
              {row.map((key, ki) => (
                <TouchableOpacity
                  key={ki}
                  style={[st.keypadKey, key === '' && st.keypadKeyEmpty]}
                  onPress={() => handleKeyPress(key)}
                  disabled={key === ''}
                  activeOpacity={0.6}
                >
                  <Text style={st.keypadKeyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity
            style={[st.confirmBtn, otp.length !== OTP_LENGTH && st.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={otp.length !== OTP_LENGTH || confirming}
            activeOpacity={0.85}
          >
            {confirming ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={st.confirmBtnText}>Confirm pickup</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  topSafe: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backIcon: { fontSize: 17, color: '#FFFFFF' },
  stepLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted, marginBottom: 4 },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 22, color: '#FFFFFF', marginBottom: 8 },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: PARTNER_COLOR.textSecondary,
    lineHeight: 20,
    marginBottom: 26,
  },
  otpRow: { flexDirection: 'row', gap: 12 },
  otpBox: {
    width: 56,
    height: 60,
    borderRadius: 14,
    backgroundColor: PARTNER_COLOR.surface,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: { borderColor: PARTNER_COLOR.lime, backgroundColor: PARTNER_COLOR.limeSoft },
  otpDigit: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF' },

  keypadPanel: {
    flex: 1,
    backgroundColor: '#F4F5F0',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  keypadGrid: { gap: 14 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  keypadKey: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  keypadKeyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
  keypadKeyText: { fontFamily: PARTNER_FONT.bold, fontSize: 20, color: '#141414' },

  confirmBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerPickupOtpEntry
