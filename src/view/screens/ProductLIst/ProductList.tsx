import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { useTabBar } from '../../../shared/context/TabBarContext'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import Defaults from '../../../config/index'
import CartIcon from '../../assets/images/svg/cart.svg'
import SearchSvg from '../../assets/images/svg/search.svg'
import DownArrowSvg from '../../assets/images/svg/DownArrow.svg'
import SettingSvg from '../../assets/images/svg/setting.svg'
import CheckSvg from '../../assets/images/svg/check_small.svg'
import HeartIconWhite from '../../assets/images/svg/Svg2/HeartIconWhite'
import HeartIcon from '../../assets/images/svg/Svg2/HeartIcon'

import {
  fetchAllProducts,
  fetchMyWishlist,
  toggleWishlist,
  getData,
} from '../../../shared/services/main-service'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import { THEME } from '../../assets/styles/theme'
import styles from './ProductListStyle'
import ProductDetailModal from '../../elements/ProductDetailModal'
import AppHeader, { HeaderIconButton } from '../../elements/AppHeader'
import PrimaryButton from '../../elements/PrimaryButton'
import EmptyState from '../../elements/EmptyState'
import { ProductCardSkeleton } from '../../elements/Skeleton'

const SearchIcon = () => (
  <SearchSvg width={18} height={18} fill={THEME.COLOR.textTertiary} />
)

const SORT_OPTIONS = [
  { key: 'relevance' as const, label: 'Relevance' },
  { key: 'newest' as const, label: 'Newest First' },
  { key: 'price_lh' as const, label: 'Price — Low to High' },
  { key: 'price_hl' as const, label: 'Price — High to Low' },
]

type SortKey =
  | 'relevance'
  | 'popularity'
  | 'newest'
  | 'price_lh'
  | 'price_hl'
  | 'rating'
type PriceRange = 'all' | 'under500' | '500to1000' | 'above1000'

// ─── Helper Functions ─────────────────────────────────────────────────────────
const buildImageUrl = (imageName: string): string => {
  const cleaned = imageName.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http')
    ? cleaned
    : `${Defaults.apis.baseUrl}/api/${cleaned}`
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: any
  width: number
  isLiked: boolean
  isInCart: boolean
  onWishlistToggle: (productId: number) => Promise<void>
  onAddToCart: (product: any) => Promise<void>
  navigation: any
  onPress: (id: number) => void
}

