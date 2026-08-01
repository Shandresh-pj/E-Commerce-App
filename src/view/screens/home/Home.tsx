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
  RefreshControl,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'
import { useTabBar } from '../../../shared/context/TabBarContext'
import {
  getData,
  fetchMyProfile,
  fetchCategories,
  fetchAllProducts,
  fetchProductDetail,
} from '../../../shared/services/main-service'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import Defaults from '../../../config/index'
import AttractiveProductCard from '../../elements/AttractiveProductCard'
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal'
import { buildImageUrl, getFallbackImage } from '../../../shared/utils/imageHelper'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const H_PADDING = 16
const GRID_GAP = 12
const BANNER_W = SCREEN_WIDTH - 2 * H_PADDING - 24
const BANNER_GAP = 12
const BANNER_SNAP = BANNER_W + BANNER_GAP

const CATEGORY_COLORS = [
  { bg: '#EFF6FF', border: '#BFDBFE' },
  { bg: '#F0FDF4', border: '#BBF7D0' },
  { bg: '#FAF5FF', border: '#E9D5FF' },
  { bg: '#FFF7ED', border: '#FFEDD5' },
  { bg: '#ECFEFF', border: '#A5F3FC' },
  { bg: '#FDF2F8', border: '#FBCFE8' },
]

