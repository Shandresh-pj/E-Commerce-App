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
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg'
import { useTheme } from '../../../shared/context/ThemeContext'

/* ── SVG Icons ─────────────────────────────────────────────────── */
const BackArrowSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const UpiSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M2 17L12 22L22 17" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M2 12L12 17L22 12" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
)

const CardSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M2 10H22" stroke={color} strokeWidth="1.8" />
    <Path d="M6 15H10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
)

const BankSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 22H21M12 3L2 8H22L12 3ZM4 8V18M8 8V18M12 8V18M16 8V18M20 8V18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const CashSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
    <Path d="M6 6V18M18 6V18" stroke={color} strokeWidth="1.8" />
  </Svg>
)

const PlusSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const ShieldSvgIcon = ({ color = '#829AB8', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const WalletSvgIcon = ({ color = '#FBBF24', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12V8H6C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4H19C19.5523 4 20 4.44772 20 5V6" stroke={color} strokeWidth="1.8" />
    <Path d="M4 6C4 4.89543 4.89543 4 6 4H20C20 4 21 4.5 21 6V20C21 20.5523 20.5523 21 20 21H5C3.89543 21 3 20.1046 3 19V8C3 7.44772 3 6 4 6Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Circle cx="17" cy="15" r="1.5" fill={color} />
  </Svg>
)

type Method = { key: string; icon: 'upi' | 'card' | 'bank' | 'cash'; title: string; sub: string; removable?: boolean }

const DEFAULT_METHODS: Method[] = [
  { key: 'upi_gpay', icon: 'upi', title: 'Google Pay', sub: 'UPI · linked', removable: true },
  { key: 'upi_phonepe', icon: 'upi', title: 'PhonePe', sub: 'UPI · linked', removable: true },
  { key: 'card_visa', icon: 'card', title: 'Visa •••• 4242', sub: 'Expires 08/27', removable: true },
]

const OTHER_METHODS: Method[] = [
  { key: 'netbanking', icon: 'bank', title: 'Netbanking', sub: 'All major banks' },
  { key: 'cod', icon: 'cash', title: 'Cash on delivery', sub: 'Pay at your door' },
]

const ICON_MAP = { upi: UpiSvgIcon, card: CardSvgIcon, bank: BankSvgIcon, cash: CashSvgIcon }

const PaymentMethodsScreen = () => {
  const { isDark, colors } = useTheme()
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
    const IconComponent = ICON_MAP[m.icon]
    return (
      <TouchableOpacity style={s.row} activeOpacity={0.8} onPress={() => choose(m.key)}>
        <View style={[s.rowIcon, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(11, 27, 54, 0.06)', borderColor: colors.border }, active && s.rowIconActive]}>
          <IconComponent color={active ? '#0B1B36' : colors.accent} size={19} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.rowTitle, { color: colors.textPrimary }]}>{m.title}</Text>
          <Text style={[s.rowSub, { color: colors.textSecondary }]}>{m.sub}</Text>
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
        <View style={[s.radio, { borderColor: colors.border }, active && s.radioActive]}>
          {active && <Text style={s.radioTick}>✓</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <LinearGradient colors={isDark ? ['#071224', '#0B1B36', '#071224'] : ['#F7F9FC', '#EEF2F7', '#F7F9FC']} locations={[0, 0.5, 1]} style={s.root}>
      <StatusBar backgroundColor={colors.statusBarBg} barStyle={colors.statusBarStyle} />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Signature Yellow Brand Header */}
        <LinearGradient
          colors={['#FBBF24', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <TouchableOpacity style={[s.backBtn, { backgroundColor: '#0B1B36', borderColor: 'rgba(11,27,54,0.3)' }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <BackArrowSvgIcon color="#FBBF24" size={20} />
          </TouchableOpacity>
          <View>
            <Text style={[s.headerTitle, { color: '#0B1B36' }]}>Payment methods</Text>
            <Text style={[s.headerSub, { color: 'rgba(11,27,54,0.75)' }]}>Secure & encrypted</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Wallet Balance Card */}
          <LinearGradient
            colors={['#1A2E5A', '#0D1E42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.walletCard}
          >
            <View style={s.walletIconWrap}>
              <WalletSvgIcon color="#FBBF24" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.walletLabel}>⚡ Wallet balance</Text>
              <Text style={s.walletValue}>₹1,110</Text>
            </View>
            <TouchableOpacity style={s.walletBtn} onPress={() => navigation.navigate('Wallet')} activeOpacity={0.85}>
              <Text style={s.walletBtnText}>Manage Wallet</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>SAVED PAYMENTS</Text>
          <View style={[s.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            {methods.length > 0 ? (
              methods.map((m, i) => (
                <View key={m.key} style={i < methods.length - 1 ? [s.divider, { borderBottomColor: colors.divider }] : undefined}>
                  <Row m={m} />
                </View>
              ))
            ) : (
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>No saved payment methods yet.</Text>
            )}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>PAY ON DELIVERY</Text>
          <View style={[s.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            {OTHER_METHODS.map((m, i) => (
              <View key={m.key} style={i < OTHER_METHODS.length - 1 ? [s.divider, { borderBottomColor: colors.divider }] : undefined}>
                <Row m={m} />
              </View>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>ADD NEW</Text>
          <View style={[s.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <TouchableOpacity style={[s.row, s.divider, { borderBottomColor: colors.divider }]} activeOpacity={0.8} onPress={comingSoon}>
              <View style={[s.rowIcon, s.addIconWrap, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(11, 27, 54, 0.06)', borderColor: colors.border }]}>
                <PlusSvgIcon color={colors.accent} size={18} />
              </View>
              <Text style={[s.addTitle, { color: colors.accent }]}>Add UPI ID</Text>
              <Text style={[s.chevron, { color: colors.accent }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.row} activeOpacity={0.8} onPress={comingSoon}>
              <View style={[s.rowIcon, s.addIconWrap, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(11, 27, 54, 0.06)', borderColor: colors.border }]}>
                <PlusSvgIcon color={colors.accent} size={18} />
              </View>
              <Text style={[s.addTitle, { color: colors.accent }]}>Add credit / debit card</Text>
              <Text style={[s.chevron, { color: colors.accent }]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={s.secureRow}>
            <ShieldSvgIcon color="#829AB8" size={14} />
            <Text style={s.secureNote}>Your payment details are encrypted and secure.</Text>
          </View>
          <View style={{ height: 30 }} />
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
    gap: 13,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: -0.4 },
  headerSub: { fontFamily: 'DMSans-Bold', fontSize: 12, color: '#FBBF24', marginTop: 2 },

  scroll: { paddingHorizontal: 16, paddingTop: 12 },

  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11.5,
    letterSpacing: 0.8,
    color: '#829AB8',
    marginTop: 22,
    marginBottom: 10,
  },

  card: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.18)',
    overflow: 'hidden',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.07)' },

  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    gap: 14,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  walletIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLabel: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#829AB8' },
  walletValue: { fontFamily: 'DMSans-Bold', fontSize: 28, color: '#FBBF24', marginTop: 4, letterSpacing: -0.5 },
  walletBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  walletBtnText: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#0B1B36' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconActive: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  addIconWrap: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  rowTitle: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#FFFFFF' },
  rowSub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#829AB8', marginTop: 2 },
  addTitle: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#FBBF24' },
  chevron: { fontSize: 20, color: '#FBBF24', fontFamily: 'DMSans-Bold' },
  removeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 107, 107, 0.12)' },
  removeText: { fontSize: 13, color: '#FF6B6B', fontFamily: 'DMSans-Bold' },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(130, 154, 184, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: '#FBBF24', borderColor: '#FBBF24' },
  radioTick: { color: '#0B1B36', fontFamily: 'DMSans-Bold', fontSize: 13 },
  emptyText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#829AB8', padding: 16 },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  secureNote: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#829AB8', textAlign: 'center' },
})

export default PaymentMethodsScreen
