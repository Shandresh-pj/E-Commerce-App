import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'

type Notif = {
  id: string
  icon: string
  tint: string
  title: string
  body: string
  time: string
  group: 'Today' | 'Earlier'
  unread?: boolean
  action?: string
}

const DATA: Notif[] = [
  { id: '1', icon: '🛵', tint: '#E4F6E6', title: 'Order on the way', body: 'Aman is arriving in 8 minutes with your order.', time: '2m', group: 'Today', unread: true, action: 'MyOrders' },
  { id: '2', icon: '✅', tint: '#E4F6E6', title: 'Order confirmed', body: 'Your order #JIF348086 has been packed.', time: '12m', group: 'Today', unread: true, action: 'MyOrders' },
  { id: '3', icon: '🎟️', tint: '#FFE9E0', title: 'New coupon unlocked', body: 'Use PAYDAY100 for ₹100 off on orders above ₹599.', time: '3h', group: 'Today', action: 'Coupons' },
  { id: '4', icon: '⚡', tint: '#FFF4D6', title: 'Free delivery all week', body: 'No minimum order value till Sunday. Order away!', time: '1d', group: 'Earlier' },
  { id: '5', icon: '🎉', tint: '#EBE4FF', title: 'Delivered on time', body: 'Your last order arrived in 7 minutes. Rate it now.', time: '2d', group: 'Earlier', action: 'MyOrders' },
]

const NotificationsScreen = () => {
  const navigation = useNavigation<any>()
  const [items, setItems] = useState<Notif[]>(DATA)

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })))
  const open = (n: Notif) => {
    setItems(prev => prev.map(x => (x.id === n.id ? { ...x, unread: false } : x)))
    if (n.action) navigation.navigate(n.action)
  }

  const groups: Notif['group'][] = ['Today', 'Earlier']
  const hasUnread = items.some(n => n.unread)

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.22, 1]} style={s.root}>
      <StatusBar backgroundColor="#FFF4C2" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Notifications</Text>
          {hasUnread && (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={s.markAll}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}><Text style={{ fontSize: 42 }}>🔔</Text></View>
            <Text style={s.emptyTitle}>You're all caught up</Text>
            <Text style={s.emptySub}>Order updates and offers will show up here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {groups.map(g => {
              const rows = items.filter(n => n.group === g)
              if (!rows.length) return null
              return (
                <View key={g}>
                  <Text style={s.sectionLabel}>{g.toUpperCase()}</Text>
                  <View style={s.card}>
                    {rows.map((n, i) => (
                      <TouchableOpacity
                        key={n.id}
                        style={[s.row, i < rows.length - 1 && s.divider]}
                        activeOpacity={0.8}
                        onPress={() => open(n)}
                      >
                        <View style={[s.rowIcon, { backgroundColor: n.tint }]}>
                          <Text style={{ fontSize: 18 }}>{n.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={s.titleRow}>
                            <Text style={s.rowTitle} numberOfLines={1}>{n.title}</Text>
                            <Text style={s.rowTime}>{n.time}</Text>
                          </View>
                          <Text style={s.rowBody} numberOfLines={2}>{n.body}</Text>
                        </View>
                        {n.unread && <View style={s.unreadDot} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )
            })}
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  backArrow: { fontSize: 18, color: '#141414' },
  headerTitle: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 24, color: '#141414', letterSpacing: -0.4 },
  markAll: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#0C831F' },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.7,
    color: '#8a8a8a',
    marginTop: 20,
    marginBottom: 10,
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0EC', overflow: 'hidden' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4F4F2' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  rowTime: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: '#9a9a9a' },
  rowBody: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 3, lineHeight: 17 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#0C831F' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: 'DMSans-Bold', fontSize: 19, color: '#141414', marginTop: 18 },
  emptySub: { fontFamily: 'DMSans-Regular', fontSize: 13.5, color: '#8a8a8a', textAlign: 'center', marginTop: 6 },
})

export default NotificationsScreen
