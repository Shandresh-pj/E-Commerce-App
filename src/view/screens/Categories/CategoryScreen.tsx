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
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'
import { useResponsive } from '../../assets/styles/responsive'
import { fetchCategories } from '../../../shared/services/main-service'
import Defaults from '../../../config'

const GUTTER = 12

const BASE_URL = `http://${Defaults.domain}`

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

type Category = {
  id: number
  name: string
  description: string
  image: string | null
  parent_id: number | null
  status: boolean
}

const CategoryCard = React.memo(({
  item,
  width,
  palette,
  onPress,
}: {
  item: Category
  width: number
  palette: { bgColor: string; iconBg: string }
  onPress: () => void
}) => {
  const imageUri = item.image ? `${BASE_URL}${item.image}` : null

  return (
    <TouchableOpacity
      style={[styles.card, { width, backgroundColor: palette.bgColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <View style={[styles.imageContainer, { backgroundColor: palette.iconBg }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.placeholderIcon}>🏪</Text>
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
      {item.description ? (
        <Text style={styles.categoryDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}
    </TouchableOpacity>
  )
})

const CategoryScreen = () => {
  const navigation = useNavigation<any>()
  const r = useResponsive()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  const hPad = r.select({ phone: 16, tablet: 24, large: 32 })
  const numColumns = r.columns(3, 4, 6)
  const cardWidth = r.cellWidth(r.width, numColumns, hPad, GUTTER)

  useFocusEffect(
    useCallback(() => {
      loadCategories()
    }, [])
  )

  const loadCategories = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchCategories()
      setCategories(data.filter(c => c.status !== false))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() =>
    search.trim()
      ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      : categories,
    [categories, search]
  )

  const renderItem = useCallback(({ item, index }: { item: Category; index: number }) => (
    <CategoryCard
      item={item}
      width={cardWidth}
      palette={FALLBACK_PALETTES[index % FALLBACK_PALETTES.length]}
      onPress={() => navigation.navigate('CategoryProducts', { category: item })}
    />
  ), [navigation, cardWidth])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

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
          <TouchableOpacity style={styles.retryBtn} onPress={loadCategories} activeOpacity={0.85}>
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={filtered}
          keyExtractor={item => String(item.id)}
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
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    ...THEME.SHADOW.card,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  categoryImage: {
    width: 64,
    height: 64,
  },
  placeholderIcon: { fontSize: 28 },
  categoryName: {
    fontSize: 12.5,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryDesc: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
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
