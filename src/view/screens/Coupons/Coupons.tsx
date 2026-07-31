import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-root-toast'
import { setAsyncData } from '../../../shared/utils/storage'

type Coupon = {
  code: string
  title: string
  desc: string
  tint: string
  expiry: string
  min?: number
}

const COUPONS: Coupon[] = [
  { code: 'JIFFY50', title: '₹50 off your first order', desc: 'On orders above ₹149', tint: '#E4F6E6', expiry: 'Expires in 3 days', min: 149 },
  { code: 'FRESH20', title: '20% off fruits & veggies', desc: 'Up to ₹80 discount', tint: '#FFF0D6', expiry: 'Expires in 7 days' },
  { code: 'FREEDEL', title: 'Free delivery all week', desc: 'No minimum order value', tint: '#E0F0FF', expiry: 'Expires Sunday' },
  { code: 'PAYDAY100', title: '₹100 off on ₹599', desc: 'Payday special offer', tint: '#EBE4FF', expiry: 'Expires in 2 days', min: 599 },
]

const CouponsScreen = () => {
  const navigation = useNavigation<any>()
  const [input, setInput] = useState('')
  const [applied, setApplied] = useState<string | null>(null)

  const apply = (code: string) => {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    setApplied(clean)
    setAsyncData('applied_coupon', clean as any)
    Toast.show(`Coupon ${clean} applied`, { duration: Toast.durations.SHORT })
  }

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.22, 1]} style={s.root}>
      <StatusBar backgroundColor="#FFF4C2" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Coupons & offers</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Apply input */}
          <View style={s.applyCard}>
            <Text style={s.applyEmoji}>🎟️</Text>
            <TextInput
              style={s.applyInput}
              value={input}
              onChangeText={setInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#9a9a9a"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[s.applyBtn, !input.trim() && s.applyBtnDisabled]}
              onPress={() => apply(input)}
              disabled={!input.trim()}
              activeOpacity={0.85}
            >
              <Text style={s.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionLabel}>AVAILABLE OFFERS</Text>
          {COUPONS.map(c => {
            const isApplied = applied === c.code
            return (
              <View key={c.code} style={s.coupon}>
                <View style={[s.couponStub, { backgroundColor: c.tint }]}>
                  <Text style={s.couponPercent}>%</Text>
                </View>
                <View style={s.couponBody}>
                  <View style={s.codePill}>
                    <Text style={s.codeText}>{c.code}</Text>
                  </View>
                  <Text style={s.couponTitle}>{c.title}</Text>
                  <Text style={s.couponDesc}>{c.desc}</Text>
                  <View style={s.couponFooter}>
                    <Text style={s.couponExpiry}>⏳ {c.expiry}</Text>
                    <TouchableOpacity onPress={() => apply(c.code)} disabled={isApplied}>
                      <Text style={[s.couponApply, isApplied && s.couponApplied]}>
                        {isApplied ? '✓ APPLIED' : 'APPLY'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          })}

          <Text style={s.note}>Coupons apply automatically at checkout when eligible.</Text>
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

  applyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EAEAE7',
    borderStyle: 'dashed',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  applyEmoji: { fontSize: 20 },
  applyInput: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414', padding: 0, height: 44 },
  applyBtn: { backgroundColor: '#0C831F', borderRadius: 11, paddingHorizontal: 18, paddingVertical: 10 },
  applyBtnDisabled: { backgroundColor: '#C4C4C0' },
  applyBtnText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#fff' },

  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.7,
    color: '#8a8a8a',
    marginTop: 24,
    marginBottom: 12,
  },

  coupon: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0EC',
    overflow: 'hidden',
    marginBottom: 12,
  },
  couponStub: { width: 54, alignItems: 'center', justifyContent: 'center' },
  couponPercent: { fontFamily: 'DMSans-Bold', fontSize: 26, color: 'rgba(20,20,20,0.35)' },
  couponBody: { flex: 1, padding: 14, borderLeftWidth: 1.5, borderLeftColor: '#F2F2F0', borderStyle: 'dashed' },
  codePill: { alignSelf: 'flex-start', backgroundColor: '#141414', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 },
  codeText: { fontFamily: 'DMSans-Bold', fontSize: 11.5, color: '#FFE000', letterSpacing: 0.4 },
  couponTitle: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414', marginTop: 8 },
  couponDesc: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 2 },
  couponFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  couponExpiry: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: '#D9730D' },
  couponApply: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#0C831F', letterSpacing: 0.3 },
  couponApplied: { color: '#8a8a8a' },

  note: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#9a9a9a', textAlign: 'center', marginTop: 12 },
})

export default CouponsScreen
