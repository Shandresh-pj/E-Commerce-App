import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { setAsyncData } from '../../../shared/utils/storage'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import Defaults from '../../../config/index'
import LinearGradient from 'react-native-linear-gradient'
import { fetchApiCart, removeFromApiCart } from '../../../shared/services/main-service'

const buildImageUrl = (img: string) => {
  if (!img) return ''
  const cleaned = img.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http') ? cleaned : `${Defaults.apis.baseUrl}/${cleaned}`
}

const AVATAR_COLORS = ['#FFE0E0', '#E9ECFB', '#FFF0D6', '#E4F6E6', '#EBE4FF', '#FFE9E0']

const DELIVERY_FEE = 25
const HANDLING_CHARGE = 6
const FREE_THRESHOLD = 199
const TIP_OPTIONS = [10, 20, 30]
const COUPON = { code: 'JIFFY50', amount: 50, desc: '₹50 off your first order' }

// Maps a raw API cart item to the shape CartCard expects
const mapCartItem = (raw: any) => {
  const product = raw.product ?? raw.Product ?? raw
  return {
    cartItemId: raw.id ?? raw.Id,          // cart row id — used for DELETE /cart/{id}
    id: product.id ?? product.Id ?? raw.product_id ?? raw.ProductId,
    name: product.name ?? raw.name ?? 'Product',
    image: product.image ?? raw.image ?? '',
    images: product.images ?? raw.images ?? [],
    unit: product.unit ?? product.weight ?? raw.unit ?? '',
    points: parseFloat(product.price ?? raw.price ?? '0') || 0,
    quantity: raw.quantity ?? raw.Quantity ?? 1,
  }
}

