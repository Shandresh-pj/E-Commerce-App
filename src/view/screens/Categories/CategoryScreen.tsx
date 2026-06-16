import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'
import { useResponsive } from '../../assets/styles/responsive'
import { fetchAllProductsComplete } from '../../../shared/services/main-service'

const GUTTER = 12

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

const CategoryCard = React.memo(({
  item,
  width,
  onPress,
}: {
  item: CategoryItem
  width: number
  onPress: () => void
}) => (
  <TouchableOpacity
    style={[styles.card, { width }]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={`${item.label}, ${item.count} item${item.count !== 1 ? 's' : ''}`}
  >
    <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
      <Text style={styles.icon}>{item.icon}</Text>
    </View>
    <Text style={styles.categoryName} numberOfLines={2}>{item.label}</Text>
    <View style={styles.countPill}>
      <Text style={styles.itemCount}>{item.count} item{item.count !== 1 ? 's' : ''}</Text>
    </View>
  </TouchableOpacity>
))

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CategoryScreen = () => {
  const navigation = useNavigation<any>()
  const r = useResponsive()
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  const hPad = r.select({ phone: 16, tablet: 24, large: 32 })
  const numColumns = r.columns(3, 4, 6)
  const cardWidth = r.cellWidth(r.width, numColumns, hPad, GUTTER)

  useFocusEffect(
    useCallback(() => {
      fetchProducts()
    }, [])
  )

  const fetchProducts = async () => {
    setLoading(true)
    setError(false)
    try {
      const products = await fetchAllProductsComplete()
      setAllProducts(products)
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
      width={cardWidth}
      onPress={() => navigation.navigate('CategoryProducts', {
        category: item,
        products: allProducts.filter(p =>
          (p.category ?? '').toLowerCase() === item.value.toLowerCase()
        ),
      })}
    />
  ), [navigation, allProducts, cardWidth])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>Browse products by collection</Text>
        </View>
        {!loading && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{categories.length}</Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchWrapper, { paddingHorizontal: hPad }]}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories…"
            placeholderTextColor={THEME.COLOR.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME.COLOR.primary} />
          <Text style={styles.loadingText}>Loading categories…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Couldn't load categories</Text>
          <Text style={styles.errorSubtitle}>Check your connection and try again</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts} activeOpacity={0.85}>
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={filtered}
          keyExtractor={item => item.value}
          numColumns={numColumns}
          renderItem={renderItem}
          contentContainerStyle={[styles.grid, { paddingHorizontal: hPad }]}
          columnWrapperStyle={{ gap: GUTTER, marginBottom: GUTTER }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔎</Text>
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtitle}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.COLOR.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: THEME.COLOR.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textSecondary,
    marginTop: 2,
  },
  headerBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: THEME.COLOR.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.primaryDark,
  },
  searchWrapper: {
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: THEME.COLOR.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Regular,
    padding: 0,
  },
  clearBtn: { fontSize: 13, color: THEME.COLOR.textSecondary, paddingLeft: 8 },
  grid: { paddingTop: 16, paddingBottom: 100 },
  card: {
    borderRadius: THEME.RADIUS.large,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surface,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    ...THEME.SHADOW.card,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: { fontSize: 26 },
  categoryName: {
    fontSize: 12.5,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  countPill: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.RADIUS.pill,
    backgroundColor: THEME.COLOR.surfaceAlt,
  },
  itemCount: {
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: THEME.COLOR.textSecondary,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 14, color: THEME.COLOR.textSecondary, fontFamily: THEME.FONTWEIGHT.Regular },
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  errorSubtitle: { fontSize: 13, fontFamily: THEME.FONTWEIGHT.Regular, color: THEME.COLOR.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: 4,
    backgroundColor: THEME.COLOR.primary,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: 32,
    paddingVertical: 12,
    ...THEME.SHADOW.card,
  },
  retryTxt: { color: '#fff', fontSize: 14, fontFamily: THEME.FONTWEIGHT.Bold },
  empty: { alignItems: 'center', marginTop: 60, gap: 6 },
  emptyIcon: { fontSize: 48, marginBottom: 6 },
  emptyText: { fontSize: 16, color: THEME.COLOR.textPrimary, fontFamily: THEME.FONTWEIGHT.Bold },
  emptySubtitle: { fontSize: 13, color: THEME.COLOR.textSecondary, fontFamily: THEME.FONTWEIGHT.Regular },
})

export default CategoryScreen
