import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { useTabBar } from '../../../shared/context/TabBarContext'
import {
  getData,
  fetchMyProfile,
  fetchCategories,
  fetchAllProducts,
} from '../../../shared/services/main-service'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Defaults from '../../../config/index'

const { width: W } = Dimensions.get('window')

const H_PADDING = 18
const BANNER_W = W - 2 * H_PADDING - 44 // full-width banner with a small peek of the next
const BANNER_GAP = 12
const BANNER_SNAP = BANNER_W + BANNER_GAP

const CATEGORY_COLORS = [
  '#E4F6E6', '#FFF4D6', '#FFE9E0', '#E0F0FF',
  '#FFF0D6', '#FFE9E0', '#EBE4FF', '#FFF4D6',
]
const CATEGORY_EMOJIS = ['🥦', '🥚', '🍿', '🥤', '🥐', '🍜', '🧴', '🍪']

const PRODUCT_BG_COLORS = [
  '#FFE0E0', '#FFF4D6', '#E0F0FF', '#E4F6E6',
  '#EBE4FF', '#FFE9E0', '#E0FFE8', '#F4E8FF',
]

const buildImageUrl = (img: string): string => {
  if (!img) return ''
  const cleaned = img.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http') ? cleaned : `${Defaults.apis.baseUrl}/${cleaned}`
}

// Tactile ADD / qty control that scales on press for a responsive feel
function AnimatedAddButton({
  qty,
  onAdd,
  onInc,
  onDec,
}: {
  qty: number
  onAdd: () => void
  onInc: () => void
  onDec: () => void
}) {
  const scale = useRef(new Animated.Value(1)).current

  const pop = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start()
  }

  if (qty === 0) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={h.addBtn}
          activeOpacity={0.82}
          onPress={() => {
            pop()
            onAdd()
          }}
        >
          <Text style={h.addBtnText}>ADD</Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <View style={h.stepper}>
      <TouchableOpacity style={h.stepBtn} onPress={onDec} activeOpacity={0.7}>
        <Text style={h.stepTxt}>−</Text>
      </TouchableOpacity>
      <Text style={h.stepQty}>{qty}</Text>
      <TouchableOpacity
        style={h.stepBtn}
        onPress={() => {
          pop()
          onInc()
        }}
        activeOpacity={0.7}
      >
        <Text style={h.stepTxt}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

