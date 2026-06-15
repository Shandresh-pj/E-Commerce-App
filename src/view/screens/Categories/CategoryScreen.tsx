import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'
import { getData } from '../../../shared/services/main-service'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 3

// ─── Category metadata by API value ──────────────────────────────────────────

type CategoryMeta = { icon: string; bgColor: string; iconBg: string; label: string }

const CATEGORY_META: Record<string, CategoryMeta> = {
  mobile:      { icon: '📱', bgColor: '#E3F2FD', iconBg: '#90CAF9', label: 'Mobiles' },
  mobiles:     { icon: '📱', bgColor: '#E3F2FD', iconBg: '#90CAF9', label: 'Mobiles' },
  electronics: { icon: '💻', bgColor: '#E8EAF6', iconBg: '#9FA8DA', label: 'Electronics' },
  laptop:      { icon: '💻', bgColor: '#EDE7F6', iconBg: '#CE93D8', label: 'Laptops' },
  laptops:     { icon: '💻', bgColor: '#EDE7F6', iconBg: '#CE93D8', label: 'Laptops' },
  grocery:     { icon: '🛒', bgColor: '#E8F5E9', iconBg: '#A5D6A7', label: 'Grocery' },
  clothing:    { icon: '👕', bgColor: '#FCE4EC', iconBg: '#F48FB1', label: 'Clothing' },
  fashion:     { icon: '👗', bgColor: '#FCE4EC', iconBg: '#F48FB1', label: 'Fashion' },
  footwear:    { icon: '👟', bgColor: '#FFF3E0', iconBg: '#FFCC80', label: 'Footwear' },
  appliances:  { icon: '🏠', bgColor: '#E0F7FA', iconBg: '#80DEEA', label: 'Appliances' },
  furniture:   { icon: '🛋️', bgColor: '#EFEBE9', iconBg: '#BCAAA4', label: 'Furniture' },
  toys:        { icon: '🧸', bgColor: '#FFF8E1', iconBg: '#FFE082', label: 'Toys' },
  books:       { icon: '📚', bgColor: '#F3E5F5', iconBg: '#CE93D8', label: 'Books' },
  sports:      { icon: '⚽', bgColor: '#E8F5E9', iconBg: '#A5D6A7', label: 'Sports' },
  beauty:      { icon: '💄', bgColor: '#FCE4EC', iconBg: '#F48FB1', label: 'Beauty' },
  health:      { icon: '💊', bgColor: '#E8F5E9', iconBg: '#A5D6A7', label: 'Health' },
  food:        { icon: '🍱', bgColor: '#FFF3E0', iconBg: '#FFCC80', label: 'Food' },
  beverages:   { icon: '🥤', bgColor: '#E3F2FD', iconBg: '#90CAF9', label: 'Beverages' },
  accessories: { icon: '⌚', bgColor: '#FBE9E7', iconBg: '#FFAB91', label: 'Accessories' },
}

const FALLBACK_PALETTES = [
  { bgColor: '#E8F5E9', iconBg: '#A5D6A7' },
  { bgColor: '#E3F2FD', iconBg: '#90CAF9' },
  { bgColor: '#FFF8E1', iconBg: '#FFE082' },
  { bgColor: '#FCE4EC', iconBg: '#F48FB1' },
  { bgColor: '#EDE7F6', iconBg: '#CE93D8' },
  { bgColor: '#E0F7FA', iconBg: '#80DEEA' },
  { bgColor: '#FFF3E0', iconBg: '#FFCC80' },
  { bgColor: '#F9FBE7', iconBg: '#DCE775' },
]

const getCategoryMeta = (value: string, index: number): CategoryMeta => {
  const key = value.toLowerCase().trim()
  if (CATEGORY_META[key]) return CATEGORY_META[key]
  const palette = FALLBACK_PALETTES[index % FALLBACK_PALETTES.length]
  return {
    icon: '🏪',
    label: value.charAt(0).toUpperCase() + value.slice(1),
    ...palette,
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryItem = {
  value: string
  label: string
  icon: string
  bgColor: string
  iconBg: string
  count: number
}

// ─── Category Card ────────────────────────────────────────────────────────────

const CategoryCard = ({ item, onPress }: { item: CategoryItem; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: item.bgColor }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
      <Text style={styles.icon}>{item.icon}</Text>
    </View>
    <Text style={styles.categoryName} numberOfLines={2}>{item.label}</Text>
    <Text style={styles.itemCount}>{item.count} item{item.count !== 1 ? 's' : ''}</Text>
  </TouchableOpacity>
)

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CategoryScreen = () => {
  const navigation = useNavigation<any>()
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  useFocusEffect(
    useCallback(() => {
      fetchProducts()
    }, [])
  )

  const fetchProducts = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getData('/products')
      if (res?.status === 200 && Array.isArray(res?.data?.data)) {
        setAllProducts(res.data.data)
      } else if (res?.status === 200 && Array.isArray(res?.data)) {
        setAllProducts(res.data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const categories: CategoryItem[] = useMemo(() => {
    const map = new Map<string, number>()
    allProducts.forEach(p => {
      const cat = (p.category ?? '').trim()
      if (!cat) return
      map.set(cat, (map.get(cat) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([value, count], index) => {
      const meta = getCategoryMeta(value, index)
      return { value, count, ...meta }
    })
  }, [allProducts])

  const filtered = useMemo(() =>
    search.trim()
      ? categories.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))
      : categories,
    [categories, search]
  )

  const renderItem = useCallback(({ item }: { item: CategoryItem }) => (
    <CategoryCard
      item={item}
      onPress={() => navigation.navigate('CategoryProducts', {
        category: item,
        products: allProducts.filter(p =>
          (p.category ?? '').toLowerCase() === item.value.toLowerCase()
        ),
      })}
    />
  ), [navigation, allProducts])

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerCount}>
          {loading ? '' : `${categories.length} categories`}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
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

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME.COLOR.bgPurple} />
          <Text style={styles.loadingText}>Loading categories…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Couldn't load categories</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.value}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔎</Text>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textBlack,
  },
  headerCount: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textDarkGrey,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Regular,
    padding: 0,
  },
  clearBtn: { fontSize: 14, color: THEME.COLOR.textDarkGrey, paddingLeft: 8 },
  grid: { padding: 12, paddingBottom: 90 },
  card: {
    width: CARD_WIDTH,
    margin: 6,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 26 },
  categoryName: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textBlack,
    textAlign: 'center',
    lineHeight: 16,
  },
  itemCount: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textDarkGrey,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular },
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 15, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textBlack },
  retryBtn: {
    marginTop: 4,
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  retryTxt: { color: '#fff', fontSize: 14, fontFamily: THEME.FONTWEIGHT.Bold },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular },
})

export default CategoryScreen
