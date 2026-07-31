import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { WALLET, WEEKLY_EARNINGS } from './partnerMockData'
import { usePartnerEarnings } from './PartnerEarningsContext'
import { usePartnerCod } from './PartnerCodContext'

interface PayoutRow {
  id: string
  label: string
  amount: number
  dateLabel: string
  status: 'done' | 'processing'
}

function PartnerWallet({ navigation }: any) {
  const { earnings } = usePartnerEarnings()
  const { cashInHand } = usePartnerCod()
  const [bank, setBank] = useState(WALLET.bank)
  const [payouts, setPayouts] = useState<PayoutRow[]>(WALLET.recentPayouts)

  const availableBalance = WEEKLY_EARNINGS.total
  const pendingAmount = earnings.amount
  const withdrawable = Math.max(availableBalance - pendingAmount, 0)

  const handleWithdraw = () => {
    if (withdrawable <= 0) return
    Alert.alert(
      'Withdraw to bank',
      `Send ₹${withdrawable.toLocaleString('en-IN')} to ${bank.name} ••${bank.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: () => {
            setPayouts(prev => [
              {
                id: `w-${Date.now()}`,
                label: 'Instant withdrawal',
                amount: withdrawable,
                dateLabel: 'Processing',
                status: 'processing',
              },
              ...prev,
            ])
          },
        },
      ],
    )
  }

  const handleChangeBank = () => {
    Alert.alert('Payout account', 'Choose which bank account receives your payouts.', [
      { text: `${WALLET.bank.name} ••${WALLET.bank.last4}`, onPress: () => setBank(WALLET.bank) },
      { text: `${WALLET.altBank.name} ••${WALLET.altBank.last4}`, onPress: () => setBank(WALLET.altBank) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.headerRow}>
          <TouchableOpacity
            style={st.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={st.title}>Wallet</Text>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <View style={st.balanceCard}>
            <Text style={st.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={st.balanceAmount}>₹{availableBalance.toLocaleString('en-IN')}</Text>
            <Text style={st.balanceSub}>
              ₹{pendingAmount.toLocaleString('en-IN')} pending, clears tonight
            </Text>
            <TouchableOpacity
              style={[st.withdrawBtn, withdrawable <= 0 && st.withdrawBtnDisabled]}
              onPress={handleWithdraw}
              disabled={withdrawable <= 0}
              activeOpacity={0.85}
            >
              <Text style={st.withdrawBtnText}>Withdraw to bank ↓</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={st.bankRow} onPress={handleChangeBank} activeOpacity={0.8}>
            <Text style={st.bankIcon}>🏦</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.bankName}>
                {bank.name} ••{bank.last4}
              </Text>
              <Text style={st.bankSub}>Default payout account</Text>
            </View>
            <Text style={st.bankChange}>Change</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={st.codRow}
            onPress={() => navigation.getParent()?.navigate('PartnerCodDeposit')}
            activeOpacity={0.8}
          >
            <Text style={st.codIcon}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.codTitle}>Cash in hand (COD)</Text>
              <Text style={st.codSub}>₹{cashInHand.toLocaleString('en-IN')} · deposit to keep taking COD</Text>
            </View>
            <Text style={st.bankChange}>Deposit</Text>
          </TouchableOpacity>

          <Text style={st.sectionTitle}>Recent payouts</Text>
          <View style={st.payoutsList}>
            {payouts.map((p, i) => (
              <View key={p.id} style={[st.payoutRow, i === payouts.length - 1 && st.payoutRowLast]}>
                <Text style={st.payoutStatusIcon}>{p.status === 'done' ? '✅' : '⏳'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={st.payoutLabel}>{p.label}</Text>
                  <Text style={st.payoutDate}>{p.dateLabel}</Text>
                </View>
                <Text style={st.payoutAmount}>₹{p.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
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
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 17, color: '#FFFFFF' },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 20, color: '#FFFFFF' },

  body: { padding: 20, gap: 16, paddingBottom: 40 },

  balanceCard: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  balanceLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 32, color: '#FFFFFF', marginBottom: 6 },
  balanceSub: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: PARTNER_COLOR.textSecondary, marginBottom: 18 },
  withdrawBtn: {
    height: 52,
    borderRadius: 15,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtnDisabled: { opacity: 0.4 },
  withdrawBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#141414' },

  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  bankIcon: { fontSize: 22 },
  bankName: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },
  bankSub: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: PARTNER_COLOR.textMuted, marginTop: 2 },
  bankChange: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: PARTNER_COLOR.lime },

  codRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2400',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(198,255,77,0.25)',
  },
  codIcon: { fontSize: 20 },
  codTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },
  codSub: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: PARTNER_COLOR.lime, marginTop: 2 },

  sectionTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#FFFFFF', marginTop: 4 },
  payoutsList: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    overflow: 'hidden',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: PARTNER_COLOR.border,
  },
  payoutRowLast: { borderBottomWidth: 0 },
  payoutStatusIcon: { fontSize: 16 },
  payoutLabel: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: '#FFFFFF' },
  payoutDate: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: PARTNER_COLOR.textMuted, marginTop: 2 },
  payoutAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },
})

export default PartnerWallet