function Home({ navigation }: any) {
  const { showTabBar } = useTabBar()
  const [loading, setLoading] = useState(true)
  const [userInitial, setUserInitial] = useState('?')
  const [address, setAddress] = useState<string>('Set your delivery address')
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [activeBanner, setActiveBanner] = useState(0)

  const bannerRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useFocusEffect(
    useCallback(() => {
      showTabBar()
      loadHomeData()
      loadCart()
    }, []),
  )

  // Fade the body in once the first load resolves
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    }
  }, [loading, fadeAnim])

  // Auto-advance the promo banner carousel
  useEffect(() => {
    const id = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % 2
        bannerRef.current?.scrollTo({ x: next * BANNER_SNAP, animated: true })
        return next
      })
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      const [profileData, cats, prods, addrRes] = await Promise.all([
        fetchMyProfile().catch(() => null),
        fetchCategories().catch(() => []),
        fetchAllProducts(1, 20).catch(() => ({ items: [], totalPages: 1, totalCount: 0, currentPage: 1 })),
        getData('/address').catch(() => null),
      ])

      if (profileData) {
        const name = profileData.FirstName
          ? `${profileData.FirstName}${profileData.LastName ? ' ' + profileData.LastName : ''}`
          : profileData.name || ''
        setUserInitial(name ? name[0].toUpperCase() : '?')
      }

      const addrList: any[] = addrRes?.data?.data || []
      const defaultAddr = addrList.find((a: any) => a.isDefault) || addrList[0]
      if (defaultAddr) {
        const rest = [defaultAddr.line1, defaultAddr.city].filter(Boolean).join(', ')
        setAddress(`${defaultAddr.label || 'Home'} — ${rest}`)
      }

      setCategories(Array.isArray(cats) ? cats.filter((c: any) => c.status !== false) : [])
      const productItems = Array.isArray(prods) ? prods : (prods as any)?.items || []
      setProducts(Array.isArray(productItems) ? productItems.filter((p: any) => p.status === 'active') : [])
    } catch (e) {
      console.log('Home data error:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadCart = async () => {
    const stored = (await getAsyncData('cart_items')) || []
    setCartItems(Array.isArray(stored) ? stored : [])
  }

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + (i.quantity || 1), 0),
    [cartItems],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((s, i) => s + (i.points || 0) * (i.quantity || 1), 0),
    [cartItems],
  )

  const addToCart = async (product: any) => {
    const existing = cartItems.find(i => i.id === product.id)
    let updated
    if (existing) {
      updated = cartItems.map(i =>
        i.id === product.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i,
      )
    } else {
      updated = [...cartItems, { ...product, quantity: 1 }]
    }
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)
  }

  const updateQty = async (productId: number, delta: number) => {
    let updated = cartItems
      .map(i => (i.id === productId ? { ...i, quantity: (i.quantity || 1) + delta } : i))
      .filter(i => (i.quantity || 0) > 0)
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)
  }

  const getQty = (id: number) => {
    const item = cartItems.find(i => i.id === id)
    return item?.quantity || 0
  }

  const deals = useMemo(() => products.filter((_, i) => i < 8), [products])
  const bestsellers = useMemo(
    () => products.filter((_, i) => i >= 4 && i < 12),
    [products],
  )

  const getDiscountPercent = (item: any) => {
    const price = parseFloat(item.price) || 0
    const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
    if (mrp > price && price > 0) {
      return Math.round(((mrp - price) / mrp) * 100)
    }
    return 0
  }

  const onBannerScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_SNAP)
    if (idx !== activeBanner) setActiveBanner(idx)
  }

  const renderProductCard = (item: any, index: number) => {
    const qty = getQty(item.id)
    const price = parseFloat(item.price) || 0
    const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
    const imageUri = buildImageUrl(item.image)
    const discount = getDiscountPercent(item)
    const bgColor = PRODUCT_BG_COLORS[index % 8]

    return (
      <View key={item.id} style={h.productCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CategoryProducts', { category: { id: 0, name: 'All' } })}
        >
          <View style={[h.productImgBox, { backgroundColor: bgColor }]}>
            {discount > 0 && (
              <View style={h.discountBadge}>
                <Text style={h.discountText}>{discount}% OFF</Text>
              </View>
            )}
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={h.productImg} resizeMode="contain" />
            ) : (
              <Text style={h.productImgFallback}>
                {item.name ? item.name[0].toUpperCase() : '📦'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={h.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={h.productUnit}>{item.unit || item.weight || 'per unit'}</Text>
        <View style={h.productBottom}>
          <View>
            <Text style={h.productPrice}>₹{price.toLocaleString('en-IN')}</Text>
            {mrp > price && (
              <Text style={h.productMrp}>₹{mrp.toLocaleString('en-IN')}</Text>
            )}
          </View>
          <AnimatedAddButton
            qty={qty}
            onAdd={() => addToCart(item)}
            onInc={() => updateQty(item.id, 1)}
            onDec={() => updateQty(item.id, -1)}
          />
        </View>
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFE000" translucent={false} />

      <LinearGradient
        colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']}
        locations={[0, 0.4, 1]}
        style={h.root}
      >
        {/* Vivid yellow header + search — a single seamless block */}
        <LinearGradient
          colors={['#FFE500', '#FFDD00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={h.headerBlock}
        >
          <View style={h.header}>
            <TouchableOpacity
              style={h.headerAddr}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Addresses' as never)}
            >
              <View style={h.headerDelivery}>
                <Text style={h.deliveryTime}>Delivery in 8 min</Text>
                <Text style={h.deliveryBolt}>⚡</Text>
              </View>
              <View style={h.addressRow}>
                <Text style={h.addressText} numberOfLines={1}>
                  {address}
                </Text>
                <Text style={h.addressChevron}>▾</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={h.profileBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Text style={h.profileBtnText}>{userInitial}</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <TouchableOpacity
            style={h.searchBar}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Text style={h.searchIcon}>🔎</Text>
            <Text style={h.searchPlaceholder}>Search "milk", "eggs", "chips"…</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Scroll Body */}
        {loading ? (
          <View style={h.center}>
            <ActivityIndicator size="large" color="#0C831F" />
          </View>
        ) : (
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={h.scrollContent}
            style={{ opacity: fadeAnim }}
          >
            {/* Banners */}
            <ScrollView
              ref={bannerRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={h.bannerScroll}
              snapToInterval={BANNER_SNAP}
              decelerationRate="fast"
              disableIntervalMomentum
              onMomentumScrollEnd={onBannerScroll}
            >
              <View style={[h.bannerDark, { width: BANNER_W }]}>
                <View style={h.bannerCircle} />
                <Text style={h.bannerTitle}>
                  {'FREE delivery\n'}
                  <Text style={h.bannerHighlight}>all week ⚡</Text>
                </Text>
                <Text style={h.bannerSub}>No minimum • on every order</Text>
              </View>
              <LinearGradient
                colors={['#FF5A3C', '#FF8A3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[h.bannerGradient, { width: BANNER_W }]}
              >
                <View style={h.bannerCircleLight} />
                <Text style={h.bannerTitle}>{'Up to 50% off\nFresh picks'}</Text>
                <Text style={h.bannerSubLight}>Ends in 02:14:33</Text>
              </LinearGradient>
            </ScrollView>

            {/* Pagination dots */}
            <View style={h.dotsRow}>
              {[0, 1].map(i => (
                <View
                  key={i}
                  style={[h.dot, activeBanner === i ? h.dotActive : null]}
                />
              ))}
            </View>

            {/* Category Grid */}
            {categories.length > 0 && (
              <View style={h.catGrid}>
                {categories.slice(0, 8).map((cat, idx) => {
                  const imageUri = cat.image ? buildImageUrl(cat.image) : null
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={h.catItem}
                      activeOpacity={0.82}
                      onPress={() => navigation.navigate('CategoryProducts', { category: cat })}
                    >
                      <View style={[h.catIconBox, { backgroundColor: CATEGORY_COLORS[idx % 8] }]}>
                        {imageUri ? (
                          <Image source={{ uri: imageUri }} style={h.catImage} resizeMode="cover" />
                        ) : (
                          <Text style={h.catEmoji}>{CATEGORY_EMOJIS[idx % 8]}</Text>
                        )}
                      </View>
                      <Text style={h.catName} numberOfLines={2}>{cat.name}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {/* Deals Strip */}
            {deals.length > 0 && (
              <>
                <View style={h.stripHeader}>
                  <Text style={h.stripTitle}>⚡ Deals under ₹99</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ProductList' as never)}>
                    <Text style={h.stripSeeAll}>See all →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={h.productStrip}
                >
                  {deals.map((item, index) => renderProductCard(item, index))}
                </ScrollView>
              </>
            )}

            {/* Bestsellers Strip */}
            {bestsellers.length > 0 && (
              <>
                <View style={h.stripHeader}>
                  <Text style={h.stripTitle}>🔥 Bestsellers near you</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ProductList' as never)}>
                    <Text style={h.stripSeeAll}>See all →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={h.productStrip}
                >
                  {bestsellers.map((item, index) => renderProductCard(item, index + 4))}
                </ScrollView>
              </>
            )}

            <View style={{ height: 120 }} />
          </Animated.ScrollView>
        )}

        {/* Floating Cart Bar */}
        {cartCount > 0 && (
          <TouchableOpacity
            style={h.cartBar}
            onPress={() => navigation.navigate('Cart' as never)}
            activeOpacity={0.92}
          >
            <View style={h.cartBarLeft}>
              <Text style={h.cartBarItems}>
                {cartCount} item{cartCount > 1 ? 's' : ''}
              </Text>
              <Text style={h.cartBarTotal}>₹{cartTotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={h.cartBarRight}>
              <Text style={h.cartBarCta}>View cart</Text>
              <Text style={h.cartBarArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </>
  )
}

const h = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerBlock: {
    paddingHorizontal: H_PADDING,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#C9A800',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerAddr: { flex: 1, paddingRight: 12 },
  headerDelivery: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  deliveryTime: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#141414',
    letterSpacing: -0.5,
  },
  deliveryBolt: { fontSize: 14 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  addressText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#141414',
    flexShrink: 1,
    opacity: 0.85,
  },
  addressChevron: { fontSize: 13, color: '#141414' },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  profileBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFE000',
  },

  searchBar: {
    height: 48,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#7d7d7d',
  },

  scrollContent: { paddingBottom: 20 },

  bannerScroll: { paddingHorizontal: H_PADDING, paddingTop: 18, paddingBottom: 4, gap: BANNER_GAP },
  bannerDark: {
    height: 122,
    borderRadius: 20,
    backgroundColor: '#141414',
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bannerCircle: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFE000',
    opacity: 0.16,
  },
  bannerCircleLight: {
    position: 'absolute',
    right: -28,
    bottom: -34,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    opacity: 0.14,
  },
  bannerGradient: {
    height: 122,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#fff',
    lineHeight: 27,
  },
  bannerHighlight: { color: '#FFE000' },
  bannerSub: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#aaa',
    marginTop: 8,
  },
  bannerSubLight: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(20,20,20,0.18)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#141414',
  },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PADDING,
    paddingTop: 18,
    gap: 10,
  },
  catItem: {
    width: (W - 36 - 30) / 4,
    alignItems: 'center',
    gap: 6,
  },
  catIconBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  catImage: { width: '100%', height: '100%' },
  catEmoji: { fontSize: 30 },
  catName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 13,
  },

  stripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingTop: 20,
    paddingBottom: 10,
  },
  stripTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 19,
    color: '#141414',
  },
  stripSeeAll: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#0C831F',
  },

  productStrip: { paddingHorizontal: H_PADDING, gap: 12 },
  productCard: {
    width: 155,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 18,
    padding: 9,
  },
  productImgBox: {
    height: 105,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#141414',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    zIndex: 1,
  },
  discountText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#FFE000',
  },
  productImg: { width: '100%', height: '100%' },
  productImgFallback: {
    fontSize: 36,
    fontFamily: 'DMSans-Bold',
    color: 'rgba(0,0,0,0.15)',
  },
  productName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#141414',
    marginTop: 8,
    lineHeight: 16,
    height: 32,
  },
  productUnit: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11.5,
    color: '#8a8a8a',
    marginTop: 1,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productPrice: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#141414',
  },
  productMrp: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#9a9a9a',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#0C831F',
    backgroundColor: '#E8F7EA',
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  addBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#0C831F',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C831F',
    borderRadius: 11,
    overflow: 'hidden',
  },
  stepBtn: { width: 28, height: 32, justifyContent: 'center', alignItems: 'center' },
  stepTxt: { color: '#fff', fontSize: 18, fontFamily: 'DMSans-Bold' },
  stepQty: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    minWidth: 14,
    textAlign: 'center',
  },

  cartBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 78,
    height: 56,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 10,
  },
  cartBarLeft: {},
  cartBarItems: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#fff',
  },
  cartBarTotal: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#fff',
  },
  cartBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBarCta: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#fff',
  },
  cartBarArrow: { fontSize: 17, color: '#fff' },
})

export default Home
