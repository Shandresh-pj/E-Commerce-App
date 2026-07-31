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
} from '../../../shared/services/main-service'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import { useTabBar } from '../../../shared/context/TabBarContext'
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal'
import LinearGradient from 'react-native-linear-gradient'

const { width: W } = Dimensions.get('window')
const SIDEBAR_WIDTH = 0
const PRODUCT_AREA = W - SIDEBAR_WIDTH
const GUTTER = 10
const CARD_WIDTH = (PRODUCT_AREA - 24 - GUTTER) / 2

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
  '#E4F6E6', '#FFF4D6', '#FFE9E0', '#E0F0FF',
  '#EBE4FF', '#FFF0D6', '#E0FFE8', '#F4E8FF',
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
  item, qty, onAdd, onIncrease, onDecrease, onPress, index,
}: {
  item: ApiProduct; qty: number; index: number
  onAdd: (id: number) => void; onIncrease: (id: number) => void
  onDecrease: (id: number) => void; onPress: (id: number) => void
}) => {
  const [imgError, setImgError] = useState(false)
  const inStock = item.stock_in_hand > 0
  const { price } = getPriceInfo(item)
  const imageUri = buildImageUrl(item.image)
  const discount = getDiscountPercent(item)
  const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
  const bgColor = PRODUCT_BG_COLORS[index % 8]

  return (
    <View style={[card.root, { width: CARD_WIDTH }]}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item.id)}>
        <View style={[card.imgBox, { backgroundColor: bgColor }]}>
          {discount > 0 && (
            <View style={card.discountBadge}>
              <Text style={card.discountText}>{discount}% OFF</Text>
            </View>
          )}
          {imageUri && !imgError ? (
            <Image source={{ uri: imageUri }} style={card.img} resizeMode="contain" onError={() => setImgError(true)} />
          ) : (
            <Text style={card.fallback}>
              {item.name ? item.name[0].toUpperCase() : '📦'}
            </Text>
          )}
          {!inStock && (
            <View style={card.oosOverlay}>
              <Text style={card.oosLabel}>Out of Stock</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Text style={card.name} numberOfLines={2}>{item.name}</Text>
      <Text style={card.unit}>{item.unit || item.weight || 'per unit'}</Text>
      <View style={card.footer}>
        <View>
          <Text style={card.price}>₹{price.toLocaleString('en-IN')}</Text>
          {mrp > price && (
            <Text style={card.mrp}>₹{mrp.toLocaleString('en-IN')}</Text>
          )}
        </View>
        {inStock ? (
          qty === 0 ? (
            <TouchableOpacity style={card.addBtn} onPress={() => onAdd(item.id)} activeOpacity={0.82}>
              <Text style={card.addTxt}>ADD</Text>    
            </TouchableOpacity>
          ) : (
            <View style={card.stepper}>
              <TouchableOpacity style={card.stepBtn} onPress={() => onDecrease(item.id)}>
                <Text style={card.stepTxt}>−</Text>
              </TouchableOpacity>
              <Text style={card.stepQty}>{qty}</Text>
              <TouchableOpacity style={card.stepBtn} onPress={() => onIncrease(item.id)}>
                <Text style={card.stepTxt}>+</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={card.notifyBtn}>
            <Text style={card.notifyTxt}>NOTIFY</Text>
          </View>
        )}
      </View>
    </View>
  )
})

const CategoryScreen = () => {
  const navigation = useNavigation<any>()
  const { showTabBar } = useTabBar()

  const [allCategories, setAllCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<any | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [sort, setSort] = useState<SortKey>('default')
  const [cartItems, setCartItems] = useState<any[]>([])

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ApiProductDetail | null>(null)

  useFocusEffect(
    useCallback(() => {
      showTabBar()
      loadCategories()
      loadCart()
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
      // Auto-select the first category as the active rail item
      setActiveCategory(prev => prev ?? filtered[0] ?? null)
    } catch {
      // ignore — empty state handles it
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
    const existing = cartItems.find(i => i.id === id)
    let updated
    if (existing) {
      updated = cartItems.map(i => i.id === id ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
    } else {
      updated = [...cartItems, { ...product, quantity: 1, points: parseFloat(product.price) || 0 }]
    }
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
        onAdd={addToCart}
        onIncrease={increase}
        onDecrease={decrease}
        onPress={openDetail}
        index={index}
      />
    ),
    [cartItems, addToCart, increase, decrease, openDetail],
  )

  return (
    <LinearGradient
      colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']}
      locations={[0, 0.4, 1]}
      style={s.root}
    >
      <StatusBar backgroundColor="rgba(255,255,255,0.55)" barStyle="dark-content" />
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
        <View style={s.header}>
          <View style={s.headerTop}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.canGoBack() && navigation.goBack()}
            >
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={s.headerInfo}>
              <Text style={s.headerTitle} numberOfLines={1}>
                {activeCategory?.name || 'Categories'}
              </Text>
              <Text style={s.headerSub}>⚡ Delivery in 8 min</Text>
            </View>
            <TouchableOpacity style={s.searchBtn} onPress={() => navigation.navigate('Search')}>
              <Text style={{ fontSize: 16 }}>🔎</Text>
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
                style={[s.chip, sort === opt.key && s.chipActive]}
                onPress={() => setSort(opt.key as SortKey)}
                activeOpacity={0.75}
              >
                <Text style={[s.chipTxt, sort === opt.key && s.chipTxtActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content: Sidebar + Products */}
        <View style={s.contentRow}>
          {/* Left Category Sidebar */}
          <ScrollView
            style={s.sidebar}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.sidebarContent}
          >
            {allCategories.map((cat, idx) => {
              const isActive = cat.id === activeCategory?.id
              const imageUri = cat.image ? buildImageUrl(cat.image) : null
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.sidebarItem, isActive && s.sidebarItemActive]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.75}
                >
                  {isActive && <View style={s.sidebarIndicator} />}
                  <View style={[s.sidebarIcon, { backgroundColor: CATEGORY_COLORS[idx % 8] }]}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={s.sidebarImage} resizeMode="cover" />
                    ) : (
                      <Text style={s.sidebarEmoji}>{CATEGORY_EMOJIS[idx % 8]}</Text>
                    )}
                  </View>
                  <Text
                    style={[s.sidebarLabel, isActive && s.sidebarLabelActive]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Right Product Grid */}
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
                    <View style={s.emptyIcon}>
                      <Text style={{ fontSize: 42 }}>🧺</Text>
                    </View>
                    <Text style={s.emptyTitle}>Stocking up soon</Text>
                    <Text style={s.emptySub}>
                      No items in {activeCategory?.name || 'this category'} right now.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>

        {/* Floating Cart Bar */}
        {cartCount > 0 && (
          <TouchableOpacity
            style={s.cartBar}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.92}
          >
            <View>
              <Text style={s.cartItems}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
              <Text style={s.cartTotal}>₹{cartTotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={s.cartCta}>
              <Text style={s.cartCtaText}>View cart</Text>
              <Text style={s.cartArrow}>→</Text>
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
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEA',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 17, color: '#141414' },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 19,
    color: '#141414',
  },
  headerSub: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11.5,
    color: '#0C831F',
    marginTop: 2,
  },
  searchBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  chipRow: { paddingHorizontal: 16, paddingBottom: 11, gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: '#141414', borderColor: '#141414' },
  chipTxt: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#333' },
  chipTxtActive: { color: '#fff' },

  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRightWidth: 1,
    borderRightColor: '#ECECEA',
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
    backgroundColor: 'rgba(255,224,0,0.16)',
  },
  sidebarIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: '#FFE000',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sidebarIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  sidebarImage: {
    width: 50,
    height: 50,
  },
  sidebarEmoji: {
    fontSize: 24,
  },
  sidebarLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#8a8a8a',
    textAlign: 'center',
    lineHeight: 12,
    maxWidth: 70,
  },
  sidebarLabelActive: {
    color: '#141414',
  },

  productArea: {
    flex: 1,
  },

  grid: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 170, gap: GUTTER },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B6B6B', fontFamily: 'DMSans-Regular' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIcon: {
    width: 84,
    height: 84,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: 'DMSans-Bold', fontSize: 18, color: '#141414', marginTop: 18 },
  emptySub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 5,
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
  cartItems: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#fff' },
  cartTotal: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#fff' },
  cartCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartCtaText: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#fff' },
  cartArrow: { fontSize: 17, color: '#fff' },
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
    paddingHorizontal: 14,
    paddingVertical: 6,
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
