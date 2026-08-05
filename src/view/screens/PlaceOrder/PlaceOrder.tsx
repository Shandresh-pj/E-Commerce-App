import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import { getData, postData, fetchApiCart, removeFromApiCart } from '../../../shared/services/main-service'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'

const DELIVERY_HANDLING = 6

const PAYMENT_METHODS = [
  { key: 'upi', icon: '📱', title: 'UPI', sub: 'GPay, PhonePe, Paytm', recommended: true },
  { key: 'card', icon: '💳', title: 'Credit / Debit card', sub: 'Visa, Mastercard, Rupay' },
  { key: 'wallet', icon: '⚡', title: 'Wallet Cash', sub: 'Balance ₹240' },
  { key: 'netbanking', icon: '🏦', title: 'Netbanking', sub: 'All major banks' },
  { key: 'cod', icon: '💵', title: 'Cash on delivery', sub: 'Pay exactly at your door' },
]

export default function PlaceOrderScreen() {
  const navigation = useNavigation<any>()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [address, setAddress] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [slot, setSlot] = useState<'express' | 'schedule'>('express')
  const [payment, setPayment] = useState('upi')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [rawCart, addrRes] = await Promise.all([
        fetchApiCart().catch(() => []),
        getData('/address').catch(() => null),
      ])
      if (rawCart) {
        const mapped = rawCart.map((rawItem: any) => {
          const product = rawItem.product ?? rawItem.Product ?? rawItem
          return {
            cartItemId: rawItem.id ?? rawItem.Id,
            id: product.id ?? product.Id ?? rawItem.product_id ?? rawItem.ProductId,
            name: product.name ?? rawItem.name ?? 'Product',
            image: product.image ?? rawItem.image ?? '',
            images: product.images ?? rawItem.images ?? [],
            unit: product.unit ?? product.weight ?? rawItem.unit ?? '',
            points: parseFloat(product.price ?? rawItem.price ?? '0') || 0,
            quantity: rawItem.quantity ?? rawItem.Quantity ?? 1,
            variantId: rawItem.variant_id ?? rawItem.VariantId ?? product.variant_id ?? null,
          }
        })
        setCartItems(mapped)
      } else {
        setCartItems([])
      }
      const list: any[] = addrRes?.data?.data || []
      setAddress(list.find((a: any) => a.isDefault) || list[0] || null)
    } finally {
      setLoading(false)
    }
  }

  const itemTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.points || 0) * (i.quantity || 1), 0),
    [cartItems],
  )
  const itemCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
    [cartItems],
  )
  const toPay = itemTotal + (itemTotal > 0 ? DELIVERY_HANDLING : 0)

  const activeMethod = PAYMENT_METHODS.find(m => m.key === payment)

  const addressLine = address
    ? [address.line1, address.line2, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(', ')
    : ''

  const onPay = () => {
    if (cartItems.length === 0) {
      Toast.show('Your cart is empty', { duration: Toast.durations.SHORT })
      return
    }
    if (!address) {
      Alert.alert('Add an address', 'Please add a delivery address to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add address', onPress: () => navigation.navigate('Addresses') },
      ])
      return
    }

    placeOrder()
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      const mapPaymentMethod = (key: string): string => {
        switch (key) {
          case 'cod':
            return 'CASH_ON_DELIVERY'
          case 'upi':
            return 'UPI'
          case 'wallet':
            return 'WALLET'
          case 'card':
          case 'netbanking':
          default:
            return 'ONLINE'
        }
      }

      const payload = {
        company_id: address?.company_id || 1,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.points || 0,
        })),
        payment: {
          method: mapPaymentMethod(activeMethod?.key || 'cod'),
          status: activeMethod?.key === 'cod' ? 'PENDING' : 'SUCCESS',
        },
        receiver_name: address?.name || null,
        receiver_phone: address?.phone || null,
        receiver_type: address?.receiverType || address?.receiver_type || 'myself',
        delivery_address: address ? [address.line1, address.city].filter(Boolean).join(', ') : null,
        pincode: address?.pincode || null,
      }

      const response: any = await postData('/orders/create', payload)

      console.log("PlaceOrder", response,'payload',payload);

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        // Clear API cart item by item
        await Promise.all(
          cartItems.map(item => {
            if (item.cartItemId) {
              return removeFromApiCart(item.cartItemId)
            }
          })
        ).catch(err => console.log('Clear API cart error:', err))

        await setAsyncData('cart_items', [] as any)
        
        const orderData = response?.data?.data?.order || response?.data?.order
        const orderNumber = orderData?.invoice_no || orderData?.OrderNumber || 'JIF' + Date.now().toString().slice(-6)
        navigation.replace('OrderTracking', { orderNumber: String(orderNumber), total: toPay, itemCount })
      } else {
        const msg = response?.message || response?.data?.message || 'Failed to place order.'
        Alert.alert('Order Failed', msg)
      }
    } catch (error) {
      console.log('PlaceOrder Error:', error)
      Alert.alert('Error', 'Unable to place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} style={s.root}>
        <StatusBar backgroundColor="#FFF4C2" barStyle="dark-content" />
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0C831F" />
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.28, 1]} style={s.root}>
      <StatusBar backgroundColor="#FFF4C2" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Checkout</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Delivering to */}
          <Text style={s.sectionLabel}>DELIVERING TO</Text>
          <View style={s.addressCard}>
            <View style={s.addressTop}>
              <View style={s.homeIcon}><Text style={{ fontSize: 18 }}>🏠</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.addressLabel}>{address?.label || 'Home'}</Text>
                <Text style={s.addressText} numberOfLines={2}>
                  {addressLine || 'No saved address — tap Change to add one'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
                <Text style={s.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery slot */}
          <Text style={s.sectionLabel}>DELIVERY SLOT</Text>
          <View style={s.slotRow}>
            <TouchableOpacity
              style={[s.slotExpress, slot === 'express' && s.slotExpressActive]}
              onPress={() => setSlot('express')}
              activeOpacity={0.85}
            >
              <View style={s.slotTopRow}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
                {slot === 'express' && <View style={s.slotCheck}><Text style={s.slotCheckTxt}>✓</Text></View>}
              </View>
              <Text style={s.slotExpressTitle}>Express</Text>
              <Text style={s.slotExpressSub}>Arrives in 8 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.slotSchedule, slot === 'schedule' && s.slotScheduleActive]}
              onPress={() => setSlot('schedule')}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 20 }}>📅</Text>
              <Text style={s.slotScheduleTitle}>Schedule</Text>
              <Text style={s.slotScheduleSub}>Pick a time</Text>
            </TouchableOpacity>
          </View>

          {/* Payment method */}
          <Text style={s.sectionLabel}>PAYMENT METHOD</Text>
          {PAYMENT_METHODS.map(m => {
            const active = payment === m.key
            return (
              <TouchableOpacity
                key={m.key}
                style={[s.payCard, active && s.payCardActive]}
                onPress={() => setPayment(m.key)}
                activeOpacity={0.85}
              >
                <View style={s.payIcon}><Text style={{ fontSize: 19 }}>{m.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={s.payTitleRow}>
                    <Text style={s.payTitle}>{m.title}</Text>
                    {m.recommended && (
                      <View style={s.recBadge}><Text style={s.recBadgeText}>Recommended</Text></View>
                    )}
                  </View>
                  <Text style={s.paySub}>{m.sub}</Text>
                </View>
                <View style={[s.radio, active && s.radioActive]}>
                  {active && <Text style={s.radioTick}>✓</Text>}
                </View>
              </TouchableOpacity>
            )
          })}

          {/* Bill */}
          <View style={s.billCard}>
            <View style={s.billRow}>
              <Text style={s.billLabel}>Item total</Text>
              <Text style={s.billValue}>₹{itemTotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={s.billRow}>
              <Text style={s.billLabel}>Delivery + handling</Text>
              <Text style={s.billValue}>₹{itemTotal > 0 ? DELIVERY_HANDLING : 0}</Text>
            </View>
            <View style={s.billDivider} />
            <View style={s.billRow}>
              <Text style={s.billTotalLabel}>To pay</Text>
              <Text style={s.billTotalValue}>₹{toPay.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Slide to pay */}
        <View style={s.payBar}>
          <TouchableOpacity
            style={[s.payBtn, placing && { opacity: 0.85 }]}
            onPress={onPay}
            disabled={placing}
            activeOpacity={0.92}
          >
            <View>
              <Text style={s.payVia}>Pay via {activeMethod?.title}</Text>
              <Text style={s.payAmount}>₹{toPay.toLocaleString('en-IN')}</Text>
            </View>
            <View style={s.slidePill}>
              {placing ? (
                <ActivityIndicator color="#0C831F" />
              ) : (
                <>
                  <Text style={s.slideText}>Slide to pay</Text>
                  <Text style={s.slideArrow}>→</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
    marginTop: 20,
    marginBottom: 10,
  },

  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },
  addressTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  homeIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F4F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  addressText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#8a8a8a', marginTop: 3, lineHeight: 18 },
  changeLink: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#0C831F' },

  slotRow: { flexDirection: 'row', gap: 12 },
  slotExpress: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 15,
    minHeight: 116,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#141414',
  },
  slotExpressActive: { borderColor: '#FFE000' },
  slotTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCheckTxt: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#141414' },
  slotExpressTitle: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#fff', marginTop: 10 },
  slotExpressSub: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#FFE000', marginTop: 2 },
  slotSchedule: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    minHeight: 116,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#F0F0EC',
  },
  slotScheduleActive: { borderColor: '#0C831F' },
  slotScheduleTitle: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#141414', marginTop: 10 },
  slotScheduleSub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 2 },

  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  payCardActive: { borderColor: '#FFC400', backgroundColor: '#FFFBEB' },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F4F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payTitle: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  recBadge: { backgroundColor: '#E4F6E6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  recBadgeText: { fontFamily: 'DMSans-Bold', fontSize: 10.5, color: '#0C831F' },
  paySub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 2 },
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

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#555' },
  billValue: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#333' },
  billDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderTopColor: '#E4E4E2', marginVertical: 8 },
  billTotalLabel: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414' },
  billTotalValue: { fontFamily: 'DMSans-Bold', fontSize: 19, color: '#141414' },

  payBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,240,236,0.9)',
    padding: 14,
    paddingBottom: 22,
  },
  payBtn: {
    height: 60,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 6,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  payVia: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: 'rgba(255,255,255,0.85)' },
  payAmount: { fontFamily: 'DMSans-Bold', fontSize: 19, color: '#fff' },
  slidePill: {
    height: 48,
    minWidth: 150,
    backgroundColor: '#0A6F1A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  slideText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#fff' },
  slideArrow: { fontSize: 17, color: '#fff' },
})
