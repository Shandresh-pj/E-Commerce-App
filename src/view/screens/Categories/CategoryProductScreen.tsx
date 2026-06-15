import React, { useState, useCallback, useRef, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'
import Defaults from '../../../config'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiProduct = {
  id: number
  name: string
  description: string
  price: string
  barcode: string
  image: string
  images: string | null
  stock: number
  category: string
  created_at: string
  updated_at: string
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

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = React.memo(({
  item,
  qty,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  item: ApiProduct
  qty: number
  onAdd: (id: number) => void
  onIncrease: (id: number) => void
  onDecrease: (id: number) => void
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [imgError, setImgError] = useState(false)

  const inStock = item.stock > 0
  const price = parseFloat(item.price)
  const imageUri = buildImageUrl(item.image)

  const handleAdd = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start()
    onAdd(item.id)
  }

  return (
    <View style={card.root}>
      {/* Image area */}
      <View style={card.imgBox}>
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

        {item.stock <= 5 && item.stock > 0 && (
          <View style={card.lowStockBadge}>
            <Text style={card.lowStockText}>Only {item.stock} left</Text>
          </View>
        )}

        {!inStock && (
          <View style={card.oosOverlay}>
            <Text style={card.oosLabel}>Out of{'\n'}Stock</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={card.body}>
        <Text style={card.name} numberOfLines={2}>{item.name}</Text>

        {item.description ? (
          <Text style={card.desc} numberOfLines={1}>{item.description}</Text>
        ) : null}

        {/* Price + CTA */}
        <View style={card.footer}>
          <Text style={card.price}>₹{price.toLocaleString('en-IN')}</Text>

          {inStock ? (
            qty === 0 ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={card.addBtn} onPress={handleAdd} activeOpacity={0.85}>
                  <Text style={card.addBtnText}>ADD +</Text>
                </TouchableOpacity>
              </Animated.View>
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
    </View>
  )
})

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CategoryProductScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const category = route.params?.category ?? { value: '', label: 'Products', icon: '📦', bgColor: '#F5F5F5', iconBg: '#E0E0E0', count: 0 }
  const products: ApiProduct[] = route.params?.products ?? []

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('default')
  const [cart, setCart] = useState<CartState>({})
  const searchRef = useRef<TextInput>(null)

  const filtered = useMemo(() => {
    let list = [...products]

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'price_lh': list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break
      case 'price_hl': list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break
      case 'stock':    list.sort((a, b) => b.stock - a.stock); break
    }

    return list
  }, [products, search, sort])

  const cartTotal = useMemo(() =>
    Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(x => x.id === Number(id))
      return sum + (p ? parseFloat(p.price) * qty : 0)
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
      onAdd={addToCart}
      onIncrease={increase}
      onDecrease={decrease}
    />
  ), [cart, addToCart, increase, decrease])

  const ListHeader = (
    <>
      {/* Category Banner */}
      <View style={[s.banner, { backgroundColor: category.bgColor ?? '#F5F5F5' }]}>
        <View style={[s.bannerIcon, { backgroundColor: category.iconBg ?? '#E0E0E0' }]}>
          <Text style={s.bannerEmoji}>{category.icon ?? '📦'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.bannerName}>{category.label}</Text>
          <Text style={s.bannerCount}>{filtered.length} products</Text>
        </View>
      </View>

      {/* Sort chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.sortRow}
      >
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.chip, sort === opt.key && s.chipActive]}
            onPress={() => setSort(opt.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.chipTxt, sort === opt.key && s.chipTxtActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.resultCount}>{filtered.length} results</Text>
    </>
  )

  return (
    <SafeAreaView style={s.safe} edges={['left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.headerSearch} activeOpacity={1} onPress={() => searchRef.current?.focus()}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            ref={searchRef}
            style={s.searchInput}
            placeholder={`Search in ${category.label}…`}
            placeholderTextColor={THEME.COLOR.textDarkGrey}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

      </View>

      {/* Body */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={s.row}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🔍</Text>
            <Text style={s.emptyTitle}>No products found</Text>
            <Text style={s.emptySubtitle}>Try a different search or sort</Text>
          </View>
        }
      />

      {/* Cart footer */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={s.cartFooter}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
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

const PINK = THEME.COLOR.bgPurple

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  backBtn: { width: 34, height: 34, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: THEME.COLOR.textBlack },
  headerSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Regular,
    padding: 0,
  },
  clearBtn: { fontSize: 13, color: THEME.COLOR.textDarkGrey, paddingLeft: 6 },
  cartBtn: { position: 'relative', width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  cartEmoji: { fontSize: 22 },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: PINK,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeTxt: { color: '#fff', fontSize: 9, fontFamily: THEME.FONTWEIGHT.Bold },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
  },
  bannerIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 26 },
  bannerName: { fontSize: 17, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack },
  bannerCount: { fontSize: 12, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textDarkGrey, marginTop: 2 },

  sortRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  chipActive: { backgroundColor: PINK, borderColor: PINK },
  chipTxt: { fontSize: 12, fontFamily: THEME.FONTWEIGHT.Medium, color: THEME.COLOR.textDarkGrey },
  chipTxtActive: { color: '#fff' },

  resultCount: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textDarkGrey,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  grid: { paddingHorizontal: 12, paddingBottom: 110 },
  row: { justifyContent: 'space-between' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack },
  emptySubtitle: { fontSize: 13, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textDarkGrey, marginTop: 4 },

  cartFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.textBlack,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
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
  cartFooterLabel: { flex: 1, color: '#fff', fontSize: 13, fontFamily: THEME.FONTWEIGHT.Medium },
  cartFooterCta: { color: PINK, fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold },
})

const card = StyleSheet.create({
  root: {
    width: CARD_WIDTH,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imgBox: {
    height: 130,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },
  imgFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgHalfWhite,
  },
  fallbackEmoji: { fontSize: 48 },
  lowStockBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lowStockText: { fontSize: 9, fontFamily: THEME.FONTWEIGHT.Bold, color: '#E65100' },
  oosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oosLabel: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textRed,
    textAlign: 'center',
  },
  body: { padding: 10 },
  name: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textBlack,
    lineHeight: 18,
    marginBottom: 3,
  },
  desc: {
    fontSize: 10,
    color: THEME.COLOR.textDarkGrey,
    fontFamily: THEME.FONTWEIGHT.Regular,
    marginBottom: 8,
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontSize: 15, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack },
  addBtn: { backgroundColor: PINK, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 11, fontFamily: THEME.FONTWEIGHT.Bold, letterSpacing: 0.5 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 9, paddingVertical: 7 },
  stepTxt: { color: '#fff', fontSize: 15, fontFamily: THEME.FONTWEIGHT.Bold, lineHeight: 17 },
  stepQty: { color: '#fff', fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold, minWidth: 20, textAlign: 'center' },
  notifyBtn: {
    borderWidth: 1,
    borderColor: PINK,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  notifyTxt: { color: PINK, fontSize: 10, fontFamily: THEME.FONTWEIGHT.Bold },
})

export default CategoryProductScreen
