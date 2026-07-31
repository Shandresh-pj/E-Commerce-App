import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { usePartnerCod, COD_DEPOSIT_LIMIT } from './PartnerCodContext'

type Method = 'UPI deposit' | 'Store deposit - HSR'

function PartnerCodDeposit({ navigation }: any) {
  const { cashInHand, recentDeposits, deposit } = usePartnerCod()
  const [method, setMethod] = useState<Method>('UPI deposit')

  const progressPct = Math.min((cashInHand / COD_DEPOSIT_LIMIT) * 100, 100)
  const remaining = Math.max(COD_DEPOSIT_LIMIT - cashInHand, 0)

  const handleDeposit = () => {
    if (cashInHand <= 0) return
    Alert.alert('Deposit cash', `Deposit ₹${cashInHand.toLocaleString('en-IN')} via ${method}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          deposit(cashInHand, method)
          Alert.alert('Deposited', 'Your cash-in-hand balance has been cleared.')
        },
      },
    ])
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F0" translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.headerRow}>
          <TouchableOpacity
            style={st.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={st.title}>Cash to deposit</Text>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <View style={st.cashCard}>
            <Text style={st.cashLabel}>CASH IN HAND (COD)</Text>
            <Text style={st.cashAmount}>₹{cashInHand.toLocaleString('en-IN')}</Text>
            <View style={st.progressTrack}>
              <View style={[st.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={st.cashWarning}>
              ₹{remaining.toLocaleString('en-IN')} left before your ₹
              {COD_DEPOSIT_LIMIT.toLocaleString('en-IN')} limit. Deposit to keep taking COD orders.
            </Text>
          </View>

          <View style={st.methodRow}>
            <TouchableOpacity
              style={[st.methodCard, method === 'UPI deposit' && st.methodCardActive]}
              onPress={() => setMethod('UPI deposit')}
              activeOpacity={0.85}
            >
              <Text style={st.methodIcon}>💳</Text>
              <Text style={[st.methodTitle, method === 'UPI deposit' && st.methodTitleActive]}>
                Pay online
              </Text>
              <Text style={[st.methodSubtitle, method === 'UPI deposit' && st.methodSubtitleActive]}>
                UPI · instant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[st.methodCard, method === 'Store deposit - HSR' && st.methodCardActive]}
              onPress={() => setMethod('Store deposit - HSR')}
              activeOpacity={0.85}
            >
              <Text style={st.methodIcon}>🏠</Text>
              <Text style={[st.methodTitle, method === 'Store deposit - HSR' && st.methodTitleActive]}>
                At store
              </Text>
              <Text style={[st.methodSubtitle, method === 'Store deposit - HSR' && st.methodSubtitleActive]}>
                hand to manager
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={st.sectionTitle}>Recent deposits</Text>
          <View style={st.depositsList}>
            {recentDeposits.map((d, i) => (
              <View key={d.id} style={[st.depositRow, i === recentDeposits.length - 1 && st.depositRowLast]}>
                <Text style={st.depositIcon}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={st.depositLabel}>{d.label}</Text>
                  <Text style={st.depositDate}>{d.dateLabel}</Text>
                </View>
                <Text style={st.depositAmount}>₹{d.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={st.footer}>
          <TouchableOpacity
            style={[st.depositBtn, cashInHand <= 0 && st.depositBtnDisabled]}
            onPress={handleDeposit}
            disabled={cashInHand <= 0}
            activeOpacity={0.85}
          >
            <Text style={st.depositBtnText}>Deposit ₹{cashInHand.toLocaleString('en-IN')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F0' },
  safe: { flex: 1 },

  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEA',
  },
  backIcon: { fontSize: 17, color: '#141414' },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 19, color: '#141414' },

  body: { padding: 20, gap: 18, paddingBottom: 40 },

  cashCard: {
    backgroundColor: '#FFF0D6',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F0CE85',
  },
  cashLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11,
    color: '#B9791A',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cashAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 30, color: '#141414', marginBottom: 14 },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(217,138,31,0.25)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#D98A1F' },
  cashWarning: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#8A6D3B', lineHeight: 18 },

  methodRow: { flexDirection: 'row', gap: 12 },
  methodCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  methodCardActive: { backgroundColor: '#141414', borderColor: '#141414' },
  methodIcon: { fontSize: 20, marginBottom: 8 },
  methodTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#141414', marginBottom: 2 },
  methodTitleActive: { color: '#FFFFFF' },
  methodSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: '#9a9a9a' },
  methodSubtitleActive: { color: '#C6FF4D' },

  sectionTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#141414' },
  depositsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
    overflow: 'hidden',
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
  },
  depositRowLast: { borderBottomWidth: 0 },
  depositIcon: { fontSize: 15 },
  depositLabel: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: '#141414' },
  depositDate: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: '#9a9a9a', marginTop: 2 },
  depositAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#141414' },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  depositBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositBtnDisabled: { opacity: 0.45 },
  depositBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerCodDeposit
