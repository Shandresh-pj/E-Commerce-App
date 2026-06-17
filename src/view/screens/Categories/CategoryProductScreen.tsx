import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'
import { useResponsive } from '../../assets/styles/responsive'
import Defaults from '../../../config'
import { fetchProductDetail, fetchProductsByCategory } from '../../../shared/services/main-service'
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal'

const GUTTER = 12

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiProductVariant = {
  Id: number
  CompanyId: number
  ProductId: number
  Barcode: string
  Price: string
  Stock: number
  ProductAttributeId: number
  ProductAttributeValueId: number
  CreatedAt: string
  UpdatedAt: string
}

type ApiProduct = {
  id: number
  name: string
  description: string
  price: string
  barcode: string
  image: string
  images: string[] | null
  video?: string | null
  registration_id: number
  category: string
  product_type: 'simple' | 'variant'
  stock_in_hand: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  creator?: unknown
  variants: ApiProductVariant[]
}

type SortKey = 'default' | 'price_lh' | 'price_hl' | 'stock'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default',  label: 'Relevance' },
  { key: 'price_lh', label: 'Price: Low → High' },
  { key: 'price_hl', label: 'Price: High → Low' },
  { key: 'stock',    label: 'In Stock First' },
]

type CartState = Record<number, number>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  const cleaned = imagePath.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http')
    ? cleaned
    : `${Defaults.apis.baseUrl}/${cleaned}`
}

const stripHtml = (html: string): string =>
  (html ?? '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

// For `product_type: 'variant'` items, the displayed price is the lowest
// variant price (shown as "From ₹x") since each variant can be priced
// differently — falls back to the product-level price otherwise.
const getPriceInfo = (item: ApiProduct): { price: number; isRange: boolean } => {
  if (item.product_type === 'variant' && item.variants?.length > 0) {
    const variantPrices = item.variants.map(v => parseFloat(v.Price)).filter(p => !isNaN(p))
    if (variantPrices.length > 0) {
      return { price: Math.min(...variantPrices), isRange: new Set(variantPrices).size > 1 }
    }
  }
  return { price: parseFloat(item.price), isRange: false }
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = React.memo(({
  item,
  qty,
  cardWidth,
  onAdd,
  onIncrease,
  onDecrease,
  onPress,
}: {
  item: ApiProduct
  qty: number
  cardWidth: number
  onAdd: (id: number) => void
  onIncrease: (id: number) => void
  onDecrease: (id: number) => void
  onPress: (id: number) => void
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [imgError, setImgError] = useState(false)

  const inStock = item.stock_in_hand > 0
  const { price, isRange } = getPriceInfo(item)
  const imageUri = buildImageUrl(item.image)
  const description = stripHtml(item.description)
  const isVariant = item.product_type === 'variant'
  const extraImageCount = (item.images?.length ?? 0) - 1

  const handleAdd = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start()
    onAdd(item.id)
  }

  return (
    <View style={[card.root, { width: cardWidth }]}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item.id)}>
      {/* Image area */}
      <View style={[card.imgBox, { height: Math.round(cardWidth * 0.92) }]}>
        {imageUri && !imgError ? (
          <Image
            source={{ uri: imageUri }}
            style={card.img}
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={card.imgFallback}>
            <Text style={card.fallbackEmoji}>📦</Text>
          </View>
        )}

        {extraImageCount > 0 && (
          <View style={card.galleryBadge}>
            <Text style={card.galleryBadgeText}>+{extraImageCount} photos</Text>
          </View>
        )}

        {item.stock_in_hand <= 5 && item.stock_in_hand > 0 && (
          <View style={card.lowStockBadge}>
            <Text style={card.lowStockText}>Only {item.stock_in_hand} left</Text>
          </View>
        )}

        {!inStock && (
          <View style={card.oosOverlay}>
            <View style={card.oosPill}>
              <Text style={card.oosLabel}>Out of Stock</Text>
            </View>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={card.body}>
        <View style={card.nameRow}>
          <Text style={card.name} numberOfLines={2}>{item.name}</Text>
          {isVariant && (
            <View style={card.variantBadge}>
              <Text style={card.variantBadgeText}>{item.variants.length} options</Text>
            </View>
          )}
        </View>

        {description ? (
          <Text style={card.desc} numberOfLines={1}>{description}</Text>
        ) : null}
      </View>
      </TouchableOpacity>

      <View style={card.footerWrap}>
        {/* Price + CTA */}
        <View style={card.footer}>
          <View style={card.priceCol}>
            {isRange && <Text style={card.priceFrom}>From</Text>}
            <Text style={card.price}>₹{price.toLocaleString('en-IN')}</Text>
          </View>

          {inStock ? (
            qty === 0 ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={card.addBtn}
                  onPress={handleAdd}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${item.name} to cart`}
                >
                  <Text style={card.addBtnText}>ADD</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={card.stepper}>
                <TouchableOpacity style={card.stepBtn} onPress={() => onDecrease(item.id)} accessibilityLabel="Decrease quantity">
                  <Text style={card.stepTxt}>−</Text>
                </TouchableOpacity>
                <Text style={card.stepQty}>{qty}</Text>
                <TouchableOpacity style={card.stepBtn} onPress={() => onIncrease(item.id)} accessibilityLabel="Increase quantity">
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
    </View>
  )
})

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CategoryProductScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const r = useResponsive()
  const category = route.params?.category ?? { id: 0, name: 'Products', description: '', image: null }

  const hPad = r.select({ phone: 16, tablet: 24, large: 32 })
  const numColumns = r.columns(2, 3, 4)
  const cardWidth = r.cellWidth(r.width, numColumns, hPad, GUTTER)

  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('default')
  const [cart, setCart] = useState<CartState>({})
  const searchRef = useRef<TextInput>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true)
      try {
        const data = await fetchProductsByCategory(category.id, category.name)
        setProducts(data)
      } finally {
        setLoadingProducts(false)
      }
    }
    load()
  }, [category.id, category.name])

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ApiProductDetail | null>(null)

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

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'price_lh': list.sort((a, b) => getPriceInfo(a).price - getPriceInfo(b).price); break
      case 'price_hl': list.sort((a, b) => getPriceInfo(b).price - getPriceInfo(a).price); break
      case 'stock':    list.sort((a, b) => b.stock_in_hand - a.stock_in_hand); break
    }

    return list
  }, [products, search, sort])

  const cartTotal = useMemo(() =>
    Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(x => x.id === Number(id))
      return sum + (p ? getPriceInfo(p).price * qty : 0)
    }, 0), [cart, products])

  const cartCount = useMemo(() =>
    Object.values(cart).reduce((s, q) => s + q, 0), [cart])

  const addToCart  = useCallback((id: number) => setCart(prev => ({ ...prev, [id]: 1 })), [])
  const increase   = useCallback((id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 })), [])
  const decrease   = useCallback((id: number) => setCart(prev => {
    const next = { ...prev }
    if ((next[id] ?? 0) <= 1) delete next[id]
    else next[id]--
    return next
  }), [])

  const renderItem = useCallback(({ item }: { item: ApiProduct }) => (
    <ProductCard
      item={item}
      qty={cart[item.id] ?? 0}
      cardWidth={cardWidth}
      onAdd={addToCart}
      onIncrease={increase}
      onDecrease={decrease}
      onPress={openDetail}
    />
  ), [cart, cardWidth, addToCart, increase, decrease, openDetail])

  const categoryImageUri = category.image
    ? `http://${Defaults.domain}${category.image}`
    : null

  const ListHeader = (
    <>
      {/* Category Banner */}
      <View style={s.banner}>
        <View style={s.bannerIcon}>
          {categoryImageUri ? (
            <Image source={{ uri: categoryImageUri }} style={s.bannerImg} resizeMode="cover" />
          ) : (
            <Text style={s.bannerEmoji}>📦</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.bannerName}>{category.name}</Text>
          {category.description ? (
            <Text style={s.bannerDesc} numberOfLines={2}>{category.description}</Text>
          ) : null}
          <Text style={s.bannerCount}>{filtered.length} products available</Text>
        </View>
      </View>

      {/* Sort chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.sortRow, { paddingHorizontal: hPad }]}
      >
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.chip, sort === opt.key && s.chipActive]}
            onPress={() => setSort(opt.key)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: sort === opt.key }}
          >
            <Text style={[s.chipTxt, sort === opt.key && s.chipTxtActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[s.resultCount, { paddingHorizontal: hPad }]}>{filtered.length} results</Text>
    </>
  )

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <ApiProductDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        productDetail={detailProduct}
        loading={detailLoading}
        qty={detailProduct ? cart[detailProduct.id] ?? 0 : 0}
        onAdd={addToCart}
        onIncrease={increase}
        onDecrease={decrease}
      />

      {/* Header */}
      <View style={[s.header, { paddingHorizontal: hPad - 2 }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.headerSearch} activeOpacity={1} onPress={() => searchRef.current?.focus()}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            ref={searchRef}
            style={s.searchInput}
            placeholder={`Search in ${category.name}…`}
            placeholderTextColor={THEME.COLOR.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Clear search">
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loadingProducts ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={THEME.COLOR.primary} />
          <Text style={s.loadingText}>Loading products…</Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={filtered}
          keyExtractor={item => String(item.id)}
          numColumns={numColumns}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[s.grid, { paddingHorizontal: hPad }]}
          columnWrapperStyle={{ gap: GUTTER, marginBottom: GUTTER }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTitle}>No products found</Text>
              <Text style={s.emptySubtitle}>Try a different search or sort</Text>
            </View>
          }
        />
      )}

      {/* Cart footer */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={[s.cartFooter, { left: hPad, right: hPad }]}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={`View cart, ${cartCount} items, total ₹${cartTotal}`}
        >
          <View style={s.cartFooterBubble}>
            <Text style={s.cartFooterCount}>{cartCount}</Text>
          </View>
          <Text style={s.cartFooterLabel}>
            {cartCount} item{cartCount > 1 ? 's' : ''}  ·  ₹{cartTotal.toLocaleString('en-IN')}
          </Text>
          <Text style={s.cartFooterCta}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PINK = THEME.COLOR.primary

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.COLOR.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: THEME.COLOR.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 22, color: THEME.COLOR.textPrimary },
  headerSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Regular,
    padding: 0,
  },
  clearBtn: { fontSize: 13, color: THEME.COLOR.textSecondary, paddingLeft: 6 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: THEME.RADIUS.large,
  },
  bannerIcon: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#E0E0E0' },
  bannerImg: { width: 54, height: 54 },
  bannerEmoji: { fontSize: 27 },
  bannerName: { fontSize: 18, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary, letterSpacing: -0.2 },
  bannerDesc: { fontSize: 12, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textSecondary, marginTop: 2 },
  bannerCount: { fontSize: 12.5, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textSecondary, marginTop: 3 },

  sortRow: { paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.RADIUS.pill,
    backgroundColor: THEME.COLOR.surface,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  chipActive: { backgroundColor: PINK, borderColor: PINK },
  chipTxt: { fontSize: 12.5, fontFamily: THEME.FONTWEIGHT.Medium, color: THEME.COLOR.textSecondary },
  chipTxtActive: { color: '#fff' },

  resultCount: {
    fontSize: 12.5,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: THEME.COLOR.textSecondary,
    paddingBottom: 10,
  },

  grid: { paddingBottom: 110 },

  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: THEME.COLOR.textSecondary, fontFamily: THEME.FONTWEIGHT.Regular },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  emptySubtitle: { fontSize: 13, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textSecondary, marginTop: 4 },

  cartFooter: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.textPrimary,
    borderRadius: THEME.RADIUS.large,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...THEME.SHADOW.lg,
  },
  cartFooterBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PINK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cartFooterCount: { color: '#fff', fontSize: 12, fontFamily: THEME.FONTWEIGHT.Bold },
  cartFooterLabel: { flex: 1, color: '#fff', fontSize: 13.5, fontFamily: THEME.FONTWEIGHT.Medium },
  cartFooterCta: { color: '#fff', fontSize: 13.5, fontFamily: THEME.FONTWEIGHT.Bold },
})

const card = StyleSheet.create({
  root: {
    marginBottom: 0,
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    ...THEME.SHADOW.card,
  },
  imgBox: {
    backgroundColor: THEME.COLOR.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },
  imgFallback: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surfaceAlt,
  },
  fallbackEmoji: { fontSize: 48 },
  galleryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(20,20,31,0.6)',
    borderRadius: THEME.RADIUS.small,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  galleryBadgeText: { fontSize: 9, fontFamily: THEME.FONTWEIGHT.Medium, color: '#fff' },
  lowStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: THEME.COLOR.warningBg,
    borderRadius: THEME.RADIUS.small,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  lowStockText: { fontSize: 9, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.warningText },
  oosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(247,248,250,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oosPill: {
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...THEME.SHADOW.sm,
  },
  oosLabel: {
    fontSize: 11,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.danger,
    textAlign: 'center',
  },
  body: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  footerWrap: { paddingHorizontal: 12, paddingBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    lineHeight: 18,
    marginBottom: 3,
  },
  variantBadge: {
    backgroundColor: THEME.COLOR.infoBg,
    borderRadius: THEME.RADIUS.small,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  variantBadgeText: { fontSize: 8, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.infoText },
  desc: {
    fontSize: 11,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Regular,
    marginBottom: 8,
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  priceCol: { flexShrink: 1 },
  priceFrom: { fontSize: 9, fontFamily: THEME.FONTWEIGHT.Medium, color: THEME.COLOR.textTertiary, marginBottom: -2 },
  price: { fontSize: 15.5, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  addBtn: { backgroundColor: PINK, borderRadius: THEME.RADIUS.medium, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 11, fontFamily: THEME.FONTWEIGHT.Bold, letterSpacing: 0.5 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK,
    borderRadius: THEME.RADIUS.medium,
    overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 9, paddingVertical: 7 },
  stepTxt: { color: '#fff', fontSize: 15, fontFamily: THEME.FONTWEIGHT.Bold, lineHeight: 17 },
  stepQty: { color: '#fff', fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold, minWidth: 20, textAlign: 'center' },
  notifyBtn: {
    borderWidth: 1,
    borderColor: PINK,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  notifyTxt: { color: PINK, fontSize: 10, fontFamily: THEME.FONTWEIGHT.Bold },
})

export default CategoryProductScreen
