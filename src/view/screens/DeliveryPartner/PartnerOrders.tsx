import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { HistoryOrder, ORDER_HISTORY_TODAY, ORDER_HISTORY_YESTERDAY } from './partnerMockData'
import { usePartnerEarnings } from './PartnerEarningsContext'

type FilterTab = 'All' | 'Delivered' | 'Cancelled'
const TABS: FilterTab[] = ['All', 'Delivered', 'Cancelled']

const OrderRow = ({ order, isLast }: { order: HistoryOrder; isLast: boolean }) => {
  const isDelivered = order.status === 'Delivered'
  return (
    <TouchableOpacity
      style={[st.orderRow, isLast && st.orderRowLast]}
      activeOpacity={0.8}
      onPress={() =>
        Alert.alert(
          `${order.id}`,
          isDelivered
            ? `${order.route} · ${order.distanceKm} km · ${order.etaMinutes} min\nEarned ₹${order.amount}`
            : `${order.route}\nCancelled: ${order.reason}`,
        )
      }
    >
      <Text style={st.orderStatusIcon}>{isDelivered ? '✅' : '❌'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={st.orderId}>
          {order.id} · {order.route}
        </Text>
        <Text style={st.orderMeta}>
          {isDelivered
            ? `${order.timeLabel} · ${order.distanceKm} km · ${order.etaMinutes} min`
            : `${order.timeLabel} · ${order.reason}`}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={st.orderAmount}>₹{order.amount}</Text>
        <Text style={[st.orderStatusText, isDelivered ? st.statusDelivered : st.statusCancelled]}>
          {order.status}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function PartnerOrders() {
  const { earnings } = usePartnerEarnings()
  const [tab, setTab] = useState<FilterTab>('All')

  const filterOrders = (orders: HistoryOrder[]) =>
    tab === 'All' ? orders : orders.filter(o => o.status === tab)

  const todayOrders = filterOrders(ORDER_HISTORY_TODAY)
  const yesterdayOrders = filterOrders(ORDER_HISTORY_YESTERDAY.orders)

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top']}>
        <Text style={st.headerTitle}>Orders</Text>

        <View style={st.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              style={[st.tabBtn, tab === t && st.tabBtnActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[st.tabText, tab === t && st.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {todayOrders.length > 0 && (
            <>
              <Text style={st.groupHeader}>
                TODAY · ₹{earnings.amount.toLocaleString('en-IN')} · {earnings.orders} orders
              </Text>
              <View style={st.groupList}>
                {todayOrders.map((o, i) => (
                  <OrderRow key={o.id} order={o} isLast={i === todayOrders.length - 1} />
                ))}
              </View>
            </>
          )}

          {yesterdayOrders.length > 0 && (
            <>
              <Text style={st.groupHeader}>YESTERDAY · {ORDER_HISTORY_YESTERDAY.totalLabel}</Text>
              <View style={st.groupList}>
                {yesterdayOrders.map((o, i) => (
                  <OrderRow key={o.id} order={o} isLast={i === yesterdayOrders.length - 1} />
                ))}
              </View>
            </>
          )}

          {todayOrders.length === 0 && yesterdayOrders.length === 0 && (
            <Text style={st.emptyText}>No {tab.toLowerCase()} orders yet.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },

  headerTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 14 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: PARTNER_COLOR.surface,
  },
  tabBtnActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontFamily: PARTNER_FONT.bold, fontSize: 13, color: PARTNER_COLOR.textSecondary },
  tabTextActive: { color: '#141414' },

  body: { padding: 20, paddingTop: 12, gap: 8, paddingBottom: 40 },
  groupHeader: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 10,
  },
  groupList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0EE',
  },
  orderRowLast: { borderBottomWidth: 0 },
  orderStatusIcon: { fontSize: 16 },
  orderId: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: '#141414' },
  orderMeta: { fontFamily: PARTNER_FONT.regular, fontSize: 11.5, color: '#9a9a9a', marginTop: 2 },
  orderAmount: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#141414' },
  orderStatusText: { fontFamily: PARTNER_FONT.medium, fontSize: 11, marginTop: 2 },
  statusDelivered: { color: '#0C831F' },
  statusCancelled: { color: '#C0392B' },

  emptyText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: PARTNER_COLOR.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
})

export default PartnerOrders
