import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Defaults from '../../../config'
import {
  fetchAllProductsComplete,
  fetchCategories,
  fetchProductDetail,
} from '../../../shared/services/main-service'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal'

const { width: W } = Dimensions.get('window')
const GUTTER = 12
const CARD_WIDTH = (W - 36 - GUTTER) / 2

const RECENT_KEY = 'recent_searches'
const MAX_RECENT = 8

const TRENDING = ['Eggs', 'Chips', 'Chocolate', 'Bread', 'Paneer', 'Tomatoes', 'Milk', 'Coke']

const PRODUCT_BG_COLORS = [
  '#FFE0E0', '#FFF4D6', '#E0F0FF', '#E4F6E6',
  '#EBE4FF', '#FFE9E0', '#E0FFE8', '#F4E8FF',
]
const CATEGORY_COLORS = [
  '#E4F6E6', '#FFF4D6', '#FFE9E0', '#E0F0FF',
  '#EBE4FF', '#FFF0D6', '#E0FFE8', '#F4E8FF',
]
const CATEGORY_EMOJIS = ['🥦', '🥚', '🍿', '🥤', '🥐', '🍜', '🧴', '🍪']

import { buildImageUrl, getFallbackImage } from '../../../shared/utils/imageHelper'

const getPriceInfo = (item: any) => {
  if (item.product_type === 'variant' && item.variants?.length > 0) {
    const prices = item.variants
      .map((v: any) => parseFloat(v.Price))
      .filter((p: number) => !isNaN(p))
    if (prices.length > 0) return { price: Math.min(...prices) }
  }
  return { price: parseFloat(item.price) || 0 }
}

const getDiscountPercent = (item: any) => {
  const price = parseFloat(item.price) || 0
  const mrp = parseFloat(item.mrp || item.compare_at_price) || 0
  if (mrp > price && price > 0) return Math.round(((mrp - price) / mrp) * 100)
  return 0
}

