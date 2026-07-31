import React, { useEffect, useState } from 'react'
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
import Toast from 'react-native-root-toast'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'

type Method = { key: string; icon: string; title: string; sub: string; removable?: boolean }

const DEFAULT_METHODS: Method[] = [
  { key: 'upi_gpay', icon: '📱', title: 'Google Pay', sub: 'UPI · linked', removable: true },
  { key: 'upi_phonepe', icon: '📲', title: 'PhonePe', sub: 'UPI · linked', removable: true },
  { key: 'card_visa', icon: '💳', title: 'Visa •••• 4242', sub: 'Expires 08/27', removable: true },
]

const OTHER_METHODS: Method[] = [
  { key: 'netbanking', icon: '🏦', title: 'Netbanking', sub: 'All major banks' },
  { key: 'cod', icon: '💵', title: 'Cash on delivery', sub: 'Pay at your door' },
]

const PaymentMethodsScreen = () => {
  const navigation = useNavigation<any>()
  const [methods, setMethods] = useState<Method[]>(DEFAULT_METHODS)
  const [selected, setSelected] = useState('upi_gpay')

  useEffect(() => {
    getAsyncData('default_payment').then(v => {
      if (v && typeof v === 'string') setSelected(v)
    })
  }, [])

  const choose = (key: string) => {
    setSelected(key)
    setAsyncData('default_payment', key as any)
    Toast.show('Default payment updated', { duration: Toast.durations.SHORT })
  }

  const remove = (key: string) => {
    setMethods(prev => prev.filter(m => m.key !== key))
    Toast.show('Removed', { duration: Toast.durations.SHORT })
  }

  const comingSoon = () => Toast.show('Coming soon', { duration: Toast.durations.SHORT })

  const Row = ({ m }: { m: Method }) => {
    const active = selected === m.key
    return (
      <TouchableOpacity style={s.row} activeOpacity={0.8} onPress={() => choose(m.key)}>
        <View style={s.rowIcon}><Text style={{ fontSize: 19 }}>{m.icon}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle}>{m.title}</Text>
          <Text style={s.rowSub}>{m.sub}</Text>
        </View>
        {m.removable && (
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => remove(m.key)}
            style={s.removeBtn}
          >
            <Text style={s.removeText}>✕</Text>
          </TouchableOpacity>
        )}
        <View style={[s.radio, active && s.radioActive]}>{active && <Text style={s.radioTick}>✓</Text>}</View>
      </TouchableOpacity>
    )
  }

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.22, 1]} style={s.root}>
      <StatusBar backgroundColor="#FFF4C2" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Payment methods</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Wallet */}
          <View style={s.walletCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.walletLabel}>⚡ Wallet balance</Text>
              <Text style={s.walletValue}>₹240</Text>
            </View>
            <TouchableOpacity style={s.walletBtn} onPress={comingSoon} activeOpacity={0.85}>
              <Text style={s.walletBtnText}>Add money</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionLabel}>SAVED PAYMENTS</Text>
          <View style={s.card}>
            {methods.length > 0 ? (
              methods.map((m, i) => (
                <View key={m.key} style={i < methods.length - 1 ? s.divider : undefined}>
                  <Row m={m} />
                </View>
              ))
            ) : (
              <Text style={s.emptyText}>No saved payment methods yet.</Text>
            )}
          </View>

          <Text style={s.sectionLabel}>PAY ON DELIVERY</Text>
          <View style={s.card}>
            {OTHER_METHODS.map((m, i) => (
              <View key={m.key} style={i < OTHER_METHODS.length - 1 ? s.divider : undefined}>
                <Row m={m} />
              </View>
            ))}
          </View>

          <Text style={s.sectionLabel}>ADD NEW</Text>
          <View style={s.card}>
            <TouchableOpacity style={[s.row, s.divider]} activeOpacity={0.8} onPress={comingSoon}>
              <View style={[s.rowIcon, s.addIcon]}><Text style={{ fontSize: 19 }}>＋</Text></View>
              <Text style={s.addTitle}>Add UPI ID</Text>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.row} activeOpacity={0.8} onPress={comingSoon}>
              <View style={[s.rowIcon, s.addIcon]}><Text style={{ fontSize: 19 }}>＋</Text></View>
              <Text style={s.addTitle}>Add credit / debit card</Text>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.secureNote}>🔒 Your payment details are encrypted and secure.</Text>
          <View style={{ height: 24 }} />
        </ScrollView>
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
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 24, color: '#141414', letterSpacing: -0.4 },

  scroll: { paddingHorizontal: 16, paddingTop: 6 },
  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.7,
    color: '#8a8a8a',
    marginTop: 22,
    marginBottom: 10,
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0EC', overflow: 'hidden' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4F4F2' },

  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 18,
    padding: 18,
    marginTop: 4,
  },
  walletLabel: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#b4b4b4' },
  walletValue: { fontFamily: 'DMSans-Bold', fontSize: 28, color: '#FFE000', marginTop: 4, letterSpacing: -0.5 },
  walletBtn: { backgroundColor: '#FFE000', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  walletBtnText: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#141414' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F4F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: { backgroundColor: '#E8F7EA' },
  rowTitle: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  rowSub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 2 },
  addTitle: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#0C831F' },
  chevron: { fontSize: 18, color: '#bbb' },
  removeBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 13, color: '#bbb', fontFamily: 'DMSans-Bold' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D9D9D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: '#0C831F', borderColor: '#0C831F' },
  radioTick: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 13 },
  emptyText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#9a9a9a', padding: 16 },

  secureNote: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#9a9a9a', textAlign: 'center', marginTop: 20 },
})

export default PaymentMethodsScreen
