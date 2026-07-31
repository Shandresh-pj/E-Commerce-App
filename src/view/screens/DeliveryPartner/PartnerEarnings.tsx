import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { WEEKLY_EARNINGS } from './partnerMockData'
import { usePartnerEarnings } from './PartnerEarningsContext'

type Period = 'week' | 'day'

function PartnerEarnings({ navigation }: any) {
  const { earnings } = usePartnerEarnings()
  const [period, setPeriod] = useState<Period>('week')
  const maxOrders = 8

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top']}>
        <View style={st.headerRow}>
          <Text style={st.headerTitle}>Earnings</Text>
          <View style={st.toggleRow}>
            <TouchableOpacity
              style={[st.toggleBtn, period === 'week' && st.toggleBtnActive]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[st.toggleText, period === 'week' && st.toggleTextActive]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[st.toggleBtn, period === 'day' && st.toggleBtnActive]}
              onPress={() => setPeriod('day')}
            >
              <Text style={[st.toggleText, period === 'day' && st.toggleTextActive]}>Day</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {period === 'week' ? (
            <>
              <Text style={st.rangeLabel}>THIS WEEK · {WEEKLY_EARNINGS.rangeLabel}</Text>
              <Text style={st.totalAmount}>₹{WEEKLY_EARNINGS.total.toLocaleString('en-IN')}</Text>
              <View style={st.vsLastWeekRow}>
                <Text style={st.vsLastWeek}>
                  ▲ {WEEKLY_EARNINGS.vsLastWeekPct}% vs last week · {WEEKLY_EARNINGS.orders} orders
                </Text>
                <TouchableOpacity onPress={() => navigation.getParent()?.navigate('PartnerWallet')}>
                  <Text style={st.walletLink}>View wallet →</Text>
                </TouchableOpacity>
              </View>

              <View style={st.barsRow}>
                {WEEKLY_EARNINGS.days.map((d, i) => (
                  <View key={i} style={st.barCol}>
                    <View style={st.barTrack}>
                      <View
                        style={[
                          st.barFill,
                          { height: `${Math.max(d.pct, 0.06) * 100}%` },
                          d.isToday && st.barFillToday,
                        ]}
                      />
                    </View>
                    <Text style={[st.barLabel, d.isToday && st.barLabelToday]}>{d.label}</Text>
                  </View>
                ))}
              </View>

              <View style={st.breakdownCard}>
                <Text style={st.breakdownTitle}>Breakdown</Text>
                {WEEKLY_EARNINGS.breakdown.map(row => (
                  <View key={row.label} style={st.breakdownRow}>
                    <Text style={st.breakdownLabel}>{row.label}</Text>
                    <Text style={st.breakdownValue}>₹{row.amount.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={st.surgeCard}
                activeOpacity={0.85}
                onPress={() =>
                  Alert.alert(
                    'Surge zone',
                    `${WEEKLY_EARNINGS.surgeZone.area} is paying ${WEEKLY_EARNINGS.surgeZone.bonusLabel}. Head there to earn more.`,
                  )
                }
              >
                <View style={st.surgeIconBox}>
                  <Text style={st.surgeIcon}>⭐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.surgeTitle}>Surge zone nearby</Text>
                  <Text style={st.surgeSubtitle}>
                    {WEEKLY_EARNINGS.surgeZone.area} · {WEEKLY_EARNINGS.surgeZone.bonusLabel}
                  </Text>
                </View>
                <Text style={st.surgeChevron}>›</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={st.rangeLabel}>TODAY</Text>
              <Text style={st.totalAmount}>₹{earnings.amount.toLocaleString('en-IN')}</Text>
              <Text style={st.vsLastWeek}>{earnings.orders} orders completed</Text>

              <View style={st.breakdownCard}>
                <View style={st.breakdownRow}>
                  <Text style={st.breakdownLabel}>Orders completed</Text>
                  <Text style={st.breakdownValue}>{earnings.orders}</Text>
                </View>
                <View style={st.breakdownRow}>
                  <Text style={st.breakdownLabel}>Orders to next bonus</Text>
                  <Text style={st.breakdownValue}>{Math.max(maxOrders - earnings.orders, 0)}</Text>
                </View>
              </View>
              <Text style={st.dayHint}>
                Complete more deliveries today to grow this breakdown.
              </Text>
            </>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18 },
  toggleBtnActive: { backgroundColor: PARTNER_COLOR.lime },
  toggleText: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: PARTNER_COLOR.textSecondary },
  toggleTextActive: { color: '#141414' },

  body: { padding: 20, paddingBottom: 40 },
  rangeLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  totalAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 34, color: '#FFFFFF', marginBottom: 8 },
  vsLastWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  vsLastWeek: { fontFamily: PARTNER_FONT.medium, fontSize: 13, color: PARTNER_COLOR.lime },
  walletLink: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: '#FFFFFF' },

  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    marginBottom: 26,
  },
  barCol: { alignItems: 'center', gap: 8, flex: 1 },
  barTrack: {
    width: 22,
    height: 80,
    borderRadius: 11,
    backgroundColor: PARTNER_COLOR.surface,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 11, backgroundColor: PARTNER_COLOR.border },
  barFillToday: { backgroundColor: PARTNER_COLOR.lime },
  barLabel: { fontFamily: PARTNER_FONT.medium, fontSize: 11.5, color: PARTNER_COLOR.textMuted },
  barLabelToday: { color: PARTNER_COLOR.lime, fontFamily: PARTNER_FONT.bold },

  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  breakdownTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: '#141414', marginBottom: 14 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  breakdownLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 13.5, color: '#6B6B6B' },
  breakdownValue: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: '#141414' },

  surgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  surgeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: PARTNER_COLOR.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surgeIcon: { fontSize: 19 },
  surgeTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF', marginBottom: 2 },
  surgeSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textSecondary },
  surgeChevron: { fontSize: 20, color: PARTNER_COLOR.textMuted },

  dayHint: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12.5,
    color: PARTNER_COLOR.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
})

export default PartnerEarnings
