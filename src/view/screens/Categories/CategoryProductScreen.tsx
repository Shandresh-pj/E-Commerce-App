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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'

const { width } = Dimensions.get('window')
const SIDEBAR_WIDTH = 90
const PRODUCT_COL_WIDTH = width - SIDEBAR_WIDTH

// ─── Mock Data ────────────────────────────────────────────────────────────────

type Product = {
  id: string
  name: string
  brand: string
  quantity: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  ratingCount: number
  inStock: boolean
  emoji: string
  bgColor: string
  subCategory: string
  isBestSeller?: boolean
}

const ALL_PRODUCTS: Product[] = [
  // Fruits & Vegetables
  { id: 'p1', name: 'Fresh Spinach', brand: 'FarmFresh', quantity: '250 g', price: 29, originalPrice: 40, discount: 28, rating: 4.5, ratingCount: 312, inStock: true, emoji: '🥬', bgColor: '#E8F5E9', subCategory: 'Fresh Vegetables', isBestSeller: true },
  { id: 'p2', name: 'Banana - Robusta', brand: 'NatureFarm', quantity: '6 pcs', price: 49, originalPrice: 60, discount: 18, rating: 4.3, ratingCount: 521, inStock: true, emoji: '🍌', bgColor: '#FFF8E1', subCategory: 'Fresh Fruits' },
  { id: 'p3', name: 'Tomato (Hybrid)', brand: 'FarmFresh', quantity: '500 g', price: 35, originalPrice: 50, discount: 30, rating: 4.1, ratingCount: 289, inStock: true, emoji: '🍅', bgColor: '#FFEBEE', subCategory: 'Fresh Vegetables' },
  { id: 'p4', name: 'Red Apple', brand: 'Himalayan', quantity: '4 pcs (~500 g)', price: 119, originalPrice: 150, discount: 21, rating: 4.6, ratingCount: 445, inStock: true, emoji: '🍎', bgColor: '#FCE4EC', subCategory: 'Fresh Fruits', isBestSeller: true },
  { id: 'p5', name: 'Green Capsicum', brand: 'FarmFresh', quantity: '250 g', price: 39, originalPrice: 55, discount: 29, rating: 4.0, ratingCount: 198, inStock: false, emoji: '🫑', bgColor: '#E8F5E9', subCategory: 'Fresh Vegetables' },
  { id: 'p6', name: 'Coriander (Dhaniya)', brand: 'NatureFarm', quantity: '50 g', price: 15, originalPrice: 20, discount: 25, rating: 4.2, ratingCount: 672, inStock: true, emoji: '🌿', bgColor: '#E8F5E9', subCategory: 'Herbs & Seasonings' },
  // Dairy
  { id: 'p7', name: 'Amul Full Cream Milk', brand: 'Amul', quantity: '500 ml', price: 30, originalPrice: 32, discount: 6, rating: 4.7, ratingCount: 1204, inStock: true, emoji: '🥛', bgColor: '#E3F2FD', subCategory: 'Milk', isBestSeller: true },
  { id: 'p8', name: 'Mother Dairy Curd', brand: 'Mother Dairy', quantity: '400 g', price: 44, originalPrice: 50, discount: 12, rating: 4.5, ratingCount: 876, inStock: true, emoji: '🫙', bgColor: '#E3F2FD', subCategory: 'Curd & Buttermilk' },
  { id: 'p9', name: 'Amul Butter (Salted)', brand: 'Amul', quantity: '100 g', price: 57, originalPrice: 60, discount: 5, rating: 4.8, ratingCount: 2341, inStock: true, emoji: '🧈', bgColor: '#FFF8E1', subCategory: 'Cheese', isBestSeller: true },
  { id: 'p10', name: 'Farm Fresh Eggs', brand: 'Suguna', quantity: '6 pcs', price: 72, originalPrice: 80, discount: 10, rating: 4.4, ratingCount: 534, inStock: true, emoji: '🥚', bgColor: '#FFF3E0', subCategory: 'Eggs' },
  // Snacks
  { id: 'p11', name: 'Lay\'s Classic Salted', brand: 'Lay\'s', quantity: '52 g', price: 20, originalPrice: 25, discount: 20, rating: 4.3, ratingCount: 1892, inStock: true, emoji: '🥔', bgColor: '#FFF8E1', subCategory: 'Chips & Crisps', isBestSeller: true },
  { id: 'p12', name: 'Kurkure Masala Munch', brand: 'Kurkure', quantity: '90 g', price: 30, originalPrice: 35, discount: 14, rating: 4.2, ratingCount: 1120, inStock: true, emoji: '🌽', bgColor: '#FFF8E1', subCategory: 'Chips & Crisps' },
  { id: 'p13', name: 'Haldiram\'s Aloo Bhujia', brand: 'Haldiram\'s', quantity: '200 g', price: 68, originalPrice: 80, discount: 15, rating: 4.6, ratingCount: 2890, inStock: true, emoji: '🫘', bgColor: '#FFF8E1', subCategory: 'Namkeen', isBestSeller: true },
  { id: 'p14', name: 'Act II Classic Popcorn', brand: 'Act II', quantity: '30 g × 3', price: 55, originalPrice: 65, discount: 15, rating: 4.1, ratingCount: 432, inStock: true, emoji: '🍿', bgColor: '#FFF8E1', subCategory: 'Popcorn' },
  { id: 'p15', name: 'Britannia Good Day', brand: 'Britannia', quantity: '216 g', price: 38, originalPrice: 45, discount: 16, rating: 4.4, ratingCount: 1560, inStock: true, emoji: '🍪', bgColor: '#EFEBE9', subCategory: 'Biscuits & Cookies' },
  // Drinks
  { id: 'p16', name: 'Coca-Cola', brand: 'Coca-Cola', quantity: '750 ml', price: 45, originalPrice: 50, discount: 10, rating: 4.5, ratingCount: 3201, inStock: true, emoji: '🥤', bgColor: '#FCE4EC', subCategory: 'Soft Drinks', isBestSeller: true },
  { id: 'p17', name: 'Real Fruit Juice (Orange)', brand: 'Real', quantity: '1 L', price: 99, originalPrice: 120, discount: 18, rating: 4.3, ratingCount: 789, inStock: true, emoji: '🍊', bgColor: '#FFF3E0', subCategory: 'Fruit Juices' },
  { id: 'p18', name: 'Red Bull Energy Drink', brand: 'Red Bull', quantity: '250 ml', price: 125, originalPrice: 135, discount: 7, rating: 4.4, ratingCount: 654, inStock: true, emoji: '⚡', bgColor: '#FFF8E1', subCategory: 'Energy Drinks' },
  { id: 'p19', name: 'Bisleri Mineral Water', brand: 'Bisleri', quantity: '1 L', price: 20, originalPrice: 20, discount: 0, rating: 4.6, ratingCount: 4512, inStock: true, emoji: '💧', bgColor: '#E3F2FD', subCategory: 'Water', isBestSeller: true },
  // Instant
  { id: 'p20', name: 'Maggi 2-Minute Noodles', brand: 'Maggi', quantity: '4 × 70 g', price: 65, originalPrice: 80, discount: 19, rating: 4.7, ratingCount: 5621, inStock: true, emoji: '🍜', bgColor: '#FFF3E0', subCategory: 'Instant Noodles', isBestSeller: true },
  { id: 'p21', name: 'Knorr Chicken Soup', brand: 'Knorr', quantity: '44 g', price: 45, originalPrice: 55, discount: 18, rating: 4.2, ratingCount: 312, inStock: true, emoji: '🍵', bgColor: '#FFF8E1', subCategory: 'Pasta & Soups' },
  // Tea & Coffee
  { id: 'p22', name: 'Tata Tea Gold', brand: 'Tata', quantity: '500 g', price: 259, originalPrice: 290, discount: 11, rating: 4.6, ratingCount: 2890, inStock: true, emoji: '🍵', bgColor: '#EFEBE9', subCategory: 'Tea', isBestSeller: true },
  { id: 'p23', name: 'Nescafé Classic Coffee', brand: 'Nescafé', quantity: '100 g', price: 199, originalPrice: 230, discount: 13, rating: 4.5, ratingCount: 1890, inStock: true, emoji: '☕', bgColor: '#EFEBE9', subCategory: 'Coffee', isBestSeller: true },
  // Masala
  { id: 'p24', name: 'MDH Garam Masala', brand: 'MDH', quantity: '100 g', price: 75, originalPrice: 90, discount: 17, rating: 4.7, ratingCount: 3120, inStock: true, emoji: '🌶️', bgColor: '#FBE9E7', subCategory: 'Spices', isBestSeller: true },
  { id: 'p25', name: 'Fortune Sunflower Oil', brand: 'Fortune', quantity: '1 L', price: 145, originalPrice: 170, discount: 15, rating: 4.4, ratingCount: 876, inStock: true, emoji: '🌻', bgColor: '#FFF8E1', subCategory: 'Oils & Ghee' },
  { id: 'p26', name: 'Tata Salt', brand: 'Tata', quantity: '1 kg', price: 28, originalPrice: 30, discount: 7, rating: 4.8, ratingCount: 5430, inStock: true, emoji: '🧂', bgColor: '#E3F2FD', subCategory: 'Salt & Sugar', isBestSeller: true },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 10, color: i < full ? '#F9A825' : (i === full && half ? '#F9A825' : '#E0E0E0') }}>
          {i < full ? '★' : (i === full && half ? '⯨' : '★')}
        </Text>
      ))}
    </View>
  )
}

