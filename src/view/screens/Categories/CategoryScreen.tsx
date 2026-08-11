import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Defaults from '../../../config'
import {
  fetchProductsByCategory,
  fetchProductDetail,
  fetchCategories,
  fetchApiCart,
  addToApiCart,
  removeFromApiCart,
  fetchMyWishlist,
  toggleWishlist,
} from '../../../shared/services/main-service'
import Toast from 'react-native-root-toast'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import { useTabBar } from '../../../shared/context/TabBarContext'
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal'
import LinearGradient from 'react-native-linear-gradient'
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg'
import { useTheme } from '../../../shared/context/ThemeContext'

/* ── Inline SVG Icons ─────────────────────────────────────────────────── */
const BackArrowSvgIcon = ({ color = '#0066CC', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const SearchSvgIcon = ({ color = '#0066CC', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Line x1="16.5" y1="16.5" x2="22" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const HeartSvgIcon = ({ color = '#0066CC', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
)

const EmptyBoxSvgIcon = ({ color = '#829AB8', size = 52 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8C21 7.44772 20.5523 7 20 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H20C20.5523 17 21 16.5523 21 16Z" stroke={color} strokeWidth="1.5" />
    <Path d="M3 7L12 2L21 7" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M12 2V7" stroke={color} strokeWidth="1.5" />
    <Path d="M3 7L12 12L21 7" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M12 12V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
)

const CartBarSvgIcon = ({ color = '#0B1B36', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth="2" />
    <Path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const { width: W } = Dimensions.get('window')
const SIDEBAR_WIDTH = 68
const PRODUCT_AREA = W - SIDEBAR_WIDTH
const GUTTER = 8
const CARD_WIDTH = (PRODUCT_AREA - 12 - GUTTER) / 2

type ApiProduct = {
  id: number
  name: string
  description: string
  price: string
  image: string
  images: string[] | null
  product_type: 'simple' | 'variant'
  stock_in_hand: number
  status: 'active' | 'inactive'
  variants: any[]
  [key: string]: any
}

type SortKey = 'default' | 'price_lh' | 'price_hl' | 'stock'

const FILTER_CHIPS = [
  { key: 'default', label: '↕ Sort' },
  { key: 'filter', label: '⚙ Filter' },
  { key: 'stock', label: 'In stock' },
  { key: 'price_lh', label: 'Under ₹50' },
  { key: 'price_hl', label: 'Bestseller' },
]

const CATEGORY_COLORS = [
  'rgba(30, 58, 100, 0.9)', 'rgba(22, 44, 80, 0.9)',
  'rgba(15, 35, 70, 0.9)', 'rgba(20, 40, 80, 0.9)',
  'rgba(25, 50, 90, 0.9)', 'rgba(18, 38, 75, 0.9)',
  'rgba(28, 55, 95, 0.9)', 'rgba(12, 30, 65, 0.9)',
]
const CATEGORY_EMOJIS = ['🥦', '🥚', '🍿', '🥤', '🥐', '🍜', '🧴', '🍪']

const PRODUCT_BG_COLORS = [
  '#FFE0E0', '#FFF4D6', '#E0F0FF', '#E4F6E6',
  '#EBE4FF', '#FFE9E0', '#E0FFE8', '#F4E8FF',
]

import { buildImageUrl, getFallbackImage } from '../../../shared/utils/imageHelper'

const getPriceInfo = (item: ApiProduct) => {
  if (item.product_type === 'variant' && item.variants?.length > 0) {
    const prices = item.variants.map((v: any) => parseFloat(v.Price)).filter((p: number) => !isNaN(p))
    if (prices.length > 0) return { price: Math.min(...prices), isRange: new Set(prices).size > 1 }
  }
  return { price: parseFloat(item.price), isRange: false }
}

const getDiscountPercent = (item: ApiProduct) => {
  const price = parseFloat(item.price) || 0
  const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
  if (mrp > price && price > 0) {
    return Math.round(((mrp - price) / mrp) * 100)
  }
  return 0
}

const ProductCard = React.memo(({
  item, qty, isWished, onAdd, onIncrease, onDecrease, onPress, onToggleWishlist, onBuy, index,
}: {
  item: ApiProduct; qty: number; isWished: boolean; index: number
  onAdd: (id: number) => void; onIncrease: (id: number) => void
  onDecrease: (id: number) => void; onPress: (id: number) => void
  onToggleWishlist: (id: number) => void
  onBuy: (id: number) => void
}) => {
  const { isDark, colors } = useTheme()
  const initialImg = buildImageUrl(item.image, item.name, 'product')
  const [imgSrc, setImgSrc] = useState(initialImg)

  useEffect(() => {
    setImgSrc(buildImageUrl(item.image, item.name, 'product'))
  }, [item.image, item.name])

  const inStock = (item.stock_in_hand ?? 1) > 0
  const { price } = getPriceInfo(item)
  const discount = getDiscountPercent(item)
  const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
  const bgColor = isDark ? 'rgba(30, 58, 100, 0.6)' : PRODUCT_BG_COLORS[index % 8]

  return (
    <View style={[card.root, { width: CARD_WIDTH, backgroundColor: isDark ? 'rgba(11, 27, 54, 0.96)' : '#FFFFFF', borderColor: isDark ? 'rgba(251, 191, 36, 0.2)' : '#E2E8F0' }]}>
      <View style={{ position: 'relative' }}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item.id)}>
          <View style={[card.imgBox, { backgroundColor: bgColor }]}>
            {discount > 0 && (
              <View style={card.discountBadge}>
                <Text style={card.discountText}>{discount}% OFF</Text>
              </View>
            )}
            <Image
              source={{ uri: imgSrc }}
              style={card.img}
              resizeMode="cover"
              onError={() => {
                const fallback = getFallbackImage(item.name, 'product')
                if (imgSrc !== fallback) {
                  setImgSrc(fallback)
                }
              }}
            />
            {!inStock && (
              <View style={card.oosOverlay}>
                <Text style={card.oosLabel}>Out of Stock</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {/* Wishlist overlay */}
        <TouchableOpacity
          style={[card.heartBtn, { backgroundColor: isDark ? 'rgba(7, 18, 36, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}
          onPress={() => onToggleWishlist(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[card.heartIcon, isWished && card.heartIconActive]}>
            {isWished ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[card.name, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[card.unit, { color: colors.textSecondary }]}>{item.unit || item.weight || 'per unit'}</Text>
      <View style={card.footer}>
        <View>
          <Text style={[card.price, { color: isDark ? '#FBBF24' : colors.textPrimary }]}>₹{price.toLocaleString('en-IN')}</Text>
          {mrp > price && (
            <Text style={[card.mrp, { color: colors.textMuted }]}>₹{mrp.toLocaleString('en-IN')}</Text>
          )}
        </View>
        {inStock ? (
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {qty === 0 ? (
              <TouchableOpacity style={[card.addBtn, { backgroundColor: isDark ? '#FBBF24' : '#0B1B36', borderColor: isDark ? '#FBBF24' : '#0B1B36' }]} onPress={() => onAdd(item.id)} activeOpacity={0.82}>
                <Text style={[card.addTxt, { color: isDark ? '#0B1B36' : '#FBBF24' }]}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={[card.stepper, { backgroundColor: colors.accent }]}>
                <TouchableOpacity style={card.stepBtn} onPress={() => onDecrease(item.id)}>
                  <Text style={[card.stepTxt, { color: colors.accentText }]}>−</Text>
                </TouchableOpacity>
                <Text style={[card.stepQty, { color: colors.accentText }]}>{qty}</Text>
                <TouchableOpacity style={card.stepBtn} onPress={() => onIncrease(item.id)}>
                  <Text style={[card.stepTxt, { color: colors.accentText }]}>+</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={[card.addBtn, { backgroundColor: '#FBBF24', borderColor: '#FBBF24' }]} onPress={() => onBuy(item.id)} activeOpacity={0.82}>
              <Text style={[card.addTxt, { color: '#0B1B36' }]}>BUY</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[card.notifyBtn, { borderColor: colors.accent }]}>
            <Text style={[card.notifyTxt, { color: colors.accent }]}>NOTIFY</Text>
          </View>
        )}
      </View>
    </View>
  )
})

const CategoryScreen = () => {
  const { isDark, colors } = useTheme()
  const navigation = useNavigation<any>()
  const { showTabBar } = useTabBar()

  const [allCategories, setAllCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<any | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [sort, setSort] = useState<SortKey>('default')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set())

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ApiProductDetail | null>(null)

  useFocusEffect(
    useCallback(() => {
      showTabBar()
      loadCategories()
      loadCart()
      loadWishlist()
    }, []),
  )

  useEffect(() => {
    if (activeCategory) loadProducts()
  }, [activeCategory?.id, activeCategory?.name])

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories()
      const filtered = cats.filter((c: any) => c.status !== false)
      setAllCategories(filtered)
      // Select first category
      setActiveCategory((prev: any) => prev ?? filtered[0] ?? null)
    } catch {
      // Ignore empty state
    }
  }

  const loadProducts = async () => {
    if (!activeCategory) return
    setLoadingProducts(true)
    try {
      const data = await fetchProductsByCategory(activeCategory.id, activeCategory.name)
      setProducts(data)
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadCart = async () => {
    try {
      const raw = await fetchApiCart()
      if (raw) {
        const mapped = raw.map((rawItem: any) => {
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
          }
        })
        setCartItems(mapped)
        await setAsyncData('cart_items', mapped as any)
      }
    } catch (e) {
      console.log('CategoryScreen loadCart error:', e)
      const stored = (await getAsyncData('cart_items')) || []
      setCartItems(Array.isArray(stored) ? stored : [])
    }
  }

  const loadWishlist = async () => {
    try {
      const dataList = await fetchMyWishlist()
      if (dataList) {
        const ids = dataList.map((item: any) => {
          const product = item.product ?? item.Product ?? item
          return product.id ?? product.Id ?? item.product_id ?? item.ProductId
        })
        setWishlistProductIds(new Set(ids))
      }
    } catch (e) {
      console.log('CategoryScreen loadWishlist error:', e)
    }
  }

  const toggleWish = useCallback(async (id: number) => {
    const isWished = wishlistProductIds.has(id)
    
    // Optimistic update
    setWishlistProductIds(prev => {
      const next = new Set(prev)
      if (isWished) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

    const success = await toggleWishlist(id, isWished)
    if (success) {
      Toast.show(isWished ? 'Removed from wishlist' : 'Added to wishlist ♥', { duration: Toast.durations.SHORT })
      loadWishlist()
    } else {
      // Revert update
      setWishlistProductIds(prev => {
        const next = new Set(prev)
        if (isWished) {
          next.add(id)
        } else {
          next.delete(id)
        }
        return next
      })
      Toast.show('Failed to update wishlist', { duration: Toast.durations.SHORT })
    }
  }, [wishlistProductIds])

  const openDetail = useCallback(async (id: number) => {
    setDetailVisible(true)
    setDetailLoading(true)
    setDetailProduct(null)
    const data = await fetchProductDetail(id)
    setDetailProduct(data)
    setDetailLoading(false)
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    switch (sort) {
      case 'price_lh': list.sort((a, b) => getPriceInfo(a).price - getPriceInfo(b).price); break
      case 'price_hl': list.sort((a, b) => getPriceInfo(b).price - getPriceInfo(a).price); break
      case 'stock': list.sort((a, b) => b.stock_in_hand - a.stock_in_hand); break
    }
    return list
  }, [products, sort])

  const getQty = (id: number) => cartItems.find(i => i.id === id)?.quantity || 0

  const addToCart = useCallback(async (id: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const updated = [...cartItems, { ...product, quantity: 1, points: parseFloat(product.price) || 0 }]
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)

    const success = await addToApiCart(id, 1)
    if (success) {
      await loadCart()
    } else {
      const stored = (await getAsyncData('cart_items')) || []
      setCartItems(Array.isArray(stored) ? stored : [])
    }
  }, [cartItems, products])

  const handleBuy = useCallback(async (id: number) => {
    const qty = getQty(id)
    if (qty === 0) {
      await addToCart(id)
    }
    navigation.navigate('PlaceOrder')
  }, [cartItems, addToCart])

  const increase = useCallback(async (id: number) => {
    const updated = cartItems.map(i => i.id === id ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)

    const success = await addToApiCart(id, 1)
    if (success) {
      await loadCart()
    } else {
      const stored = (await getAsyncData('cart_items')) || []
      setCartItems(Array.isArray(stored) ? stored : [])
    }
  }, [cartItems])

  const decrease = useCallback(async (id: number) => {
    const item = cartItems.find(i => i.id === id)
    if (!item) return
    const cartItemId = item.cartItemId

    const updated = cartItems
      .map(i => i.id === id ? { ...i, quantity: (i.quantity || 1) - 1 } : i)
      .filter(i => (i.quantity || 0) > 0)
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)

    let success = false
    if ((item.quantity || 1) <= 1) {
      if (cartItemId) {
        success = await removeFromApiCart(cartItemId)
      } else {
        const raw = await fetchApiCart()
        const match = raw?.find((r: any) => (r.product?.id ?? r.product_id) === id)
        if (match?.id) {
          success = await removeFromApiCart(match.id)
        }
      }
    } else {
      success = await addToApiCart(id, -1)
    }

    if (success) {
      await loadCart()
    } else {
      const stored = (await getAsyncData('cart_items')) || []
      setCartItems(Array.isArray(stored) ? stored : [])
    }
  }, [cartItems])

  const cartCount = useMemo(() => cartItems.reduce((s, i) => s + (i.quantity || 1), 0), [cartItems])
  const cartTotal = useMemo(
    () => cartItems.reduce((s, i) => s + (i.points || 0) * (i.quantity || 1), 0),
    [cartItems],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: ApiProduct; index: number }) => (
      <ProductCard
        item={item}
        qty={getQty(item.id)}
        isWished={wishlistProductIds.has(item.id)}
        onAdd={addToCart}
        onIncrease={increase}
        onDecrease={decrease}
        onPress={openDetail}
        onToggleWishlist={toggleWish}
        onBuy={handleBuy}
        index={index}
      />
    ),
    [cartItems, wishlistProductIds, addToCart, increase, decrease, openDetail, toggleWish, handleBuy],
  )

  return (
    <LinearGradient
      colors={isDark ? ['#071224', '#0B1B36', '#071224'] : ['#F7F9FC', '#EEF2F7', '#F7F9FC']}
      locations={[0, 0.5, 1]}
      style={s.root}
    >
      <StatusBar backgroundColor={colors.statusBarBg} barStyle={colors.statusBarStyle} />
      <SafeAreaView style={s.safe} edges={[]}>
        <ApiProductDetailModal
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
          productDetail={detailProduct}
          loading={detailLoading}
          qty={detailProduct ? getQty(detailProduct.id) : 0}
          onAdd={addToCart}
          onIncrease={increase}
          onDecrease={decrease}
          related={filtered}
          onSelectRelated={openDetail}
          onViewCart={() => navigation.navigate('Cart')}
        />

        {/* Header */}
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <View style={s.headerTop}>
            <TouchableOpacity
              style={[s.backBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              activeOpacity={0.8}
            >
              <BackArrowSvgIcon color="#0B1B36" size={20} />
            </TouchableOpacity>
            <View style={s.headerInfo}>
              <Text style={[s.headerTitle, { color: '#0B1B36' }]} numberOfLines={1}>
                {activeCategory?.name || 'Categories'}
              </Text>
              <Text style={[s.headerSub, { color: '#64748B' }]}>⚡ Delivery in 8 min</Text>
            </View>
            <TouchableOpacity style={[s.searchBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
              <SearchSvgIcon color="#0B1B36" size={18} />
            </TouchableOpacity>
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
          >
            {FILTER_CHIPS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  s.chip,
                  { backgroundColor: colors.chip, borderColor: colors.chipBorder },
                  sort === opt.key && { backgroundColor: colors.chipActive, borderColor: colors.chipActive },
                ]}
                onPress={() => setSort(opt.key as SortKey)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    s.chipTxt,
                    { color: colors.chipText },
                    sort === opt.key && { color: colors.chipActiveText },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        {/* Sidebar and Products */}
        <View style={s.contentRow}>
          {/* Category sidebar */}
          <ScrollView
            style={[s.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.sidebarBorder }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.sidebarContent}
          >
            {allCategories.map((cat, idx) => {
              const isActive = cat.id === activeCategory?.id
              const imageUri = cat.image ? buildImageUrl(cat.image) : null
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.sidebarItem, isActive && { backgroundColor: colors.sidebarActive, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.75}
                >
                  {isActive && <View style={[s.sidebarIndicator, { backgroundColor: colors.sidebarIndicator }]} />}
                  <View style={[s.sidebarIcon, { backgroundColor: isDark ? CATEGORY_COLORS[idx % 8] : '#F1F5F9', borderColor: colors.sidebarIconBorder }]}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={s.sidebarImage} resizeMode="cover" />
                    ) : (
                      <Text style={s.sidebarEmoji}>{CATEGORY_EMOJIS[idx % 8]}</Text>
                    )}
                  </View>
                  <Text
                    style={[s.sidebarLabel, { color: isActive ? colors.sidebarLabelActive : colors.sidebarLabel }]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Product grid */}
          <View style={s.productArea}>
            {loadingProducts ? (
              <View style={s.center}>
                <ActivityIndicator size="large" color="#0C831F" />
                <Text style={s.loadingText}>Loading products…</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={item => String(item.id)}
                numColumns={2}
                renderItem={renderItem}
                contentContainerStyle={s.grid}
                columnWrapperStyle={{ gap: GUTTER }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={s.empty}>
                    <View style={[s.emptyIcon, { backgroundColor: colors.emptyIconBg, borderColor: colors.border }]}>
                      <EmptyBoxSvgIcon color={colors.textSecondary} size={52} />
                    </View>
                    <Text style={[s.emptyTitle, { color: colors.emptyTitle }]}>Stocking up soon</Text>
                    <Text style={[s.emptySub, { color: colors.emptySubtitle }]}>
                      No items in {activeCategory?.name || 'this category'} right now.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>

        {/* Cart bar */}
        {cartCount > 0 && (
          <TouchableOpacity
            style={[s.cartBar, { backgroundColor: isDark ? '#FBBF24' : '#0B1B36' }]}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.92}
          >
            <View style={s.cartBarLeft}>
              <CartBarSvgIcon color={isDark ? '#0B1B36' : '#FBBF24'} size={18} />
              <View>
                <Text style={[s.cartItems, { color: isDark ? '#0B1B36' : '#FFFFFF' }]}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
                <Text style={[s.cartTotal, { color: isDark ? '#0B1B36' : '#FBBF24' }]}>₹{cartTotal.toLocaleString('en-IN')}</Text>
              </View>
            </View>
            <View style={s.cartCta}>
              <Text style={[s.cartCtaText, { color: isDark ? '#0B1B36' : '#FBBF24' }]}>View cart</Text>
              <Text style={[s.cartArrow, { color: isDark ? '#0B1B36' : '#FBBF24' }]}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Wishlist bar */}
        {wishlistProductIds.size > 0 && (
          <TouchableOpacity
            style={[s.wishlistBar, { bottom: cartCount > 0 ? 142 : 78 }]}
            onPress={() => navigation.navigate('WishList')}
            activeOpacity={0.92}
          >
            <View style={s.wishlistLeft}>
              <HeartSvgIcon color="#FF6B6B" size={16} />
              <Text style={s.wishlistText}>
                {wishlistProductIds.size} item{wishlistProductIds.size > 1 ? 's' : ''} in wishlist
              </Text>
            </View>
            <View style={s.wishlistCta}>
              <Text style={s.wishlistCtaText}>View wishlist</Text>
              <Text style={s.wishlistArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 19,
    color: '#FFFFFF',
  },
  headerSub: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11.5,
    color: '#FBBF24',
    marginTop: 2,
  },
  searchBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  chipRow: { paddingHorizontal: 16, paddingBottom: 11, gap: 8 },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: '#ffff00', borderColor: '#ffff00' },
  chipTxt: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#829AB8' },
  chipTxtActive: { color: '#0B1B36' },

  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: 'rgba(7, 18, 36, 0.98)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(251, 191, 36, 0.15)',
  },
  sidebarContent: {
    paddingVertical: 8,
    paddingBottom: 120,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  sidebarIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3.5,
    backgroundColor: '#FBBF24',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sidebarIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  sidebarImage: {
    width: 44,
    height: 44,
  },
  sidebarEmoji: {
    fontSize: 22,
  },
  sidebarLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9.5,
    color: '#829AB8',
    textAlign: 'center',
    lineHeight: 11.5,
    maxWidth: 60,
  },
  sidebarLabelActive: {
    color: '#FBBF24',
    fontWeight: '800',
  },

  productArea: {
    flex: 1,
  },

  grid: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 170, gap: GUTTER },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#829AB8', fontFamily: 'DMSans-Regular' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIcon: {
    width: 84,
    height: 84,
    backgroundColor: 'rgba(130, 154, 184, 0.1)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(130, 154, 184, 0.2)',
  },
  emptyTitle: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#FFFFFF', marginTop: 18 },
  emptySub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#829AB8',
    textAlign: 'center',
    marginTop: 5,
  },

  cartBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 78,
    height: 58,
    backgroundColor: '#FBBF24',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartItems: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#0B1B36' },
  cartTotal: { fontFamily: 'DMSans-Bold', fontSize: 15.5, color: '#0B1B36' },
  cartCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartCtaText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#0B1B36' },
  cartArrow: { fontSize: 17, color: '#0B1B36' },

  wishlistBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 52,
    backgroundColor: 'rgba(11, 27, 54, 0.97)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  wishlistLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wishlistText: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#FFFFFF' },
  wishlistCta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  wishlistCtaText: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#FBBF24' },
  wishlistArrow: { fontSize: 16, color: '#FBBF24' },
})

const card = StyleSheet.create({
  root: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 16,
    padding: 8,
  },
  imgBox: {
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#141414',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 1,
  },
  discountText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#FFE000',
  },
  img: { width: '100%', height: '100%' },
  fallback: {
    fontSize: 32,
    fontFamily: 'DMSans-Bold',
    color: 'rgba(0,0,0,0.12)',
  },
  oosOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(244,245,240,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  oosLabel: { fontFamily: 'DMSans-Bold', fontSize: 11, color: '#C0392B' },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  heartIcon: {
    fontSize: 17,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
  heartIconActive: {
    color: '#FF4757',
  },
  name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#141414',
    marginTop: 6,
    lineHeight: 15,
    height: 30,
  },
  unit: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10.5,
    color: '#8a8a8a',
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#141414' },
  mrp: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: '#9a9a9a',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#0C831F',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  addTxt: { fontFamily: 'DMSans-Bold', fontSize: 12, color: '#0C831F' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C831F',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepBtn: { width: 24, height: 28, justifyContent: 'center', alignItems: 'center' },
  stepTxt: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
  stepQty: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 13, minWidth: 12, textAlign: 'center' },
  notifyBtn: {
    borderWidth: 1.5,
    borderColor: '#0C831F',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  notifyTxt: { fontFamily: 'DMSans-Bold', fontSize: 9, color: '#0C831F' },
})

export default CategoryScreen