const CartCard = ({ product, index, onRemove, onQtyUpdate }: any) => {
  const [loading, setLoading] = useState(false)
  const imageUrl = product.images?.length
    ? buildImageUrl(product.images[0])
    : product.image ? buildImageUrl(product.image) : null
  const bg = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const letter = product.name ? product.name[0].toUpperCase() : '📦'

  const handleRemove = async () => {
    if (loading) return
    setLoading(true)
    try { await onRemove(product.cartItemId, product.id) } finally { setLoading(false) }
  }

  const updateQty = (delta: number) => {
    const newQty = (product.quantity || 1) + delta
    if (newQty <= 0) handleRemove()
    else onQtyUpdate(product.id, newQty)
  }

  const unitPrice = product.points || 0

  return (
    <View style={s.cartItem}>
      <View style={[s.itemThumb, { backgroundColor: bg }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={s.itemImg} resizeMode="contain" />
        ) : (
          <Text style={s.itemLetter}>{letter}</Text>
        )}
      </View>
      <View style={s.itemInfo}>
        <Text style={s.itemName} numberOfLines={2}>{product.name}</Text>
        <Text style={s.itemUnit}>{product.unit || product.weight || 'per unit'}</Text>
      </View>
      <View style={s.itemRight}>
        {loading
          ? <ActivityIndicator size="small" color="#0C831F" />
          : <Text style={s.itemPrice}>₹{unitPrice.toLocaleString('en-IN')}</Text>
        }
        <View style={s.stepper}>
          <TouchableOpacity style={s.stepBtn} onPress={() => updateQty(-1)}>
            <Text style={s.stepTxt}>−</Text>
          </TouchableOpacity>
          <Text style={s.stepQty}>{product.quantity || 1}</Text>
          <TouchableOpacity style={s.stepBtn} onPress={() => updateQty(1)}>
            <Text style={s.stepTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function CartScreen() {
  const navigation = useNavigation<any>()
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [tip, setTip] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)

  useFocusEffect(useCallback(() => { fetchCart() }, []))

  const fetchCart = async () => {
    setLoading(true)
    try {
      const raw = await fetchApiCart()
      if (raw && raw.length >= 0) {
        const mapped = raw.map(mapCartItem)
        setCartItems(mapped)
        // Keep AsyncStorage in sync so other screens can read cart count
        await setAsyncData('cart_items', mapped as any)
      }
    } catch (e) {
      console.log('fetchCart error:', e)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (cartItemId: number, productId: number) => {
    // Optimistic removal
    const prev = cartItems
    setCartItems(items => items.filter(i => i.cartItemId !== cartItemId))
    const success = await removeFromApiCart(cartItemId)
    if (success) {
      Toast.show('Removed from cart', { duration: Toast.durations.SHORT })
      const updated = prev.filter(i => i.cartItemId !== cartItemId)
      await setAsyncData('cart_items', updated as any)
    } else {
      setCartItems(prev)  // revert on failure
      Toast.show('Could not remove item. Please try again.', { duration: Toast.durations.SHORT })
    }
  }

  const updateQuantity = async (productId: number, newQty: number) => {
    const updated = cartItems.map(i => i.id === productId ? { ...i, quantity: newQty } : i)
    await setAsyncData('cart_items', updated as any)
    setCartItems(updated)
  }

  const itemTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.points || 0) * (i.quantity || 1), 0),
    [cartItems],
  )

  const freeUnlocked = itemTotal >= FREE_THRESHOLD
  const remaining = Math.max(0, FREE_THRESHOLD - itemTotal)
  const freePct = Math.min(100, (itemTotal / FREE_THRESHOLD) * 100)

  const deliveryFee = freeUnlocked ? 0 : DELIVERY_FEE
  const couponDiscount = couponApplied ? COUPON.amount : 0
  const toPay = Math.max(0, itemTotal + deliveryFee + HANDLING_CHARGE + tip - couponDiscount)
  const savings = couponDiscount + (freeUnlocked ? DELIVERY_FEE : 0)

  const toggleCoupon = () => {
    setCouponApplied(prev => {
      const next = !prev
      Toast.show(next ? `Coupon ${COUPON.code} applied` : 'Coupon removed', {
        duration: Toast.durations.SHORT,
      })
      return next
    })
  }

  if (loading) {
    return (
      <LinearGradient colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']} style={s.root}>
        <StatusBar backgroundColor="#FFF6C8" barStyle="dark-content" />
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0C831F" />
          <Text style={s.loadingText}>Loading your cart…</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']}
      locations={[0, 0.28, 1]}
      style={s.root}
    >
      <StatusBar backgroundColor="#FFE500" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Signature Vibrant Yellow Header */}
        <LinearGradient
          colors={['#FFE500', '#FFDD00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={s.headerTitle}>Your cart</Text>
            <Text style={s.headerSub}>⚡ Delivery in 8 minutes</Text>
          </View>
          {cartItems.length > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </LinearGradient>

        {cartItems.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyIcon}>
              <Text style={{ fontSize: 48 }}>🛒</Text>
            </View>
            <Text style={s.emptyTitle}>Your cart is empty</Text>
            <Text style={s.emptySub}>Good things arrive in 10 minutes. Add something tasty.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('ProductList')} activeOpacity={0.85}>
              <Text style={s.emptyBtnText}>Start shopping →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={item => String(item.cartItemId ?? item.id)}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={s.deliveryCard}>
                  {freeUnlocked ? (
                    <Text style={s.deliveryUnlocked}>🎉 You've unlocked FREE delivery!</Text>
                  ) : (
                    <Text style={s.deliveryLocked}>
                      Add <Text style={s.deliveryAmount}>₹{remaining}</Text> more for FREE delivery ⚡
                    </Text>
                  )}
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${freePct}%` }]} />
                  </View>
                </View>
              }
              renderItem={({ item, index }) => (
                <View style={index === 0 ? s.itemsCardTop : s.itemsCardMid}>
                  <CartCard product={item} index={index} onRemove={removeItem} onQtyUpdate={updateQuantity} />
                </View>
              )}
              ListFooterComponent={
                <>
                  {/* Add more */}
                  <TouchableOpacity
                    style={s.addMoreBtn}
                    onPress={() => navigation.navigate('ProductList')}
                    activeOpacity={0.8}
                  >
                    <Text style={s.addMoreText}>+ Add more items</Text>
                  </TouchableOpacity>

                  {/* Coupon */}
                  <TouchableOpacity style={s.couponCard} onPress={toggleCoupon} activeOpacity={0.85}>
                    <Text style={s.couponIcon}>🎟️</Text>
                    <View style={{ flex: 1 }}>
                      {couponApplied ? (
                        <>
                          <Text style={s.couponTitle}>Coupon {COUPON.code} applied</Text>
                          <Text style={s.couponSaved}>You saved ₹{COUPON.amount}</Text>
                        </>
                      ) : (
                        <>
                          <Text style={s.couponTitle}>Apply coupon</Text>
                          <Text style={s.couponSub}>{COUPON.code} — {COUPON.desc}</Text>
                        </>
                      )}
                    </View>
                    <Text style={[s.couponChevron, couponApplied && { color: '#C0392B' }]}>
                      {couponApplied ? '✕' : '›'}
                    </Text>
                  </TouchableOpacity>

                  {/* Tip */}
                  <View style={s.tipCard}>
                    <Text style={s.tipTitle}>Tip your delivery partner 🧡</Text>
                    <Text style={s.tipSub}>100% of your tip goes to the rider.</Text>
                    <View style={s.tipRow}>
                      {TIP_OPTIONS.map(amt => {
                        const active = tip === amt
                        return (
                          <TouchableOpacity
                            key={amt}
                            style={[s.tipPill, active && s.tipPillActive]}
                            onPress={() => setTip(active ? 0 : amt)}
                            activeOpacity={0.8}
                          >
                            <Text style={[s.tipPillText, active && s.tipPillTextActive]}>₹{amt}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>

                  {/* Bill details */}
                  <View style={s.billCard}>
                    <Text style={s.billTitle}>Bill details</Text>
                    <View style={s.billRow}>
                      <Text style={s.billLabel}>Item total</Text>
                      <Text style={s.billValue}>₹{itemTotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={s.billRow}>
                      <Text style={s.billLabel}>Delivery fee</Text>
                      <Text style={[s.billValue, freeUnlocked && s.billFree]}>
                        {freeUnlocked ? 'FREE' : `₹${DELIVERY_FEE}`}
                      </Text>
                    </View>
                    <View style={s.billRow}>
                      <Text style={s.billLabel}>Handling charge</Text>
                      <Text style={s.billValue}>₹{HANDLING_CHARGE}</Text>
                    </View>
                    {tip > 0 && (
                      <View style={s.billRow}>
                        <Text style={s.billLabel}>Delivery tip</Text>
                        <Text style={s.billValue}>₹{tip}</Text>
                      </View>
                    )}
                    {couponDiscount > 0 && (
                      <View style={s.billRow}>
                        <Text style={s.billLabel}>Coupon ({COUPON.code})</Text>
                        <Text style={[s.billValue, s.billFree]}>−₹{couponDiscount}</Text>
                      </View>
                    )}
                    <View style={s.billDivider} />
                    <View style={s.billRow}>
                      <Text style={s.billTotalLabel}>To pay</Text>
                      <Text style={s.billTotalValue}>₹{toPay.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>

                  {/* Savings banner */}
                  {savings > 0 && (
                    <View style={s.savingsBanner}>
                      <Text style={s.savingsText}>🎉 You're saving ₹{savings} on this order</Text>
                    </View>
                  )}

                  <Text style={s.cancelNote}>
                    Orders once placed can be cancelled within 60 seconds. Read our policy.
                  </Text>
                  <View style={{ height: 110 }} />
                </>
              }
            />

            {/* Sticky pay bar */}
            <View style={s.payBar}>
              <TouchableOpacity
                style={s.payBtn}
                onPress={() => navigation.navigate('PlaceOrder')}
                activeOpacity={0.92}
              >
                <View>
                  <Text style={s.payLabel}>To pay</Text>
                  <Text style={s.payAmount}>₹{toPay.toLocaleString('en-IN')}</Text>
                </View>
                <View style={s.payCta}>
                  <Text style={s.payCtaText}>Proceed to pay</Text>
                  <Text style={s.payArrow}>→</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 14, color: '#8a8a8a', fontFamily: 'DMSans-Regular' },
  countBadge: {
    backgroundColor: '#141414',
    borderRadius: 13,
    minWidth: 28,
    height: 28,
    paddingHorizontal: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#FFE000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
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
  headerInfo: { flex: 1 },
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#141414', letterSpacing: -0.4 },
  headerSub: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#0C831F', marginTop: 1 },

  list: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 20 },

  deliveryCard: {
    backgroundColor: '#141414',
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
  },
  deliveryUnlocked: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#FFE000' },
  deliveryLocked: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#fff' },
  deliveryAmount: { color: '#FFE000', fontFamily: 'DMSans-Bold' },
  progressTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 6,
    marginTop: 11,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFE000', borderRadius: 6 },

  itemsCardTop: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
  },
  itemsCardMid: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F2',
  },
  itemThumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImg: { width: 54, height: 54 },
  itemLetter: { fontSize: 26, fontFamily: 'DMSans-Bold', color: 'rgba(0,0,0,0.22)' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#141414', lineHeight: 18 },
  itemUnit: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#8a8a8a', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 7 },
  itemPrice: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C831F',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepBtn: { width: 30, height: 32, justifyContent: 'center', alignItems: 'center' },
  stepTxt: { color: '#fff', fontSize: 17, fontFamily: 'DMSans-Bold' },
  stepQty: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 14, minWidth: 16, textAlign: 'center' },

  addMoreBtn: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  addMoreText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#0C831F' },

  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EAEAE7',
    borderStyle: 'dashed',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 14,
  },
  couponIcon: { fontSize: 20 },
  couponTitle: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  couponSub: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#8a8a8a', marginTop: 2 },
  couponSaved: { fontFamily: 'DMSans-Bold', fontSize: 12, color: '#0C831F', marginTop: 2 },
  couponChevron: { fontSize: 20, color: '#0C831F', fontFamily: 'DMSans-Bold' },

  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0EC',
  },
  tipTitle: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  tipSub: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#8a8a8a', marginTop: 3 },
  tipRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  tipPill: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#EAEAE7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tipPillActive: { borderColor: '#0C831F', backgroundColor: '#E8F7EA' },
  tipPillText: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414' },
  tipPillTextActive: { color: '#0C831F' },

  billCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },
  billTitle: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414', marginBottom: 8 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#555' },
  billValue: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#333' },
  billFree: { color: '#0C831F', fontFamily: 'DMSans-Bold' },
  billDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderTopColor: '#E4E4E2', marginVertical: 8 },
  billTotalLabel: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414' },
  billTotalValue: { fontFamily: 'DMSans-Bold', fontSize: 19, color: '#141414' },

  savingsBanner: {
    backgroundColor: '#E4F6E6',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 4,
  },
  savingsText: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#0C831F' },

  cancelNote: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 11.5,
    fontFamily: 'DMSans-Regular',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 16,
  },

  payBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,240,236,0.9)',
    padding: 14,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  payBtn: {
    height: 58,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  payLabel: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: 'rgba(255,255,255,0.85)' },
  payAmount: { fontFamily: 'DMSans-Bold', fontSize: 19, color: '#fff' },
  payCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  payCtaText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#fff' },
  payArrow: { fontSize: 18, color: '#fff' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 26,
    elevation: 4,
  },
  emptyTitle: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#141414', marginTop: 20 },
  emptySub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 230,
  },
  emptyBtn: {
    marginTop: 22,
    height: 50,
    paddingHorizontal: 28,
    backgroundColor: '#FFE000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBtnText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414' },
})
