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
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg'
import { useTheme } from '../../../shared/context/ThemeContext'

/* ── SVG Icons ───────────────────────────────────────────────────── */
const BackArrowSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const EmptyCartSvgIcon = ({ color = '#0066CC', size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill={color} />
    <Path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill={color} />
    <Path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const CouponSvgIcon = ({ color = '#0066CC', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 5V7M15 11V13M15 17V19M5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5Z" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const BikeDeliverySvgIcon = ({ color = '#0066CC', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="1.5" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="1.5" />
    <Path d="M8 17.5H15M15 17.5L15.5 13.5L13 11L9 10L7 13L8 17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13 11L14 6H17L19 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const ShieldSvgIcon = ({ color = '#829AB8', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const HeartTipSvgIcon = ({ color = '#FF6B6B', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill={color} />
  </Svg>
)

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

// Map cart item to card shape
const mapCartItem = (raw: any) => {
  const product = raw.product ?? raw.Product ?? raw
  return {
    cartItemId: raw.id ?? raw.Id,          // Cart item ID for deletion
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
  const { isDark, colors } = useTheme()
  const [loading, setLoading] = useState(false)
  const imageUrl = product.images?.length
    ? buildImageUrl(product.images[0])
    : product.image ? buildImageUrl(product.image) : null
  const bg = isDark ? 'rgba(30, 58, 100, 0.6)' : AVATAR_COLORS[index % AVATAR_COLORS.length]
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
    <View style={[s.cartItem, { borderBottomColor: colors.divider }]}>
      <View style={[s.itemThumb, { backgroundColor: bg, borderColor: colors.border }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={s.itemImg} resizeMode="contain" />
        ) : (
          <Text style={s.itemLetter}>{letter}</Text>
        )}
      </View>
      <View style={s.itemInfo}>
        <Text style={[s.itemName, { color: colors.cartText }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[s.itemUnit, { color: colors.cartSubText }]}>{product.unit || product.weight || 'per unit'}</Text>
      </View>
      <View style={s.itemRight}>
        {loading
          ? <ActivityIndicator size="small" color={colors.accent} />
          : <Text style={[s.itemPrice, { color: isDark ? '#FBBF24' : colors.cartText }]}>₹{unitPrice.toLocaleString('en-IN')}</Text>
        }
        <View style={[s.stepper, { backgroundColor: colors.accent }]}>
          <TouchableOpacity style={s.stepBtn} onPress={() => updateQty(-1)}>
            <Text style={[s.stepTxt, { color: colors.accentText }]}>−</Text>
          </TouchableOpacity>
          <Text style={[s.stepQty, { color: colors.accentText }]}>{product.quantity || 1}</Text>
          <TouchableOpacity style={s.stepBtn} onPress={() => updateQty(1)}>
            <Text style={[s.stepTxt, { color: colors.accentText }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function CartScreen() {
  const { isDark, colors } = useTheme()
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
        // Sync cart count to storage
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
      setCartItems(prev)  // Revert on failure
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
      <LinearGradient colors={colors.headerGradient} style={s.root}>
        <StatusBar backgroundColor={colors.statusBarBg} barStyle={colors.statusBarStyle} />
        <View style={[s.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[s.loadingText, { color: colors.textSecondary }]}>Loading your cart…</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={isDark ? ['#071224', '#0B1B36', '#071224'] : ['#F7F9FC', '#EEF2F7', '#F7F9FC']}
      locations={[0, 0.5, 1]}
      style={s.root}
    >
      <StatusBar backgroundColor={colors.statusBarBg} barStyle={colors.statusBarStyle} />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Header */}
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <TouchableOpacity style={[s.backBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <BackArrowSvgIcon color="#0B1B36" size={20} />
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={[s.headerTitle, { color: '#0B1B36' }]}>Your cart</Text>
            <Text style={[s.headerSub, { color: '#64748B' }]}>⚡ Delivery in 8 minutes</Text>
          </View>
          {cartItems.length > 0 && (
            <View style={[s.countBadge, { backgroundColor: '#ffff00' }]}>
              <Text style={[s.countBadgeText, { color: '#0B1B36' }]}>{cartItems.length}</Text>
            </View>
          )}
        </LinearGradient>

        {cartItems.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyIcon}>
              <EmptyCartSvgIcon color="#FBBF24" size={58} />
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
                <View style={[s.deliveryCard, { backgroundColor: colors.cartCard, borderColor: colors.cartBorder }]}>
                  {freeUnlocked ? (
                    <Text style={s.deliveryUnlocked}>🎉 You’ve unlocked FREE delivery!</Text>
                  ) : (
                    <Text style={[s.deliveryLocked, { color: colors.cartText }]}>
                      Add <Text style={s.deliveryAmount}>₹{remaining}</Text> more for FREE delivery ⚡
                    </Text>
                  )}
                  <View style={[s.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)' }]}>
                    <View style={[s.progressFill, { width: `${freePct}%` as any, backgroundColor: colors.accent }]} />
                  </View>
                </View>
              }
              renderItem={({ item, index }) => (
                <View style={[index === 0 ? s.itemsCardTop : s.itemsCardMid, { backgroundColor: colors.cartCard, borderColor: colors.cartBorder }]}>
                  <CartCard product={item} index={index} onRemove={removeItem} onQtyUpdate={updateQuantity} />
                </View>
              )}
              ListFooterComponent={
                <>
                  {/* Add more button */}
                  <TouchableOpacity
                    style={[s.addMoreBtn, { backgroundColor: colors.cartCard, borderColor: colors.cartBorder }]}
                    onPress={() => navigation.navigate('ProductList')}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.addMoreText, { color: colors.accent }]}>+ Add more items</Text>
                  </TouchableOpacity>

                  {/* Coupon section */}
                  <TouchableOpacity style={[s.couponCard, { backgroundColor: colors.cartCard, borderColor: colors.accent }]} onPress={toggleCoupon} activeOpacity={0.85}>
                    <View style={s.couponIconWrap}>
                      <CouponSvgIcon color={colors.accent} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      {couponApplied ? (
                        <>
                          <Text style={[s.couponTitle, { color: colors.cartText }]}>Coupon {COUPON.code} applied</Text>
                          <Text style={s.couponSaved}>You saved ₹{COUPON.amount}</Text>
                        </>
                      ) : (
                        <>
                          <Text style={[s.couponTitle, { color: colors.cartText }]}>Apply coupon</Text>
                          <Text style={[s.couponSub, { color: colors.cartSubText }]}>{COUPON.code} — {COUPON.desc}</Text>
                        </>
                      )}
                    </View>
                    <Text style={[s.couponChevron, couponApplied && { color: '#FF6B6B' }]}>
                      {couponApplied ? '✕' : '›'}
                    </Text>
                  </TouchableOpacity>

                  {/* Tip section */}
                  <View style={[s.tipCard, { backgroundColor: colors.cartCard }]}>
                    <View style={s.tipHeader}>
                      <HeartTipSvgIcon color="#FF6B6B" size={18} />
                      <View>
                        <Text style={[s.tipTitle, { color: colors.cartText }]}>Tip your delivery partner</Text>
                        <Text style={[s.tipSub, { color: colors.cartSubText }]}>100% of your tip goes to the rider.</Text>
                      </View>
                    </View>
                    <View style={s.tipRow}>
                      {TIP_OPTIONS.map(amt => {
                        const active = tip === amt
                        return (
                          <TouchableOpacity
                            key={amt}
                            style={[s.tipPill, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }, active && { borderColor: colors.accent, backgroundColor: colors.accentGlow }]}
                            onPress={() => setTip(active ? 0 : amt)}
                            activeOpacity={0.8}
                          >
                            <Text style={[s.tipPillText, { color: colors.cartSubText }, active && { color: colors.accent }]}>₹{amt}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>

                  {/* Bill details */}
                  <View style={[s.billCard, { backgroundColor: colors.cartCard, borderColor: colors.cartBorder }]}>
                    <Text style={[s.billTitle, { color: colors.cartText }]}>Bill details</Text>
                    <View style={s.billRow}>
                      <Text style={[s.billLabel, { color: colors.cartSubText }]}>Item total</Text>
                      <Text style={[s.billValue, { color: colors.cartText }]}>₹{itemTotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={s.billRow}>
                      <Text style={[s.billLabel, { color: colors.cartSubText }]}>Delivery fee</Text>
                      <Text style={[s.billValue, { color: colors.cartText }, freeUnlocked && s.billFree]}>
                        {freeUnlocked ? 'FREE' : `₹${DELIVERY_FEE}`}
                      </Text>
                    </View>
                    <View style={s.billRow}>
                      <Text style={[s.billLabel, { color: colors.cartSubText }]}>Handling charge</Text>
                      <Text style={[s.billValue, { color: colors.cartText }]}>₹{HANDLING_CHARGE}</Text>
                    </View>
                    {tip > 0 && (
                      <View style={s.billRow}>
                        <Text style={[s.billLabel, { color: colors.cartSubText }]}>Delivery tip</Text>
                        <Text style={[s.billValue, { color: colors.cartText }]}>₹{tip}</Text>
                      </View>
                    )}
                    {couponDiscount > 0 && (
                      <View style={s.billRow}>
                        <Text style={[s.billLabel, { color: colors.cartSubText }]}>Coupon ({COUPON.code})</Text>
                        <Text style={[s.billValue, s.billFree]}>−₹{couponDiscount}</Text>
                      </View>
                    )}
                    <View style={[s.billDivider, { borderTopColor: colors.billDivider }]} />
                    <View style={s.billRow}>
                      <Text style={[s.billTotalLabel, { color: colors.cartText }]}>To pay</Text>
                      <Text style={[s.billTotalValue, { color: isDark ? '#FBBF24' : colors.textPrimary }]}>₹{toPay.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>

                  {/* Savings banner */}
                  {savings > 0 && (
                    <View style={s.savingsBanner}>
                      <Text style={s.savingsText}>🎉 You’re saving ₹{savings} on this order</Text>
                    </View>
                  )}

                  <View style={s.secureNote}>
                    <ShieldSvgIcon color={colors.textSecondary} size={13} />
                    <Text style={[s.cancelNote, { color: colors.cartSubText }]}>
                      Orders once placed can be cancelled within 60 seconds.
                    </Text>
                  </View>
                  <View style={{ height: 110 }} />
                </>
              }
            />

            {/* Sticky pay bar */}
            <View style={[s.payBar, { backgroundColor: colors.payBarBg, borderTopColor: colors.payBarBorder }]}>
              <TouchableOpacity
                style={[s.payBtn, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate('PlaceOrder')}
                activeOpacity={0.92}
              >
                <View>
                  <Text style={[s.payLabel, { color: colors.accentText }]}>TO PAY</Text>
                  <Text style={[s.payAmount, { color: colors.accentText }]}>₹{toPay.toLocaleString('en-IN')}</Text>
                </View>
                <View style={s.payCta}>
                  <Text style={[s.payCtaText, { color: colors.accentText }]}>Proceed to pay</Text>
                  <Text style={[s.payArrow, { color: colors.accentText }]}>→</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#071224' },
  loadingText: { fontSize: 14, color: '#829AB8', fontFamily: 'DMSans-Regular' },
  countBadge: {
    backgroundColor: '#FBBF24',
    borderRadius: 14,
    minWidth: 30,
    height: 30,
    paddingHorizontal: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#0B1B36' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  headerInfo: { flex: 1 },
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: -0.4 },
  headerSub: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#FBBF24', marginTop: 1 },

  list: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 20 },

  deliveryCard: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  deliveryUnlocked: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#FBBF24' },
  deliveryLocked: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#FFFFFF' },
  deliveryAmount: { color: '#FBBF24', fontFamily: 'DMSans-Bold' },
  progressTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 6,
    marginTop: 11,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFE000', borderRadius: 6 },

  itemsCardTop: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  itemsCardMid: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemThumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  itemImg: { width: 54, height: 54 },
  itemLetter: { fontSize: 26, fontFamily: 'DMSans-Bold', color: 'rgba(251, 191, 36, 0.5)' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#FFFFFF', lineHeight: 18 },
  itemUnit: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#829AB8', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 7 },
  itemPrice: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#FBBF24' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBBF24',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepBtn: { width: 30, height: 32, justifyContent: 'center', alignItems: 'center' },
  stepTxt: { color: '#0B1B36', fontSize: 17, fontFamily: 'DMSans-Bold' },
  stepQty: { color: '#0B1B36', fontFamily: 'DMSans-Bold', fontSize: 14, minWidth: 16, textAlign: 'center' },

  addMoreBtn: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  addMoreText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#FBBF24' },

  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    borderStyle: 'dashed',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 14,
  },
  couponIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponTitle: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#FFFFFF' },
  couponSub: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#829AB8', marginTop: 2 },
  couponSaved: { fontFamily: 'DMSans-Bold', fontSize: 12, color: '#FBBF24', marginTop: 2 },
  couponChevron: { fontSize: 20, color: '#FBBF24', fontFamily: 'DMSans-Bold' },

  tipCard: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  tipTitle: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#FFFFFF' },
  tipSub: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: '#829AB8' },
  tipRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  tipPill: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tipPillActive: { borderColor: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.15)' },
  tipPillText: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#829AB8' },
  tipPillTextActive: { color: '#FBBF24' },

  billCard: {
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },
  billTitle: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#FFFFFF', marginBottom: 8 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#829AB8' },
  billValue: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#C9D8F0' },
  billFree: { color: '#FBBF24', fontFamily: 'DMSans-Bold' },
  billDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderTopColor: 'rgba(251, 191, 36, 0.2)', marginVertical: 8 },
  billTotalLabel: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#FFFFFF' },
  billTotalValue: { fontFamily: 'DMSans-Bold', fontSize: 20, color: '#FBBF24' },

  savingsBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  savingsText: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#FBBF24' },

  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  cancelNote: {
    textAlign: 'center',
    color: '#829AB8',
    fontSize: 11.5,
    fontFamily: 'DMSans-Regular',
    lineHeight: 16,
  },

  payBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    backgroundColor: 'rgba(7, 18, 36, 0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(251, 191, 36, 0.2)',
    padding: 14,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  payBtn: {
    height: 58,
    backgroundColor: '#FBBF24',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  payLabel: { fontFamily: 'DMSans-Bold', fontSize: 10, color: 'rgba(11, 27, 54, 0.7)', letterSpacing: 0.8 },
  payAmount: { fontFamily: 'DMSans-Bold', fontSize: 20, color: '#0B1B36' },
  payCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  payCtaText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#0B1B36' },
  payArrow: { fontSize: 18, color: '#0B1B36' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyIcon: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  emptyTitle: { fontFamily: 'DMSans-Bold', fontSize: 22, color: '#FFFFFF', marginTop: 22 },
  emptySub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#829AB8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 240,
  },
  emptyBtn: {
    marginTop: 24,
    height: 52,
    paddingHorizontal: 32,
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  emptyBtnText: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#0B1B36' },
})