const CategoryItemCard = ({ cat, index, navigation }: any) => {
  const colorConfig = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  const initialUri = buildImageUrl(cat.image, cat.name, 'category')
  const [imgSrc, setImgSrc] = useState(initialUri)

  useEffect(() => {
    setImgSrc(buildImageUrl(cat.image, cat.name, 'category'))
  }, [cat.image, cat.name])

  return (
    <Animated.View entering={SlideInRight.delay(index * 35).springify()}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('CategoryProducts', {
            category: cat,
          })
        }
        style={h.catItem}
      >
        <View
          style={[
            h.catBox,
            {
              backgroundColor: colorConfig.bg,
              borderColor: colorConfig.border,
            },
          ]}
        >
          <Image
            source={{ uri: imgSrc }}
            style={h.catImg}
            resizeMode="cover"
            onError={() => {
              const fallback = getFallbackImage(cat.name, 'category')
              if (imgSrc !== fallback) {
                setImgSrc(fallback)
              }
            }}
          />
        </View>
        <Text style={h.catName} numberOfLines={1}>
          {cat.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

function Home({ navigation }: any) {
  const { showTabBar } = useTabBar()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userInitial, setUserInitial] = useState('?')
  const [address, setAddress] = useState<string>('Set your delivery address')
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [activeBanner, setActiveBanner] = useState(0)

  // Modal Product Detail States
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ApiProductDetail | null>(null)

  const bannerRef = useRef<ScrollView>(null)

  const SEARCH_HINTS = useMemo(
    () => [
      'Search "fresh milk, curd & butter"…',
      'Search "organic vegetables & fruits"…',
      'Search "cold drinks, chips & snacks"…',
      'Search "freshly baked bread & cakes"…',
      'Search "chocolates, ice creams & sweets"…',
    ],
    []
  )
  const [hintIndex, setHintIndex] = useState(0)

  useEffect(() => {
    const hintTimer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length)
    }, 3000)
    return () => clearInterval(hintTimer)
  }, [SEARCH_HINTS])

  // Pulse animation for express delivery badge
  const pulseScale = useSharedValue(1)

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    )
  }, [])

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  useFocusEffect(
    useCallback(() => {
      showTabBar()
      loadHomeData()
      loadCart()
    }, [])
  )

  // Auto Carousel Banner
  useEffect(() => {
    const id = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % 2
        bannerRef.current?.scrollTo({ x: next * BANNER_SNAP, animated: true })
        return next
      })
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      const [profileData, cats, prods, addrRes] = await Promise.all([
        fetchMyProfile().catch(() => null),
        fetchCategories().catch(() => []),
        fetchAllProducts(1, 40).catch(() => ({
          items: [],
          totalPages: 1,
          totalCount: 0,
          currentPage: 1,
        })),
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
        const rest = [defaultAddr.line1, defaultAddr.city]
          .filter(Boolean)
          .join(', ')
        setAddress(`${defaultAddr.label || 'Home'} — ${rest}`)
      }

      // Strictly API-only Categories (filter out inactive)
      const fetchedCats = Array.isArray(cats)
        ? cats.filter((c: any) => c.status !== false && c.status !== 'inactive')
        : []
      setCategories(fetchedCats)

      // Strictly API-only Products
      const productItems = Array.isArray(prods)
        ? prods
        : (prods as any)?.items || []
      const fetchedProds = Array.isArray(productItems)
        ? productItems.filter((p: any) => p.status === 'active' || p.status === true || p.status === undefined || p.status === 1)
        : []
      setProducts(fetchedProds)
    } catch (e) {
      console.log('Home data error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadHomeData()
  }

  const loadCart = async () => {
    const stored = (await getAsyncData('cart_items')) || []
    setCartItems(Array.isArray(stored) ? stored : [])
  }

  const openDetail = useCallback(
    async (id: any) => {
      const pId = typeof id === 'object' ? id?.id || id?.Id : id
      const targetId = Number(pId)
      setDetailVisible(true)

      const existing = products.find(
        (p) =>
          p.id === targetId ||
          p.Id === targetId ||
          String(p.id) === String(targetId) ||
          String(p.Id) === String(targetId),
      )
      if (existing) {
        setDetailProduct(existing)
        setDetailLoading(false)
      } else {
        setDetailProduct(null)
        setDetailLoading(true)
      }

      try {
        const data = await fetchProductDetail(targetId)
        if (data) {
          setDetailProduct((prev: any) => ({ ...(prev || {}), ...data }))
        }
      } catch (e) {
        console.log('openDetail error:', e)
      } finally {
        setDetailLoading(false)
      }
    },
    [products],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + (i.quantity || 1), 0),
    [cartItems]
  )

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (s, i) => s + parseFloat(i.price || 0) * (i.quantity || 1),
        0
      ),
    [cartItems]
  )

  const addToCart = async (product: any) => {
    const existing = cartItems.find((i) => i.id === product.id)
    let updated
    if (existing) {
      updated = cartItems.map((i) =>
        i.id === product.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
      )
    } else {
      updated = [...cartItems, { ...product, quantity: 1 }]
    }
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)
  }

  const updateQty = async (productId: any, delta: number) => {
    const targetId = Number(productId)
    let updated = cartItems
      .map((i) =>
        i.id === targetId || i.Id === targetId || String(i.id) === String(targetId)
          ? { ...i, quantity: (i.quantity || 1) + delta }
          : i,
      )
      .filter((i) => (i.quantity || 0) > 0)
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)
  }

  const getQty = (id: any) => {
    const targetId = Number(id)
    const item = cartItems.find((i) => i.id === targetId || i.Id === targetId || String(i.id) === String(targetId))
    return item?.quantity || 0
  }

  const deals = useMemo(() => products.slice(0, 8), [products])
  const bestsellers = useMemo(() => products.slice(8, 16), [products])
  const remainingProds = useMemo(() => products.slice(16), [products])

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

  const cardWidth = useMemo(
    () => (SCREEN_WIDTH - H_PADDING * 2 - GRID_GAP) / 2,
    []
  )

  return (
    <View style={h.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFE500"
        translucent={false}
      />

      {/* Product Detail Modal */}
      <ApiProductDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        productDetail={detailProduct}
        loading={detailLoading}
        qty={detailProduct ? getQty(detailProduct.id || detailProduct.Id) : 0}
        onAdd={(id) => {
          const item = products.find((p) => p.id === id || p.Id === id) || detailProduct
          if (item) addToCart(item)
        }}
        onIncrease={(id) => updateQty(id, 1)}
        onDecrease={(id) => updateQty(id, -1)}
        related={products}
        onSelectRelated={openDetail}
        onViewCart={() => navigation.navigate('Cart')}
      />

      {/* Signature Vibrant Yellow Header */}
      <LinearGradient
        colors={['#FFE500', '#FFDD00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={h.headerBlock}
      >
        <View style={h.header}>
          <TouchableOpacity
            style={h.headerAddr}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Addresses' as never)}
          >
            <Animated.View style={[h.headerDelivery, animatedPulseStyle]}>
              <LinearGradient
                colors={['#141414', '#262626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={h.deliveryPill}
              >
                <Text style={h.deliveryBolt}>⚡</Text>
                <Text style={h.deliveryTime}>8 MIN EXPRESS</Text>
              </LinearGradient>
            </Animated.View>
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

        {/* iOS Liquid Glass Search Bar */}
        <TouchableOpacity
          style={h.searchBar}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <View style={h.searchIconBadge}>
            <Text style={h.searchIcon}>🔍</Text>
          </View>
          <View style={h.searchPlaceholderContainer}>
            <Text style={h.searchPlaceholder} numberOfLines={1}>
              {SEARCH_HINTS[hintIndex]}
            </Text>
          </View>
          <View style={h.searchActionGroup}>
            <View style={h.voiceBadge}>
              <Text style={h.voiceIcon}>🎙️</Text>
            </View>
            <View style={h.searchDivider} />
            <View style={h.scanBadge}>
              <Text style={h.scanIcon}>📸</Text>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={h.center}>
          <ActivityIndicator size="large" color="#0C831F" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={h.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0C831F']}
              tintColor="#0C831F"
            />
          }
        >
          {/* High Refresh Banner Carousel */}
          <View style={h.bannerWrapper}>
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
              {/* Banner 1 */}
              <View
                style={[
                  h.bannerDark,
                  { width: BANNER_W, marginRight: BANNER_GAP },
                ]}
              >
                <View style={h.bannerCircle} />
                <View style={h.bannerTag}>
                  <Text style={h.bannerTagText}>LIMITED TIME OFFER ✨</Text>
                </View>
                <Text style={h.bannerTitle}>
                  {'FREE Express Delivery\n'}
                  <Text style={h.bannerHighlight}>On Your Next Order ⚡</Text>
                </Text>
                <Text style={h.bannerSub}>Freshly packed & delivered in minutes</Text>
              </View>

              {/* Banner 2 */}
              <LinearGradient
                colors={['#FF5A3C', '#FF8A3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[h.bannerGradient, { width: BANNER_W }]}
              >
                <View style={h.bannerCircleLight} />
                <View style={h.bannerTagLight}>
                  <Text style={h.bannerTagLightText}>SUPER SAVINGS 🔥</Text>
                </View>
                <Text style={h.bannerTitle}>
                  {'Best Prices Guaranteed\nDaily Fresh Organic Essentials'}
                </Text>
                <Text style={h.bannerSubLight}>Direct from local farms</Text>
              </LinearGradient>
            </ScrollView>

            {/* Banner Dots */}
            <View style={h.dotsRow}>
              {[0, 1].map((i) => (
                <View
                  key={i}
                  style={[h.dot, activeBanner === i && h.dotActive]}
                />
              ))}
            </View>
          </View>

          {/* Categories Grid (API Response Based) */}
          {categories.length > 0 && (
            <View style={h.section}>
              <View style={h.sectionHeader}>
                <Text style={h.sectionTitle}>Explore Categories 🏷️</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={h.catScroll}
              >
                {categories.map((cat: any, i: number) => (
                  <CategoryItemCard
                    key={cat.id || i}
                    cat={cat}
                    index={i}
                    navigation={navigation}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trending Deals Section */}
          {deals.length > 0 && (
            <View style={h.section}>
              <View style={h.sectionHeader}>
                <Text style={h.sectionTitle}>Trending Deals 🔥</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CategoryProducts', {
                      category: { id: 0, name: 'Deals' },
                    })
                  }
                >
                  <Text style={h.seeAllText}>See All →</Text>
                </TouchableOpacity>
              </View>
              <View style={h.productGrid}>
                {deals.map((item, index) => (
                  <AttractiveProductCard
                    key={item.id}
                    item={item}
                    index={index}
                    cardWidth={cardWidth}
                    qty={getQty(item.id)}
                    imageUri={buildImageUrl(item.image)}
                    discount={getDiscountPercent(item)}
                    onPress={() => openDetail(item.id)}
                    onAdd={() => addToCart(item)}
                    onInc={() => updateQty(item.id, 1)}
                    onDec={() => updateQty(item.id, -1)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Best Sellers Section */}
          {bestsellers.length > 0 && (
            <View style={h.section}>
              <View style={h.sectionHeader}>
                <Text style={h.sectionTitle}>Best Sellers ⭐</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CategoryProducts', {
                      category: { id: 0, name: 'Bestsellers' },
                    })
                  }
                >
                  <Text style={h.seeAllText}>See All →</Text>
                </TouchableOpacity>
              </View>
              <View style={h.productGrid}>
                {bestsellers.map((item, index) => (
                  <AttractiveProductCard
                    key={item.id}
                    item={item}
                    index={index + 8}
                    cardWidth={cardWidth}
                    qty={getQty(item.id)}
                    imageUri={buildImageUrl(item.image)}
                    discount={getDiscountPercent(item)}
                    onPress={() => openDetail(item.id)}
                    onAdd={() => addToCart(item)}
                    onInc={() => updateQty(item.id, 1)}
                    onDec={() => updateQty(item.id, -1)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Remaining All Products Section */}
          {remainingProds.length > 0 && (
            <View style={h.section}>
              <View style={h.sectionHeader}>
                <Text style={h.sectionTitle}>Fresh Products 🍏</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CategoryProducts', {
                      category: { id: 0, name: 'All' },
                    })
                  }
                >
                  <Text style={h.seeAllText}>See All →</Text>
                </TouchableOpacity>
              </View>
              <View style={h.productGrid}>
                {remainingProds.map((item, index) => (
                  <AttractiveProductCard
                    key={item.id}
                    item={item}
                    index={index + 16}
                    cardWidth={cardWidth}
                    qty={getQty(item.id)}
                    imageUri={buildImageUrl(item.image)}
                    discount={getDiscountPercent(item)}
                    onPress={() => openDetail(item.id)}
                    onAdd={() => addToCart(item)}
                    onInc={() => updateQty(item.id, 1)}
                    onDec={() => updateQty(item.id, -1)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Empty State if API returns no items */}
          {products.length === 0 && categories.length === 0 && (
            <View style={h.emptyState}>
              <Text style={h.emptyEmoji}>📦</Text>
              <Text style={h.emptyTitle}>No Products Found</Text>
              <Text style={h.emptySub}>
                Pull down to refresh or try connecting to the server.
              </Text>
              <TouchableOpacity style={h.retryBtn} onPress={loadHomeData}>
                <Text style={h.retryBtnText}>Refresh Data</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* iOS Liquid Glass Floating Cart Footer */}
      {cartCount > 0 && (
        <Animated.View
          entering={ZoomIn.springify()}
          style={h.floatingCartWrapper}
        >
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Cart' as never)}
          >
            <View style={h.liquidGlassPill}>
              <LinearGradient
                colors={['#0C831F', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={h.floatingCartContent}
              >
                <View style={h.floatingCartLeft}>
                  <View style={h.cartCountBadge}>
                    <Text style={h.cartCountText}>{cartCount}</Text>
                  </View>
                  <View>
                    <Text style={h.floatingCartTotalLabel}>CART TOTAL</Text>
                    <Text style={h.floatingCartText}>
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
                <View style={h.floatingCartRight}>
                  <Text style={h.floatingCartPrice}>View Cart</Text>
                  <Text style={h.cartArrow}>→</Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

const h = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBlock: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerAddr: {
    flex: 1,
    marginRight: 12,
  },
  headerDelivery: {
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  deliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    gap: 4,
  },
  deliveryBolt: {
    fontSize: 11,
  },
  deliveryTime: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFE500',
    letterSpacing: 0.6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141414',
    maxWidth: SCREEN_WIDTH * 0.65,
  },
  addressChevron: {
    fontSize: 12,
    color: '#141414',
    marginLeft: 4,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(20, 20, 20, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 20, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141414',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 24, 27, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchPlaceholderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: -0.1,
  },
  searchActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceBadge: {
    backgroundColor: 'rgba(24, 24, 27, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  voiceIcon: {
    fontSize: 13,
  },
  searchDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  scanBadge: {
    backgroundColor: 'rgba(24, 24, 27, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scanIcon: {
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerWrapper: {
    marginTop: 14,
  },
  bannerScroll: {
    paddingHorizontal: H_PADDING,
  },
  bannerDark: {
    backgroundColor: '#18181B',
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 135,
  },
  bannerCircle: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 229, 0, 0.12)',
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 23,
  },
  bannerHighlight: {
    color: '#F59E0B',
  },
  bannerSub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#A1A1AA',
    marginTop: 4,
  },
  bannerGradient: {
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 135,
  },
  bannerCircleLight: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  bannerTagLight: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  bannerTagLightText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerSubLight: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#0C831F',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: H_PADDING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0C831F',
  },
  catScroll: {
    paddingRight: H_PADDING,
    gap: 12,
  },
  catItem: {
    alignItems: 'center',
    width: 72,
  },
  catBox: {
    width: 66,
    height: 66,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 6,
  },
  catImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  catName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#0C831F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingCartWrapper: {
    position: 'absolute',
    bottom: 20,
    left: H_PADDING,
    right: H_PADDING,
  },
  liquidGlassPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 24,
    padding: 5,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartCountBadge: {
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#0C831F',
    fontWeight: '900',
    fontSize: 13,
  },
  floatingCartTotalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  floatingCartText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingCartPrice: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cartArrow: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
})

export default Home
