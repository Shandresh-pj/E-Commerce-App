import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { usePartnerOnboarding } from './PartnerOnboardingContext'

const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

const IFSC_BANK_PREFIXES: Record<string, string> = {
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  SBIN: 'State Bank of India',
  UTIB: 'Axis Bank',
  KKBK: 'Kotak Mahindra Bank',
}

const UPI_REGEX = /^[\w.-]+@[\w.-]+$/

function PartnerBankDetails({ navigation }: any) {
  const { setStepStatus } = usePartnerOnboarding()
  const [holderName, setHolderName] = useState('Rahul Sharma')
  const [accountNumber, setAccountNumber] = useState('5010 0284 1190')
  const [ifsc, setIfsc] = useState('HDFC0001234')
  const [upiId, setUpiId] = useState('rahul@oksbi')
  const [saving, setSaving] = useState(false)

  const detectedBank = useMemo(() => {
    const prefix = ifsc.slice(0, 4).toUpperCase()
    return IFSC_BANK_PREFIXES[prefix] || null
  }, [ifsc])

  const accountValid =
    holderName.trim().length > 2 &&
    accountNumber.replace(/\s/g, '').length >= 9 &&
    ifsc.trim().length === 11
  const upiValid = UPI_REGEX.test(upiId.trim())
  const canSave = accountValid || upiValid

  const handleSave = async () => {
    Keyboard.dismiss()
    if (!canSave || saving) return
    setSaving(true)
    try {
      // Penny-drop verification hits a real bank-verification API once it exists.
      await new Promise<void>(resolve => setTimeout(resolve, 900))
      setStepStatus('bankAccount', 'verified')
      navigation.goBack()
    } finally {
      setSaving(false)
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
          <View>
            <Text style={st.title}>Bank account</Text>
            <Text style={st.stepLabel}>Step 4 of 4 · for payouts</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={st.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={st.card}>
            <Text style={st.fieldLabel}>ACCOUNT HOLDER NAME</Text>
            <TextInput style={st.input} value={holderName} onChangeText={setHolderName} />
            <View style={st.divider} />

            <Text style={st.fieldLabel}>ACCOUNT NUMBER</Text>
            <TextInput
              style={st.input}
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
            <View style={st.divider} />

            <Text style={st.fieldLabel}>IFSC CODE</Text>
            <TextInput
              style={st.input}
              autoCapitalize="characters"
              value={ifsc}
              onChangeText={v => setIfsc(v.toUpperCase())}
              maxLength={11}
            />
          </View>

          {detectedBank && (
            <View style={st.bankRow}>
              <Text style={st.bankIcon}>🏦</Text>
              <View style={{ flex: 1 }}>
                <Text style={st.bankName}>{detectedBank}</Text>
                <Text style={st.bankSub}>Koramangala branch · auto-detected</Text>
              </View>
              <Text style={st.bankTick}>✓</Text>
            </View>
          )}

          <View style={st.orDivider}>
            <View style={st.orLine} />
            <Text style={st.orText}>or add UPI</Text>
            <View style={st.orLine} />
          </View>

          <View style={st.card}>
            <Text style={st.fieldLabel}>UPI ID</Text>
            <TextInput
              style={st.input}
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="you@upi"
              placeholderTextColor="#B5B5B5"
            />
          </View>

          <View style={st.infoBox}>
            <Text style={st.infoText}>
              ⓘ We'll send ₹1 to verify your account. It'll be added to your wallet.
            </Text>
          </View>
        </ScrollView>

        <View style={st.footer}>
          <TouchableOpacity
            style={[st.saveBtn, !canSave && st.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={st.saveBtnText}>Verify & finish</Text>
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

  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 },
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
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: TEXT_DARK },
  stepLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#9a9a9a', marginTop: 1 },

  body: { padding: 20, paddingBottom: 8, gap: 14 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  fieldLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: TEXT_DARK, paddingVertical: 2 },
  divider: { height: 1, backgroundColor: '#ECECEA', marginVertical: 14 },

  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E4F6E6',
  },
  bankIcon: { fontSize: 20 },
  bankName: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: TEXT_DARK },
  bankSub: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: '#9a9a9a', marginTop: 2 },
  bankTick: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: '#0C831F' },

  orDivider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: '#D7D7D4' },
  orText: { fontFamily: PARTNER_FONT.medium, fontSize: 12, color: '#9a9a9a' },

  infoBox: {
    backgroundColor: '#E4F6E6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#C3E8C8',
  },
  infoText: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#0C831F', lineHeight: 18 },

  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerBankDetails
