import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getData } from '../../../shared/services/main-service'
import { setAsyncData } from '../../../shared/utils/storage'
import Toast from 'react-native-root-toast'
import Defaults from '../../../config/index'
import LinearGradient from 'react-native-linear-gradient'

const AVATAR_COLORS = ['#FFE0E0', '#E9ECFB', '#FFF0D6', '#E4F6E6', '#EBE4FF', '#FFE9E0']

const STATUS_CONFIG: Record<number, { label: string; icon: string; tile: string }> = {
  27: { label: 'Order processing', icon: '⏳', tile: '#FFC400' },
  28: { label: 'Delivered on time', icon: '✅', tile: '#FFE000' },
  29: { label: 'Order cancelled', icon: '✖', tile: '#dd4f4f' },
}
const DEFAULT_STATUS = { label: 'Order placed', icon: '📦', tile: '#FFE000' }

const formatDateTime = (iso: string) => {
  if (!iso) return 'Just now'
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${date} · ${time}`
}

const formatCurrency = (amount: string | number) =>
  `₹${parseFloat(String(amount ?? '0')).toLocaleString('en-IN')}`

const buildImageUrl = (img: string) => {
  if (!img) return ''
  const cleaned = img.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http') ? cleaned : `${Defaults.apis.baseUrl}/api/${cleaned}`
}

const itemName = (oi: any) =>
  oi.product?.name ||
  oi.ProductTranslations?.[0]?.Name ||
  oi.Products?.ProductTranslation?.Name ||
  oi.Products?.Name ||
  oi.ProductName ||
  oi.Name ||
  `Product #${oi.ProductId || oi.product_id}`

const getStatusConfig = (order: any) => {
  if (!order) return DEFAULT_STATUS
  if (order.StatusId !== undefined && STATUS_CONFIG[order.StatusId]) {
    return STATUS_CONFIG[order.StatusId]
  }
  const statusStr = String(order.status || '').toUpperCase()
  if (statusStr === 'DELIVERED' || statusStr === 'SUCCESS') {
    return STATUS_CONFIG[28]
  }
  if (statusStr === 'CANCELLED' || statusStr === 'FAILED') {
    return STATUS_CONFIG[29]
  }
  if (statusStr === 'PROCESSING' || statusStr === 'PENDING') {
    return STATUS_CONFIG[27]
  }
  return DEFAULT_STATUS
}

const ViewOrderScreen = ({ navigation, route }: any) => {
  const paramOrder = route?.params?.order ?? null
  const orderId = route?.params?.orderId ?? paramOrder?.Id ?? null

  const [order, setOrder] = useState<any>(paramOrder)
  const [loading, setLoading] = useState(!paramOrder)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) fetchOrderDetail(orderId)
  }, [orderId])

  const fetchOrderDetail = async (id: number | string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await getData(`/orders/${id}`)
      if (response && response.status) {
        const data = response.data?.data ?? response.data ?? null
        if (data) setOrder(data)
        else setError('Order not found.')
      } else {
        setError('Failed to load order details.')
      }
    } catch (err) {
      console.log('ViewOrderScreen Error', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cfg = getStatusConfig(order)
  const address = order?.Address ?? order?.Users?.Address ?? order?.user?.Address ?? order?.user?.address ?? null
  const items: any[] = order?.items ?? order?.OrderItems ?? []
  const itemCount = items.reduce((sum, oi) => sum + parseFloat(String(oi.quantity ?? oi.Qty ?? '0')), 0)

  const calculatedTotal = items.reduce(
    (sum, oi) => sum + parseFloat(String(oi.quantity ?? oi.Qty ?? '0')) * parseFloat(String(oi.price ?? oi.UnitPrice ?? '0')),
    0,
  )
  const taxAmount = parseFloat(String(order?.TaxAmount ?? '0'))
  const discAmount = parseFloat(String(order?.discount ?? order?.DiscAmount ?? '0'))
  const grandTotal =
    calculatedTotal > 0 ? calculatedTotal + taxAmount - discAmount : parseFloat(String(order?.total ?? order?.TotalAmount ?? '0'))
  const paymentMethod = (order?.payment_method ?? order?.PaymentMethod) || 'Online'

  const reorder = async () => {
    const cart = items.map((oi: any) => ({
      id: oi.product_id || oi.ProductId,
      name: itemName(oi),
      points: parseFloat(String(oi.price ?? oi.UnitPrice ?? '0')),
      quantity: parseFloat(String(oi.quantity ?? oi.Qty ?? '1')) || 1,
      image: oi.product?.image || oi.ProductImage?.ImageName || oi.Products?.ProductImages?.[0]?.ImagePath || '',
    }))
    await setAsyncData('cart_items', cart as any)
    Toast.show('Items added to cart', { duration: Toast.durations.SHORT })
    navigation.navigate('Cart')
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF4C2" />
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0C831F" />
        </View>
      </LinearGradient>
    )
  }

  if (error || !order) {
    return (
      <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF4C2" />
        <SafeAreaView style={s.safe} edges={[]}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
          </View>
          <View style={s.center}>
            <Text style={{ fontSize: 42 }}>⚠️</Text>
            <Text style={s.errorTitle}>{error || 'Order not found'}</Text>
            <TouchableOpacity style={s.errorBtn} onPress={() => navigation?.goBack()}>
              <Text style={s.errorBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.24, 1]} style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4C2" />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>Order #{order.invoice_no ?? order.OrderNumber ?? orderId}</Text>
            <Text style={s.headerSub}>{formatDateTime(order.created_at ?? order.CreatedAt)}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Status banner */}
          <View style={s.banner}>
            <View style={[s.bannerTile, { backgroundColor: cfg.tile }]}>
              <Text style={{ fontSize: 24 }}>{cfg.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.bannerTitle}>{cfg.label}</Text>
              <Text style={s.bannerSub}>
                {itemCount} item{itemCount > 1 ? 's' : ''} · paid via {paymentMethod}
              </Text>
            </View>
          </View>

          {/* Items */}
          <Text style={s.sectionLabel}>ITEMS IN THIS ORDER</Text>
          <View style={s.card}>
            {items.map((oi: any, i: number) => {
              const name = itemName(oi)
              const img = buildImageUrl(oi.product?.image || oi.ProductImage?.ImageName || oi.Products?.ProductImages?.[0]?.ImagePath || '')
              const bg = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <View key={oi.id ?? oi.Id ?? i} style={[s.itemRow, i < items.length - 1 && s.itemBorder]}>
                  <View style={[s.itemThumb, { backgroundColor: bg }]}>
                    {img ? (
                      <Image source={{ uri: img }} style={s.itemImg} resizeMode="contain" />
                    ) : (
                      <Text style={s.itemLetter}>{name[0]?.toUpperCase() || '📦'}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName} numberOfLines={2}>{name}</Text>
                    <Text style={s.itemQty}>{oi.quantity ?? oi.Qty} × unit</Text>
                  </View>
                  <Text style={s.itemPrice}>
                    {formatCurrency(parseFloat(String(oi.quantity ?? oi.Qty ?? '1')) * parseFloat(String(oi.price ?? oi.UnitPrice ?? '0')))}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Bill summary */}
          <Text style={s.sectionLabel}>BILL SUMMARY</Text>
          <View style={s.card}>
            <View style={s.billRow}>
              <Text style={s.billLabel}>Item total</Text>
              <Text style={s.billValue}>{formatCurrency(calculatedTotal)}</Text>
            </View>
            <View style={s.billRow}>
              <Text style={s.billLabel}>Delivery fee</Text>
              <Text style={[s.billValue, s.free]}>FREE</Text>
            </View>
            {discAmount > 0 && (
              <View style={s.billRow}>
                <Text style={s.billLabel}>Discount</Text>
                <Text style={[s.billValue, s.free]}>− {formatCurrency(discAmount)}</Text>
              </View>
            )}
            {taxAmount > 0 && (
              <View style={s.billRow}>
                <Text style={s.billLabel}>Tax{order.TaxPer ? ` (${order.TaxPer}%)` : ''}</Text>
                <Text style={s.billValue}>{formatCurrency(taxAmount)}</Text>
              </View>
            )}
            <View style={s.billDivider} />
            <View style={s.billRow}>
              <Text style={s.billTotalLabel}>Total paid</Text>
              <Text style={s.billTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>

          {/* Delivered to (legacy object or new persisted order columns) */}
          {(address || order.delivery_address) && (
            <View style={[s.card, s.addressCard]}>
              <Text style={{ fontSize: 22 }}>🏠</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.addressLabel}>
                  {order.delivery_address
                    ? `Delivered to: ${order.receiver_name || 'Customer'} (${(order.receiver_type || 'myself') === 'myself' ? 'Myself' : 'Someone else'})`
                    : `Delivered to ${address?.Label || 'Home'}`}
                </Text>
                <Text style={s.addressText}>
                  {order.delivery_address
                    ? `${order.delivery_address}${order.pincode ? ', Pincode: ' + order.pincode : ''}`
                    : [address?.Street, address?.City, address?.State, address?.Pincode].filter(Boolean).join(', ')}
                </Text>
                {order.delivery_address && order.receiver_phone ? (
                  <Text style={[s.addressText, { marginTop: 4, fontFamily: 'DMSans-Medium', color: '#141414' }]}>
                    📞 Phone: {order.receiver_phone}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={s.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => Toast.show('Invoice download coming soon', { duration: Toast.durations.SHORT })}
            >
              <Text style={s.secondaryText}>⭳ Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ContactUs')}
            >
              <Text style={s.secondaryText}>Need help?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.reorderBtn} activeOpacity={0.9} onPress={reorder}>
            <Text style={s.reorderText}>↻ Reorder these items</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },

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
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 20, color: '#141414', letterSpacing: -0.3 },
  headerSub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#141414',
    borderRadius: 18,
    padding: 16,
  },
  bannerTile: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#fff', letterSpacing: -0.2 },
  bannerSub: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#b4b4b4', marginTop: 3 },

  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.7,
    color: '#8a8a8a',
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4F2' },
  itemThumb: { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemImg: { width: 48, height: 48 },
  itemLetter: { fontFamily: 'DMSans-Bold', fontSize: 22, color: 'rgba(0,0,0,0.22)' },
  itemName: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#141414', lineHeight: 18 },
  itemQty: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#8a8a8a', marginTop: 2 },
  itemPrice: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#555' },
  billValue: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#333' },
  free: { color: '#0C831F', fontFamily: 'DMSans-Bold' },
  billDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderTopColor: '#E4E4E2', marginVertical: 8 },
  billTotalLabel: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414' },
  billTotalValue: { fontFamily: 'DMSans-Bold', fontSize: 19, color: '#141414' },

  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  addressLabel: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  addressText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: '#8a8a8a', marginTop: 3, lineHeight: 18 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  secondaryBtn: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5,
    borderColor: '#ECECE8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },

  reorderBtn: {
    marginTop: 12,
    height: 56,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  reorderText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#fff' },

  errorTitle: { fontFamily: 'DMSans-Bold', fontSize: 17, color: '#141414' },
  errorBtn: { backgroundColor: '#141414', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13 },
  errorBtnText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#fff' },
})

export default ViewOrderScreen
