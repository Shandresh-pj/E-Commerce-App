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
import Svg, { Path, Circle, Rect, G, Polyline, Line } from 'react-native-svg'

/* ── Inline SVG Icons ─────────────────────────────────────────────────── */
const SearchSvgIcon = ({ color = '#0066CC', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Line x1="16.5" y1="16.5" x2="22" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const MicSvgIcon = ({ color = '#0066CC', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M5 10C5 13.866 8.13401 17 12 17C15.866 17 19 13.866 19 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="22" x2="16" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const CameraSvgIcon = ({ color = '#0066CC', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
)

const LocationPinSvgIcon = ({ color = '#0066CC', size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21C16 17.5 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17.5 12 21Z" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
)

const ChevronDownSvgIcon = ({ color = '#0066CC', size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const CartFloatSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth="2" />
    <Path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const CategorySvgIcon = ({ color = '#0066CC', size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
  </Svg>
)
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
import { useTheme } from '../../../shared/context/ThemeContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const H_PADDING = 16
const GRID_GAP = 12
const BANNER_W = SCREEN_WIDTH - 2 * H_PADDING - 24
const BANNER_GAP = 12
const BANNER_SNAP = BANNER_W + BANNER_GAP

const CATEGORY_COLORS = [
  { bg: 'rgba(30, 58, 100, 0.9)', border: 'rgba(251,191,36,0.3)' },
  { bg: 'rgba(22, 44, 80, 0.9)', border: 'rgba(251,191,36,0.25)' },
  { bg: 'rgba(15, 35, 70, 0.9)', border: 'rgba(251,191,36,0.2)' },
  { bg: 'rgba(20, 40, 80, 0.9)', border: 'rgba(251,191,36,0.28)' },
  { bg: 'rgba(25, 50, 90, 0.9)', border: 'rgba(251,191,36,0.22)' },
  { bg: 'rgba(18, 38, 75, 0.9)', border: 'rgba(251,191,36,0.26)' },
]

const CategoryItemCard = ({ cat, index, navigation }: any) => {
  const { isDark, colors } = useTheme()
  const colorConfig = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  const initialUri = buildImageUrl(cat.image, cat.name, 'category')
  const [imgSrc, setImgSrc] = useState(initialUri)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgSrc(buildImageUrl(cat.image, cat.name, 'category'))
    setImgFailed(false)
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
              backgroundColor: isDark ? colorConfig.bg : '#F1F5F9',
              borderColor: isDark ? colorConfig.border : '#E2E8F0',
            },
          ]}
        >
          {!imgFailed ? (
            <Image
              source={{ uri: imgSrc }}
              style={h.catImg}
              resizeMode="cover"
              onError={() => {
                const fallback = getFallbackImage(cat.name, 'category')
                if (imgSrc !== fallback && fallback) {
                  setImgSrc(fallback)
                } else {
                  setImgFailed(true)
                }
              }}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <CategorySvgIcon color={isDark ? '#ffff00' : '#0B1B36'} size={24} />
            </View>
          )}
        </View>
        <Text style={[h.catName, { color: colors.textPrimary }]} numberOfLines={1}>
          {cat.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

function Home({ navigation }: any) {
  const { isDark, colors } = useTheme()
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
    <View style={[h.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.statusBarBg}
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

      {/* Signature Yellow Brand Header */}
      <LinearGradient
        colors={['#ffff00', '#ffff00']}
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
                colors={['rgba(11, 27, 54, 0.12)', 'rgba(11, 27, 54, 0.18)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={h.deliveryPill}
              >
                <Text style={h.deliveryBolt}>⚡</Text>
                <Text style={[h.deliveryTime, { color: '#0B1B36' }]}>8 MIN EXPRESS</Text>
              </LinearGradient>
            </Animated.View>
            <View style={h.addressRow}>
              <LocationPinSvgIcon color="#0B1B36" size={14} />
              <Text style={[h.addressText, { color: '#0B1B36' }]} numberOfLines={1}>
                {address}
              </Text>
              <ChevronDownSvgIcon color="#0B1B36" size={12} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[h.profileBtn, { backgroundColor: '#0B1B36', borderColor: 'rgba(11, 27, 54, 0.3)' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Text style={[h.profileBtnText, { color: '#ffff00' }]}>{userInitial}</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Search Bar */}
        <TouchableOpacity
          style={[h.searchBar, { backgroundColor: '#FFFFFF', borderColor: 'rgba(11, 27, 54, 0.18)' }]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <View style={h.searchIconBadge}>
            <SearchSvgIcon color="#0B1B36" size={17} />
          </View>
          <View style={h.searchPlaceholderContainer}>
            <Text style={[h.searchPlaceholder, { color: '#475569' }]} numberOfLines={1}>
              {SEARCH_HINTS[hintIndex]}
            </Text>
          </View>
          <View style={h.searchActionGroup}>
            <View style={[h.voiceBadge, { backgroundColor: 'rgba(11, 27, 54, 0.07)', borderColor: 'rgba(11, 27, 54, 0.12)' }]}>
              <MicSvgIcon color="#0B1B36" size={15} />
            </View>
            <View style={h.searchDivider} />
            <View style={[h.scanBadge, { backgroundColor: 'rgba(11, 27, 54, 0.07)', borderColor: 'rgba(11, 27, 54, 0.12)' }]}>
              <CameraSvgIcon color="#0B1B36" size={15} />
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

          {/* Categories Grid */}
          {categories.length > 0 && (
            <View style={h.section}>
              <View style={h.sectionHeader}>
                <Text style={[h.sectionTitle, { color: colors.textPrimary }]}>Explore Categories 🏷️</Text>
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
                <Text style={[h.sectionTitle, { color: colors.textPrimary }]}>Trending Deals 🔥</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CategoryProducts', {
                      category: { id: 0, name: 'Deals' },
                    })
                  }
                >
                  <Text style={[h.seeAllText, { color: colors.accent }]}>See All →</Text>
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
                <Text style={[h.sectionTitle, { color: colors.textPrimary }]}>Best Sellers ⭐</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CategoryProducts', {
                      category: { id: 0, name: 'Bestsellers' },
                    })
                  }
                >
                  <Text style={[h.seeAllText, { color: colors.accent }]}>See All →</Text>
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
                <Text style={[h.sectionTitle, { color: colors.textPrimary }]}>Fresh Products 🍏</Text>
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

      {/* Floating Cart Footer */}
      {cartCount > 0 && (
        <Animated.View
          entering={ZoomIn.springify()}
          style={[h.floatingCartWrapper, { bottom: 78 }]}
        >
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Cart' as never)}
          >
            <View style={[h.liquidGlassPill, { backgroundColor: isDark ? '#0B1B36' : '#0B1B36', borderColor: colors.accent }]}>
              <LinearGradient
                colors={isDark ? ['#0B1B36', '#0D2044'] : ['#0B1B36', '#1E3A8A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={h.floatingCartContent}
              >
                <View style={h.floatingCartLeft}>
                  <View style={[h.cartCountBadge, { backgroundColor: colors.accent }]}>
                    <Text style={[h.cartCountText, { color: colors.accentText }]}>{cartCount}</Text>
                  </View>
                  <View>
                    <Text style={[h.floatingCartTotalLabel, { color: '#829AB8' }]}>CART TOTAL</Text>
                    <Text style={[h.floatingCartText, { color: '#ffff00' }]}>
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
                <View style={h.floatingCartRight}>
                  <Text style={[h.floatingCartPrice, { color: '#ffff00' }]}>View Cart</Text>
                  <Text style={[h.cartArrow, { color: '#ffff00' }]}>→</Text>
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
    backgroundColor: '#071224',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071224',
  },
  headerBlock: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
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
    color: '#ffff00',
    letterSpacing: 0.6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffff00',
    borderWidth: 2,
    borderColor: '#ffff00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  profileBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B1B36',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchPlaceholderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 13,
    fontWeight: '600',
    color: '#829AB8',
    letterSpacing: -0.1,
  },
  searchActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  searchDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(130, 154, 184, 0.25)',
  },
  scanBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
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
    backgroundColor: '#ffff00',
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffff00',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffff00',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffff00',
    lineHeight: 23,
  },
  bannerHighlight: {
    color: '#ffff00',
  },
  bannerSub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#ffff00',
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
    backgroundColor: '#ffff00',
  },
  bannerTagLight: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffff00',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  bannerTagLightText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#030303ff',
    letterSpacing: 0.5,
  },
  bannerSubLight: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
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
    backgroundColor: '#000000ff',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#ffff00',
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
    color: '#000000ff',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffff00',
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
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 6,
  },
  catImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0a0a0aff',
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
    color: '#000000ff',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#ffff00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#ffff00',
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
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderWidth: 1.5,
    borderColor: '#ffff00',
    borderRadius: 24,
    padding: 5,
    shadowColor: '#ffff00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  floatingCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffff00',
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartCountBadge: {
    backgroundColor: '#0B1B36',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#ffff00',
    fontWeight: '900',
    fontSize: 13,
  },
  floatingCartTotalLabel: {
    color: 'rgba(11, 27, 54, 0.75)',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  floatingCartText: {
    color: '#0B1B36',
    fontWeight: '900',
    fontSize: 15,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingCartPrice: {
    color: '#0B1B36',
    fontWeight: '700',
    fontSize: 14,
  },
  cartArrow: {
    color: '#0B1B36',
    fontWeight: '900',
    fontSize: 17,
  },
})

export default Home