type CartState = Record<string, number>

const ProductCard = ({
  item,
  cart,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  item: Product
  cart: CartState
  onAdd: (id: string) => void
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
}) => {
  const qty = cart[item.id] ?? 0
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handleAdd = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start()
    onAdd(item.id)
  }

  return (
    <View style={pStyles.card}>
      {/* Discount Badge */}
      {item.discount > 0 && (
        <View style={pStyles.discountBadge}>
          <Text style={pStyles.discountText}>{item.discount}% OFF</Text>
        </View>
      )}
      {item.isBestSeller && (
        <View style={pStyles.bestSellerBadge}>
          <Text style={pStyles.bestSellerText}>⭐ Best Seller</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={[pStyles.imageBox, { backgroundColor: item.bgColor }]}>
        <Text style={pStyles.productEmoji}>{item.emoji}</Text>
      </View>

      {/* Info */}
      <View style={pStyles.info}>
        <Text style={pStyles.quantity}>{item.quantity}</Text>
        <Text style={pStyles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={pStyles.brand}>{item.brand}</Text>

        <View style={pStyles.ratingRow}>
          <StarRating rating={item.rating} />
          <Text style={pStyles.ratingCount}> ({item.ratingCount})</Text>
        </View>

        {!item.inStock && (
          <Text style={pStyles.outOfStock}>Out of Stock</Text>
        )}

        <View style={pStyles.priceRow}>
          <View style={{ flex: 1 }}>
            <Text style={pStyles.price}>₹{item.price}</Text>
            {item.discount > 0 && (
              <Text style={pStyles.originalPrice}>₹{item.originalPrice}</Text>
            )}
          </View>

          {item.inStock ? (
            qty === 0 ? (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity style={pStyles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
                  <Text style={pStyles.addBtnText}>ADD</Text>
                  <Text style={pStyles.addBtnPlus}> +</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={pStyles.counterRow}>
                <TouchableOpacity style={pStyles.counterBtn} onPress={() => onDecrease(item.id)}>
                  <Text style={pStyles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={pStyles.counterQty}>{qty}</Text>
                <TouchableOpacity style={pStyles.counterBtn} onPress={() => onIncrease(item.id)}>
                  <Text style={pStyles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TouchableOpacity style={pStyles.notifyBtn}>
              <Text style={pStyles.notifyText}>NOTIFY</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CategoryProductScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const category = route.params?.category ?? { name: 'Products', subCategories: ['All'] }

  const subCategories: string[] = ['All', ...(category.subCategories ?? [])]
  const [activeSub, setActiveSub] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartState>({})
  const sidebarRef = useRef<ScrollView>(null)

  const products = useMemo(() => {
    return ALL_PRODUCTS.filter(p => {
      const matchesSub = activeSub === 'All' || p.subCategory === activeSub
      const matchesSearch = search.trim() === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
      return matchesSub && matchesSearch
    })
  }, [activeSub, search])

  const cartTotal = useMemo(() =>
    Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = ALL_PRODUCTS.find(x => x.id === id)
      return sum + (p ? p.price * qty : 0)
    }, 0), [cart])

  const cartItemCount = useMemo(() =>
    Object.values(cart).reduce((s, q) => s + q, 0), [cart])

  const addToCart = useCallback((id: string) => {
    setCart(prev => ({ ...prev, [id]: 1 }))
  }, [])

  const increase = useCallback((id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }, [])

  const decrease = useCallback((id: string) => {
    setCart(prev => {
      const next = { ...prev }
      if ((next[id] ?? 0) <= 1) delete next[id]
      else next[id]--
      return next
    })
  }, [])

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard item={item} cart={cart} onAdd={addToCart} onIncrease={increase} onDecrease={decrease} />
  ), [cart, addToCart, increase, decrease])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{category.name}</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${category.name}...`}
            placeholderTextColor={THEME.COLOR.textDarkGrey}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Sidebar */}
        <ScrollView
          ref={sidebarRef}
          style={styles.sidebar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {subCategories.map(sub => (
            <TouchableOpacity
              key={sub}
              style={[styles.sideItem, activeSub === sub && styles.sideItemActive]}
              onPress={() => setActiveSub(sub)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sideItemText, activeSub === sub && styles.sideItemTextActive]} numberOfLines={3}>
                {sub}
              </Text>
              {activeSub === sub && <View style={styles.activeBar} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Grid */}
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* Cart Footer */}
      {cartItemCount > 0 && (
        <TouchableOpacity style={styles.cartFooter} onPress={() => navigation.navigate('Cart')} activeOpacity={0.9}>
          <View style={styles.cartFooterLeft}>
            <Text style={styles.cartFooterCount}>{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</Text>
            <Text style={styles.cartFooterSub}>added to cart</Text>
          </View>
          <View style={styles.cartFooterRight}>
            <Text style={styles.cartFooterTotal}>₹{cartTotal}</Text>
            <Text style={styles.cartFooterArrow}> →</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    backgroundColor: '#fff',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: THEME.COLOR.textBlack, fontFamily: THEME.FONTWEIGHT.Bold },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack, marginHorizontal: 12 },
  cartBtn: { position: 'relative', width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  cartIcon: { fontSize: 22 },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontFamily: THEME.FONTWEIGHT.Bold },
  searchWrapper: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.COLOR.textBlack, fontFamily: THEME.FONTWEIGHT.Regular, padding: 0 },
  clearBtn: { fontSize: 14, color: THEME.COLOR.textDarkGrey, paddingLeft: 8 },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { width: SIDEBAR_WIDTH, backgroundColor: THEME.COLOR.bgHalfWhite, borderRightWidth: 1, borderRightColor: THEME.COLOR.border },
  sideItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  sideItemActive: { backgroundColor: '#fff' },
  sideItemText: { fontSize: 11, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textDarkGrey, textAlign: 'center', lineHeight: 15 },
  sideItemTextActive: { fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.bgPurple },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: THEME.COLOR.bgPurple,
  },
  productGrid: { padding: 8, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular },
  cartFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: THEME.COLOR.bgPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  cartFooterLeft: { flex: 1 },
  cartFooterCount: { color: '#fff', fontSize: 14, fontFamily: THEME.FONTWEIGHT.Bold },
  cartFooterSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: THEME.FONTWEIGHT.Regular },
  cartFooterRight: { flexDirection: 'row', alignItems: 'center' },
  cartFooterTotal: { color: '#fff', fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold },
  cartFooterArrow: { color: '#fff', fontSize: 18, fontFamily: THEME.FONTWEIGHT.Bold },
})

const pStyles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: { fontSize: 9, fontFamily: THEME.FONTWEIGHT.Bold, color: '#2E7D32' },
  bestSellerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  bestSellerText: { fontSize: 8, fontFamily: THEME.FONTWEIGHT.Bold, color: '#F57F17' },
  imageBox: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: { fontSize: 48 },
  info: { padding: 10 },
  quantity: { fontSize: 10, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular, marginBottom: 2 },
  name: { fontSize: 12, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack, lineHeight: 16, marginBottom: 2 },
  brand: { fontSize: 10, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingCount: { fontSize: 9, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular },
  outOfStock: { fontSize: 10, color: THEME.COLOR.textRed, fontFamily: THEME.FONTWEIGHT.Bold, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 14, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack },
  originalPrice: { fontSize: 10, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular, textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontFamily: THEME.FONTWEIGHT.Bold },
  addBtnPlus: { color: '#fff', fontSize: 14, fontFamily: THEME.FONTWEIGHT.Bold },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 10,
    overflow: 'hidden',
  },
  counterBtn: { paddingHorizontal: 10, paddingVertical: 7 },
  counterBtnText: { color: '#fff', fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold, lineHeight: 18 },
  counterQty: { color: '#fff', fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold, minWidth: 22, textAlign: 'center' },
  notifyBtn: {
    borderWidth: 1,
    borderColor: THEME.COLOR.bgPurple,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  notifyText: { color: THEME.COLOR.bgPurple, fontSize: 10, fontFamily: THEME.FONTWEIGHT.Bold },
})

export default CategoryProductScreen