const ProductCard = ({
  product,
  width,
  isLiked,
  isInCart,
  onWishlistToggle,
  onAddToCart,
  navigation,
  onPress,
}: ProductCardProps) => {
  const [loading, setLoading] = useState(false)

  let imageUrl: string | null = null
  if (product.images && product.images.length > 0) {
    imageUrl = buildImageUrl(product.images[0])
  }

  const handleHeartPress = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onWishlistToggle(product.id)
    } finally {
      setLoading(false)
    }
  }

  const isVariant = product.productType === 'Variant'
  const isOutOfStock =
    !isVariant && (!product.StockInHand || Number(product.StockInHand) === 0)
  const stockNum = Number(product.StockInHand)
  const showStock = !isVariant && !isNaN(stockNum) && stockNum > 0

  const score =
    product.ProductVariant && product.ProductVariant.length > 0
      ? parseFloat(product.ProductVariant[0].Price)
      : product.points

  const ctaLabel = isVariant
    ? 'View Options'
    : isOutOfStock
      ? 'Out of Stock'
      : isInCart
        ? 'Go to Cart'
        : 'Add to Cart'

  const handleCta = () => {
    if (isVariant) return onPress(product.id)
    if (isOutOfStock) return
    if (isInCart) return navigation.navigate('Cart')
    onAddToCart(product)
  }

  return (
    <View style={[styles.card, { width }]}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(product.id)}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No Image</Text>
          )}
          <TouchableOpacity
            onPress={handleHeartPress}
            style={styles.heartBtn}
            disabled={loading}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={THEME.COLOR.primary} />
            ) : (
              <HeartIcon
                filled={isLiked}
                size={18}
                color={isLiked ? THEME.COLOR.primary : THEME.COLOR.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.scorePill}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>

          {showStock ? (
            <Text
              style={[
                styles.stockText,
                stockNum <= 5 ? styles.stockLow : styles.stockIn,
              ]}
            >
              {stockNum <= 5 ? `Only ${stockNum} left` : 'In stock'}
            </Text>
          ) : isOutOfStock ? (
            <Text style={[styles.stockText, styles.stockOut]}>Out of stock</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <PrimaryButton
        label={ctaLabel}
        size="sm"
        variant={isOutOfStock ? 'primary' : isInCart && !isVariant ? 'success' : 'primary'}
        disabled={isOutOfStock}
        onPress={handleCta}
        style={styles.ctaWrap}
      />
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProductListing() {
  const navigation = useNavigation()
  const { width: screenWidth } = useWindowDimensions()
  const itemWidth = (screenWidth - THEME.SPACING.md * 2 - THEME.SPACING.md) / 2

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortKey>('popularity')
  const [showSortModal, setShowSortModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [minDiscount, setMinDiscount] = useState(0)
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange>('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [apiProducts, setApiProducts] = useState<any[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const PAGE_SIZE = 50
  const [wishListIds, setWishListIds] = useState<Set<number>>(new Set())
  const [cartIds, setCartIds] = useState<Set<number>>(new Set())
  const { showTabBar, hideTabBar } = useTabBar() || {
    showTabBar: () => {},
    hideTabBar: () => {},
  }
  const scrollY = useRef(0)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar()
    } else if (currentScrollY < scrollY.current) {
      showTabBar()
    }
    scrollY.current = currentScrollY
  }

  // ── Product Detail Modal State ──
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailProduct, setDetailProduct] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const mapProducts = (dataList: any[]) => {
    return dataList.map((item: any) => ({
      id: item.Id,
      code: item.Code,
      points: item.Points || 0,
      productType: item.ProductType ?? 'Single',
      StockInHand: item.StockInHand ? item.StockInHand : 'N/A',
      images: item.Images?.map((img: any) => img.ImageName) ?? [],
      name:
        item.ProductTranslations && item.ProductTranslations.length > 0
          ? item.ProductTranslations[0].Name
          : item.Code,
      ProductVariant: item.ProductVariant ?? null,
      brand: 'Generic',
      rating: 4.0,
      discount: 0,
      emoji: item.Code,
    }))
  }

  const Productget = useCallback(async () => {
    try {
      setCurrentPage(1)
      const result = await fetchAllProducts(1, PAGE_SIZE)
      const mapped = mapProducts(result.items)
      setApiProducts(mapped)
      setTotalPages(result.totalPages)
      setHasMore(
        result.currentPage < result.totalPages && mapped.length >= PAGE_SIZE,
      )
    } catch (error) {
      console.log('Productget Error', error)
    } finally {
      setInitialLoading(false)
    }
  }, [])

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return
    const nextPage = currentPage + 1
    setLoadingMore(true)
    try {
      const result = await fetchAllProducts(nextPage, PAGE_SIZE)
      const mapped = mapProducts(result.items)
      if (mapped.length > 0) {
        setApiProducts(prev => [...prev, ...mapped])
        setCurrentPage(nextPage)
        setTotalPages(result.totalPages)
        setHasMore(nextPage < result.totalPages && mapped.length >= PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.log('loadMoreProducts Error', error)
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, loadingMore, hasMore])

  const handleProductPress = useCallback(async (id: number) => {
    setDetailProduct(null)
    setDetailLoading(true)
    setDetailModalVisible(true)

    try {
      const response = await getData(`/Product/Detail/${id}`)
      if (response && response.status) {
        const data = response.data?.data ?? response.data ?? null
        setDetailProduct(data)
      } else {
        setDetailProduct(null)
      }
    } catch (error) {
      console.log('handleProductPress Error', error)
      setDetailProduct(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const fetchWishlist = useCallback(async () => {
    try {
      const items = await fetchMyWishlist()
      const ids = new Set<number>(items.map((item: any) => item.Id))
      setWishListIds(ids)
    } catch (error) {
      console.log('fetchWishlist Error', error)
    }
  }, [])

  const fetchCartIds = useCallback(async () => {
    try {
      const cartItems = (await getAsyncData('cart_items')) || []
      const ids = new Set<number>(
        Array.isArray(cartItems) ? cartItems.map((item: any) => item.id) : [],
      )
      setCartIds(ids)
    } catch (error) {
      console.log('fetchCartIds Error', error)
    }
  }, [])

  const handleWishlistToggle = async (productId: number) => {
    try {
      const isLiked = wishListIds.has(productId)
      const success = await toggleWishlist(productId, isLiked)

      if (success) {
        setWishListIds(prev => {
          const next = new Set(prev)
          isLiked ? next.delete(productId) : next.add(productId)
          return next
        })
      }
    } catch (error) {
      console.log('handleWishlistToggle Error', error)
    }
  }

  const handleAddToCart = async (product: any) => {
    try {
      const existingCart = (await getAsyncData('cart_items')) || []
      const cartArray = Array.isArray(existingCart) ? existingCart : []

      const isAlreadyInCart = cartArray.some(
        (item: any) => item.id === product.id,
      )
      if (isAlreadyInCart) {
        ;(navigation as any).navigate('Cart')
        return
      }

      const newCart = [...cartArray, { ...product, quantity: 1 }]
      await setAsyncData('cart_items', newCart as any)
      setCartIds(prev => new Set(prev).add(product.id))
      Toast.show('Added to cart successfully!', {
        duration: Toast.durations.SHORT,
      })
    } catch (error) {
      console.log('handleAddToCart Error', error)
      Toast.show('Failed to add to cart', { duration: Toast.durations.SHORT })
    }
  }

  useFocusEffect(
    useCallback(() => {
      Productget()
      fetchWishlist()
      fetchCartIds()
    }, [Productget, fetchWishlist, fetchCartIds]),
  )

  const BRANDS = ['all', ...Array.from(new Set(apiProducts.map(p => p.brand)))]

  const displayedProducts = useMemo(() => {
    let result = apiProducts.filter(p => {
      const matchSearch = (p.name || '')
        .toLowerCase()
        .includes((searchQuery || '').toLowerCase())
      const matchRating = p.rating >= minRating
      const matchDiscount = p.discount >= minDiscount
      const price = p.points
      const matchPrice =
        selectedPriceRange === 'all'
          ? true
          : selectedPriceRange === 'under500'
            ? price < 500
            : selectedPriceRange === '500to1000'
              ? price >= 500 && price <= 1000
              : price > 1000
      const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand
      return (
        matchSearch && matchRating && matchDiscount && matchPrice && matchBrand
      )
    })
    switch (sortOption) {
      case 'newest':
        result = [...result].sort((a, b) => b.id - a.id)
        break
      case 'price_lh':
        result = [...result].sort((a, b) => a.points - b.points)
        break
      case 'price_hl':
        result = [...result].sort((a, b) => b.points - a.points)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return result
  }, [
    apiProducts,
    searchQuery,
    sortOption,
    minRating,
    minDiscount,
    selectedPriceRange,
    selectedBrand,
  ])

  const activeFilters =
    minRating > 0 ||
    minDiscount > 0 ||
    selectedPriceRange !== 'all' ||
    selectedBrand !== 'all'

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <AppHeader
        title="Shop"
        leftIcon="menu"
        right={
          <>
            <HeaderIconButton
              onPress={() => (navigation as any).navigate('WishList')}
              badge={wishListIds.size}
            >
              <HeartIconWhite filled={false} />
            </HeaderIconButton>
            <HeaderIconButton
              onPress={() => (navigation as any).navigate('Cart')}
              badge={cartIds.size}
            >
              <CartIcon />
            </HeaderIconButton>
          </>
        }
      />

      {/* ── Product Detail Modal ── */}
      <ProductDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        productDetail={detailProduct}
        loading={detailLoading}
        onAddToCart={handleAddToCart}
        cartIds={cartIds}
        navigation={navigation}
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalRow}
                onPress={() => {
                  setSortOption(opt.key)
                  setShowSortModal(false)
                }}
              >
                <Text
                  style={[
                    styles.modalRowText,
                    sortOption === opt.key && styles.modalRowTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {sortOption === opt.key && (
                  <CheckSvg width={18} height={18} fill={THEME.COLOR.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filters</Text>
            <Text style={styles.filterGroupLabel}>Score Range</Text>
            <View style={styles.filterChipsRow}>
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'under500', label: 'Under 500' },
                  { key: '500to1000', label: '500 – 1000' },
                  { key: 'above1000', label: 'Above 1000' },
                ] as { key: PriceRange; label: string }[]
              ).map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.filterOptionChip,
                    selectedPriceRange === item.key &&
                      styles.filterOptionChipActive,
                  ]}
                  onPress={() => setSelectedPriceRange(item.key)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedPriceRange === item.key &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterGroupLabel}>Brand</Text>
            <View style={styles.filterChipsRow}>
              {BRANDS.map(brand => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.filterOptionChip,
                    selectedBrand === brand && styles.filterOptionChipActive,
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedBrand === brand &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {brand === 'all' ? 'All' : brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalFooter}>
              <PrimaryButton
                label="Clear"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => {
                  setMinRating(0)
                  setMinDiscount(0)
                  setSelectedPriceRange('all')
                  setSelectedBrand('all')
                }}
              />
              <PrimaryButton
                label="Apply"
                style={{ flex: 1 }}
                onPress={() => setShowFilterModal(false)}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search + filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            placeholderTextColor={THEME.COLOR.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtnInline}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.chip,
              sortOption !== 'popularity' && styles.chipActive,
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <Text
              style={[
                styles.chipText,
                sortOption !== 'popularity' && styles.chipTextActive,
              ]}
            >
              Sort
            </Text>
            <DownArrowSvg
              width={14}
              height={14}
              fill={
                sortOption !== 'popularity'
                  ? THEME.COLOR.primary
                  : THEME.COLOR.textSecondary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, activeFilters && styles.chipActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <SettingSvg
              width={14}
              height={14}
              fill={
                activeFilters ? THEME.COLOR.primary : THEME.COLOR.textSecondary
              }
            />
            <Text
              style={[
                styles.chipText,
                activeFilters && styles.chipTextActive,
              ]}
            >
              Filter
            </Text>
          </TouchableOpacity>
          {!initialLoading && (
            <Text style={styles.resultCount}>
              {displayedProducts.length} item
              {displayedProducts.length === 1 ? '' : 's'}
            </Text>
          )}
        </View>
      </View>

      {initialLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} width={itemWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={itemWidth}
              isLiked={wishListIds.has(item.id)}
              isInCart={cartIds.has(item.id)}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              onPress={handleProductPress}
              navigation={navigation}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<SearchSvg width={40} height={40} fill={THEME.COLOR.primary} />}
              title="No products found"
              subtitle="Try adjusting your search or filters to find what you're looking for."
              ctaLabel={activeFilters ? 'Clear Filters' : undefined}
              onCtaPress={
                activeFilters
                  ? () => {
                      setMinRating(0)
                      setMinDiscount(0)
                      setSelectedPriceRange('all')
                      setSelectedBrand('all')
                      setSearchQuery('')
                    }
                  : undefined
              }
            />
          }
          ListFooterComponent={
            <View style={styles.footer}>
              {loadingMore ? (
                <ActivityIndicator size="small" color={THEME.COLOR.primary} />
              ) : !hasMore && apiProducts.length > 0 ? (
                <Text style={styles.footerText}>All products loaded</Text>
              ) : null}
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