const ProductCard = React.memo(({
  item, qty, index, onAdd, onIncrease, onDecrease, onPress,
}: {
  item: any; qty: number; index: number
  onAdd: (id: number) => void; onIncrease: (id: number) => void
  onDecrease: (id: number) => void; onPress: (id: number) => void
}) => {
  const initialImg = buildImageUrl(item.image, item.name, 'product')
  const [imgSrc, setImgSrc] = useState(initialImg)

  useEffect(() => {
    setImgSrc(buildImageUrl(item.image, item.name, 'product'))
  }, [item.image, item.name])

  const inStock = (item.stock_in_hand ?? 1) > 0
  const { price } = getPriceInfo(item)
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
      <Text style={card.name} numberOfLines={2}>{item.name}</Text>
      <Text style={card.unit}>{item.unit || item.weight || 'per unit'}</Text>
      <View style={card.footer}>
        <View>
          <Text style={card.price}>₹{price.toLocaleString('en-IN')}</Text>
          {mrp > price && <Text style={card.mrp}>₹{mrp.toLocaleString('en-IN')}</Text>}
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

const SearchScreen = () => {
  const navigation = useNavigation<any>()
  const inputRef = useRef<TextInput>(null)

  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailProduct, setDetailProduct] = useState<ApiProductDetail | null>(null)

  useEffect(() => {
    load()
    // Focus the field as soon as the screen mounts
    const t = setTimeout(() => inputRef.current?.focus(), 350)
    return () => clearTimeout(t)
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [prods, cats, storedRecent, storedCart] = await Promise.all([
        fetchAllProductsComplete().catch(() => []),
        fetchCategories().catch(() => []),
        getAsyncData(RECENT_KEY).catch(() => []),
        getAsyncData('cart_items').catch(() => []),
      ])
      setAllProducts(Array.isArray(prods) ? prods : [])
      setCategories(Array.isArray(cats) ? cats.filter((c: any) => c.status !== false) : [])
      setRecent(Array.isArray(storedRecent) ? storedRecent : [])
      setCartItems(Array.isArray(storedCart) ? storedCart : [])
    } finally {
      setLoading(false)
    }
  }

  const trimmed = query.trim().toLowerCase()
  const isSearching = trimmed.length > 0

  const matchedCategories = useMemo(() => {
    if (!isSearching) return []
    return categories.filter((c: any) => (c.name || '').toLowerCase().includes(trimmed))
  }, [categories, trimmed, isSearching])

  const matchedProducts = useMemo(() => {
    if (!isSearching) return []
    return allProducts.filter((p: any) => {
      const name = (p.name || '').toLowerCase()
      const cat = (p.category || '').toLowerCase()
      const desc = (p.description || '').toLowerCase()
      return name.includes(trimmed) || cat.includes(trimmed) || desc.includes(trimmed)
    })
  }, [allProducts, trimmed, isSearching])

  const persistRecent = useCallback(async (term: string) => {
    const t = term.trim()
    if (!t) return
    const next = [t, ...recent.filter(r => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT)
    setRecent(next)
    await setAsyncData(RECENT_KEY, next as any)
  }, [recent])

  const runSearch = (term: string) => {
    setQuery(term)
    persistRecent(term)
    Keyboard.dismiss()
  }

  const clearRecent = async () => {
    setRecent([])
    await setAsyncData(RECENT_KEY, [] as any)
  }

  // Cart helpers
  const getQty = (id: number) => cartItems.find(i => i.id === id)?.quantity || 0

  const addToCart = useCallback(async (id: number) => {
    const product = allProducts.find(p => p.id === id)
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
  }, [cartItems, allProducts])

  const increase = useCallback(async (id: number) => {
    const updated = cartItems.map(i => i.id === id ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)
  }, [cartItems])

  const decrease = useCallback(async (id: number) => {
    const updated = cartItems
      .map(i => i.id === id ? { ...i, quantity: (i.quantity || 1) - 1 } : i)
      .filter(i => (i.quantity || 0) > 0)
    setCartItems(updated)
    await setAsyncData('cart_items', updated as any)
  }, [cartItems])

  const cartCount = useMemo(() => cartItems.reduce((s, i) => s + (i.quantity || 1), 0), [cartItems])
  const cartTotal = useMemo(
    () => cartItems.reduce((s, i) => s + (i.points || 0) * (i.quantity || 1), 0),
    [cartItems],
  )

  const openDetail = useCallback(async (id: number) => {
    setDetailVisible(true)
    setDetailLoading(true)
    setDetailProduct(null)
    const data = await fetchProductDetail(id)
    setDetailProduct(data)
    setDetailLoading(false)
  }, [])

  const renderProduct = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <ProductCard
        item={item}
        qty={getQty(item.id)}
        index={index}
        onAdd={addToCart}
        onIncrease={increase}
        onDecrease={decrease}
        onPress={openDetail}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartItems, addToCart, increase, decrease, openDetail],
  )

  const renderIdle = () => (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.idleContent}
    >
      {recent.length > 0 && (
        <>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>RECENT SEARCHES</Text>
            <TouchableOpacity onPress={clearRecent}>
              <Text style={s.clearBtn}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={s.chipWrap}>
            {recent.map(term => (
              <TouchableOpacity
                key={term}
                style={s.recentChip}
                activeOpacity={0.8}
                onPress={() => runSearch(term)}
              >
                <Text style={s.recentIcon}>🕘</Text>
                <Text style={s.recentTxt}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={[s.sectionTitle, { marginTop: recent.length ? 22 : 4 }]}>TRENDING NOW 🔥</Text>
      <View style={s.chipWrap}>
        {TRENDING.map(term => (
          <TouchableOpacity
            key={term}
            style={s.trendChip}
            activeOpacity={0.8}
            onPress={() => runSearch(term)}
          >
            <Text style={s.trendTxt}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {categories.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: 24 }]}>SHOP BY CATEGORY</Text>
          <View style={s.chipWrap}>
            {categories.slice(0, 12).map((cat, idx) => (
              <TouchableOpacity
                key={cat.id}
                style={s.catPill}
                activeOpacity={0.82}
                onPress={() => navigation.navigate('CategoryProducts', { category: cat })}
              >
                <View style={[s.catPillIcon, { backgroundColor: CATEGORY_COLORS[idx % 8] }]}>
                  {cat.image ? (
                    <Image source={{ uri: buildImageUrl(cat.image) }} style={s.catPillImg} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 15 }}>{CATEGORY_EMOJIS[idx % 8]}</Text>
                  )}
                </View>
                <Text style={s.catPillTxt}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {allProducts.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 4 }]}>POPULAR PRODUCTS</Text>
          <FlatList
            data={allProducts.slice(0, 8)}
            keyExtractor={item => String(item.id)}
            numColumns={2}
            scrollEnabled={false}
            renderItem={renderProduct}
            columnWrapperStyle={{ gap: GUTTER }}
            contentContainerStyle={{ gap: GUTTER, paddingTop: 8 }}
          />
        </>
      )}
    </ScrollView>
  )

  const renderResults = () => (
    <FlatList
      data={matchedProducts}
      keyExtractor={item => String(item.id)}
      numColumns={2}
      keyboardShouldPersistTaps="handled"
      renderItem={renderProduct}
      columnWrapperStyle={{ gap: GUTTER }}
      contentContainerStyle={s.resultsContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        matchedCategories.length > 0 ? (
          <View style={s.resultCatBlock}>
            <Text style={s.sectionTitle}>CATEGORIES</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.resultCatRow}
            >
              {matchedCategories.map((cat, idx) => (
                <TouchableOpacity
                  key={cat.id}
                  style={s.catPill}
                  activeOpacity={0.82}
                  onPress={() => navigation.navigate('CategoryProducts', { category: cat })}
                >
                  <View style={[s.catPillIcon, { backgroundColor: CATEGORY_COLORS[idx % 8] }]}>
                    {cat.image ? (
                      <Image source={{ uri: buildImageUrl(cat.image) }} style={s.catPillImg} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: 15 }}>{CATEGORY_EMOJIS[idx % 8]}</Text>
                    )}
                  </View>
                  <Text style={s.catPillTxt}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[s.sectionTitle, { marginTop: 18 }]}>
              PRODUCTS ({matchedProducts.length})
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <View style={s.emptyIcon}><Text style={{ fontSize: 42 }}>🔍</Text></View>
          <Text style={s.emptyTitle}>No results for “{query.trim()}”</Text>
          <Text style={s.emptySub}>Try a different spelling or a more general term.</Text>
        </View>
      }
    />
  )

  return (
    <LinearGradient colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']} locations={[0, 0.4, 1]} style={s.root}>
      <StatusBar backgroundColor="#FFE500" barStyle="dark-content" />
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
          related={allProducts}
          onSelectRelated={openDetail}
          onViewCart={() => navigation.navigate('Cart')}
        />

        {/* Search header */}
        <LinearGradient colors={['#FFE500', '#FFDD00']} style={s.headerBlock}>
          <View style={s.searchRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={s.searchBox}>
              <Text style={s.searchIcon}>🔎</Text>
              <TextInput
                ref={inputRef}
                style={s.input}
                placeholder="Search for atta, dal, coke…"
                placeholderTextColor="#9a9a9a"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                onSubmitEditing={() => runSearch(query)}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={s.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#0C831F" />
          </View>
        ) : isSearching ? (
          renderResults()
        ) : (
          renderIdle()
        )}

        {/* Floating cart bar */}
        {cartCount > 0 && (
          <TouchableOpacity style={s.cartBar} onPress={() => navigation.navigate('Cart')} activeOpacity={0.92}>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#C9A800',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 19, color: '#141414' },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 14.5,
    color: '#141414',
    padding: 0,
  },
  clearIcon: { fontSize: 15, color: '#9a9a9a' },

  idleContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 140 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    color: '#8a8a8a',
  },
  clearBtn: { fontFamily: 'DMSans-Bold', fontSize: 12, color: '#0C831F' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: '#EDEDEA',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  recentIcon: { fontSize: 12 },
  recentTxt: { fontFamily: 'DMSans-Medium', fontSize: 13.5, color: '#333' },

  trendChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE000',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  trendTxt: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#141414' },

  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: '#EDEDEA',
    borderRadius: 22,
    paddingRight: 14,
    paddingLeft: 5,
    paddingVertical: 5,
  },
  catPillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  catPillImg: { width: 32, height: 32 },
  catPillTxt: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#333' },

  resultsContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140, gap: GUTTER },
  resultCatBlock: { marginBottom: 12 },
  resultCatRow: { gap: 10, paddingTop: 12, paddingBottom: 2 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 70, paddingHorizontal: 24 },
  emptyIcon: {
    width: 84,
    height: 84,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: 'DMSans-Bold', fontSize: 17, color: '#141414', marginTop: 18, textAlign: 'center' },
  emptySub: { fontFamily: 'DMSans-Regular', fontSize: 13, color: '#8a8a8a', textAlign: 'center', marginTop: 5 },

  cartBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 16,
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
    height: 100,
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
  discountText: { fontFamily: 'DMSans-Bold', fontSize: 10, color: '#FFE000' },
  img: { width: '100%', height: '100%' },
  fallback: { fontSize: 34, fontFamily: 'DMSans-Bold', color: 'rgba(0,0,0,0.12)' },
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
    fontSize: 13,
    color: '#141414',
    marginTop: 7,
    lineHeight: 16,
    height: 32,
  },
  unit: { fontFamily: 'DMSans-Medium', fontSize: 11, color: '#8a8a8a', marginTop: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  price: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  mrp: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10.5,
    color: '#9a9a9a',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#0C831F',
    backgroundColor: '#E8F7EA',
    borderRadius: 10,
    paddingHorizontal: 15,
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
  stepBtn: { width: 26, height: 30, justifyContent: 'center', alignItems: 'center' },
  stepTxt: { color: '#fff', fontSize: 17, fontFamily: 'DMSans-Bold' },
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

export default SearchScreen
