import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
} from 'react-native';
import { useTabBar } from '../../../shared/context/TabBarContext';
import {
  useFocusEffect,
  useNavigation,
  DrawerActions,
} from '@react-navigation/native';

import UserIcon from '../../assets/images/svg/user-bar.svg';
import Defaults from '../../../config/index';
import CartIcon from '../../assets/images/svg/cart.svg';
import SearchSvg from '../../assets/images/svg/search.svg';
import DownArrowSvg from '../../assets/images/svg/DownArrow.svg';
import SettingSvg from '../../assets/images/svg/setting.svg';
import CheckSvg from '../../assets/images/svg/check_small.svg';
import HeartIconWhite from '../../assets/images/svg/Svg2/HeartIconWhite';
import HeartIcon from '../../assets/images/svg/Svg2/HeartIcon';

import {
  fetchAllProducts,
  fetchMyWishlist,
  toggleWishlist,
  getData,
} from '../../../shared/services/main-service';
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../assets/styles/theme';
import styles from './ProductListStyle';
import ProductDetailModal from '../../elements/ProductDetailModal';

const SearchIcon = () => <SearchSvg width={20} height={20} fill="#777" />;

const SORT_OPTIONS = [
  { key: 'relevance' as const, label: 'Relevance' },
  { key: 'newest' as const, label: 'Newest First' },
  { key: 'price_lh' as const, label: 'Price — Low to High' },
  { key: 'price_hl' as const, label: 'Price — High to Low' },
];

type SortKey =
  | 'relevance'
  | 'popularity'
  | 'newest'
  | 'price_lh'
  | 'price_hl'
  | 'rating';
type PriceRange = 'all' | 'under500' | '500to1000' | 'above1000';

// ─── Helper Functions ─────────────────────────────────────────────────────────
const buildImageUrl = (imageName: string): string => {
  const cleaned = imageName.replace(/\\/g, '/').replace(/^\/+/, '');
  return cleaned.startsWith('http')
    ? cleaned
    : `${Defaults.apis.baseUrl}/api/v1/${cleaned}`;
};
// ─── ProductCard ──────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: any;
  isLiked: boolean;
  isInCart: boolean;
  onWishlistToggle: (productId: number) => Promise<void>;
  onAddToCart: (product: any) => Promise<void>;
  navigation: any;
  onPress: (id: number) => void;
}

const ProductCard = ({
  product,
  isLiked,
  isInCart,
  onWishlistToggle,
  onAddToCart,
  navigation,
  onPress,
}: ProductCardProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - 30) / 2;
  const [loading, setLoading] = useState(false);

  let imageUrl: string | null = null;
  if (product.images && product.images.length > 0) {
    imageUrl = buildImageUrl(product.images[0]);
  }

  const handleHeartPress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onWishlistToggle(product.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.card, { width: itemWidth }]}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity
          onPress={handleHeartPress}
          style={styles.heartBtn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={THEME.COLOR.bgPurple} />
          ) : (
            <HeartIcon filled={isLiked} color="#e91e63" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cardRow}
        activeOpacity={0.8}
        onPress={() => onPress(product.id)}
      >
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.detailsBox}>
          <Text
            style={styles.productName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {product.name}
          </Text>
          <Text style={styles.price}>
            Score :{' '}
            {product.ProductVariant && product.ProductVariant.length > 0
              ? parseFloat(product.ProductVariant[0].Price)
              : product.points}
          </Text>

          {/* {Number(product.StockInHand) > 0 && (
  <Text style={{
    fontSize: 11,
    color: Number(product.StockInHand) <= 5 ? "#e53e3e" : "#16a34a",
    marginTop: 4,
    fontWeight: "500",
  }}>
    {Number(product.StockInHand) <= 5
      ? `Only ${Number(product.StockInHand).toFixed(0)} left!`
      : `In Stock: ${Number(product.StockInHand).toFixed(0)}`}
  </Text>
)} */}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.addToCartBtn,
          product.productType === 'Variant'
            ? { backgroundColor: '#e91e63' }
            : isInCart
            ? { backgroundColor: '#10b981' }
            : !product.StockInHand || Number(product.StockInHand) === 0
            ? { backgroundColor: '#d1d5db' }
            : {},
        ]}
        onPress={() => {
          if (product.productType === 'Variant') {
            onPress(product.id);
            return;
          }
          if (!product.StockInHand || Number(product.StockInHand) === 0) return;
          isInCart
            ? (navigation as any).navigate('Cart')
            : onAddToCart(product);
        }}
      >
        <Text style={styles.addToCartText}>
          {product.productType === 'Variant'
            ? 'View Options'
            : !product.StockInHand || Number(product.StockInHand) === 0
            ? 'Out of Stock'
            : isInCart
            ? 'Go to Cart'
            : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FlipkartProductListing() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortKey>('popularity');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange>('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 50;
  const [wishListIds, setWishListIds] = useState<Set<number>>(new Set());
  const [cartIds, setCartIds] = useState<Set<number>>(new Set());
  const { showTabBar, hideTabBar } = useTabBar() || {
    showTabBar: () => {},
    hideTabBar: () => {},
  };
  const scrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar();
    } else if (currentScrollY < scrollY.current) {
      showTabBar();
    }
    scrollY.current = currentScrollY;
  };

  // ── Product Detail Modal State ──
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    }));
  };

  const Productget = useCallback(async () => {
    try {
      setCurrentPage(1);
      const result = await fetchAllProducts(1, PAGE_SIZE);
      const mapped = mapProducts(result.items);
      setApiProducts(mapped);
      setTotalPages(result.totalPages);
      setHasMore(result.currentPage < result.totalPages && mapped.length >= PAGE_SIZE);
    } catch (error) {
      console.log('Productget Error', error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const result = await fetchAllProducts(nextPage, PAGE_SIZE);
      const mapped = mapProducts(result.items);
      if (mapped.length > 0) {
        setApiProducts(prev => [...prev, ...mapped]);
        setCurrentPage(nextPage);
        setTotalPages(result.totalPages);
        setHasMore(nextPage < result.totalPages && mapped.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log('loadMoreProducts Error', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore]);

  const handleProductPress = useCallback(async (id: number) => {
    setDetailProduct(null);
    setDetailLoading(true);
    setDetailModalVisible(true);

    try {
      const response = await getData(`/Product/Detail/${id}`);
      if (response && response.status) {
        const data = response.data?.data ?? response.data ?? null;
        setDetailProduct(data);
      } else {
        setDetailProduct(null);
      }
    } catch (error) {
      console.log('handleProductPress Error', error);
      setDetailProduct(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const items = await fetchMyWishlist();
      const ids = new Set<number>(items.map((item: any) => item.Id));
      setWishListIds(ids);
    } catch (error) {
      console.log('fetchWishlist Error', error);
    }
  }, []);

  const fetchCartIds = useCallback(async () => {
    try {
      const cartItems = (await getAsyncData('cart_items')) || [];
      const ids = new Set<number>(
        Array.isArray(cartItems) ? cartItems.map((item: any) => item.id) : [],
      );
      setCartIds(ids);
    } catch (error) {
      console.log('fetchCartIds Error', error);
    }
  }, []);

  const handleWishlistToggle = async (productId: number) => {
    try {
      const isLiked = wishListIds.has(productId);
      const success = await toggleWishlist(productId, isLiked);

      if (success) {
        setWishListIds(prev => {
          const next = new Set(prev);
          isLiked ? next.delete(productId) : next.add(productId);
          return next;
        });
      }
    } catch (error) {
      console.log('handleWishlistToggle Error', error);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      const existingCart = (await getAsyncData('cart_items')) || [];
      const cartArray = Array.isArray(existingCart) ? existingCart : [];

      const isAlreadyInCart = cartArray.some(
        (item: any) => item.id === product.id,
      );
      if (isAlreadyInCart) {
        (navigation as any).navigate('Cart');
        return;
      }

      const newCart = [...cartArray, { ...product, quantity: 1 }];
      await setAsyncData('cart_items', newCart as any);
      setCartIds(prev => new Set(prev).add(product.id));
      Toast.show('Added to cart successfully!', {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      console.log('handleAddToCart Error', error);
      Toast.show('Failed to add to cart', { duration: Toast.durations.SHORT });
    }
  };

  useFocusEffect(
    useCallback(() => {
      Productget();
      fetchWishlist();
      fetchCartIds();
    }, [Productget, fetchWishlist, fetchCartIds]),
  );

  const BRANDS = ['all', ...Array.from(new Set(apiProducts.map(p => p.brand)))];

  const displayedProducts = useMemo(() => {
    let result = apiProducts.filter(p => {
      const matchSearch = (p.name || '')
        .toLowerCase()
        .includes((searchQuery || '').toLowerCase());
      const matchRating = p.rating >= minRating;
      const matchDiscount = p.discount >= minDiscount;
      const price = p.points;
      const matchPrice =
        selectedPriceRange === 'all'
          ? true
          : selectedPriceRange === 'under500'
          ? price < 500
          : selectedPriceRange === '500to1000'
          ? price >= 500 && price <= 1000
          : price > 1000;
      const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand;
      return (
        matchSearch && matchRating && matchDiscount && matchPrice && matchBrand
      );
    });
    switch (sortOption) {
      case 'newest':
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      case 'price_lh':
        result = [...result].sort((a, b) => a.points - b.points);
        break;
      case 'price_hl':
        result = [...result].sort((a, b) => b.points - a.points);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return result;
  }, [
    apiProducts,
    searchQuery,
    sortOption,
    minRating,
    minDiscount,
    selectedPriceRange,
    selectedBrand,
  ]);

  const activeFilters =
    minRating > 0 ||
    minDiscount > 0 ||
    selectedPriceRange !== 'all' ||
    selectedBrand !== 'all';

  return (
    <>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor="#2a2c40"
        translucent
      />
      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/login-bg.jpg')}
          imageStyle={{ resizeMode: 'cover', alignSelf: 'flex-end' }}
          style={styles.bakcgroundImage}
        >
          <View style={{ flex: 1 }}>
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
                  <Text style={styles.modalTitle}>Sort By</Text>
                  {SORT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      style={styles.modalRow}
                      onPress={() => {
                        setSortOption(opt.key);
                        setShowSortModal(false);
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
                        <CheckSvg
                          width={18}
                          height={18}
                          fill={THEME.COLOR.bgPurple}
                        />
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
                  <Text style={styles.modalTitle}>Filter</Text>
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
                          selectedBrand === brand &&
                            styles.filterOptionChipActive,
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
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => {
                      setMinRating(0);
                      setMinDiscount(0);
                      setSelectedPriceRange('all');
                      setSelectedBrand('all');
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={styles.clearBtnText}>Clear Filters</Text>
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() =>
                    navigation.dispatch(DrawerActions.openDrawer())
                  }
                >
                  <UserIcon />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle]}>Shop</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.cartCountBadge, { marginRight: 15 }]}
                  onPress={() => (navigation as any).navigate('WishList')}
                >
                  <HeartIconWhite filled={false} />
                  <View
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#dd4f4f',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 3,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: THEME.COLOR.bgPurple,
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}
                    >
                      {wishListIds.size ? wishListIds.size : '0'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cartCountBadge, { marginRight: 0 }]}
                  onPress={() => (navigation as any).navigate('Cart')}
                >
                  <CartIcon />
                  <View
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#dd4f4f',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 3,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: '#612C7E',
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}
                    >
                      {cartIds.size ? cartIds.size : '0'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchBase}>
              <View style={styles.searchBar}>
                <SearchIcon />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search products..."
                  placeholderTextColor="#aaa"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 2 }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: '#000000',
                        fontWeight: '600',
                        lineHeight: 18,
                      }}
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  sortOption !== 'popularity' && styles.activeChip,
                ]}
                onPress={() => setShowSortModal(true)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortOption !== 'popularity' && styles.activeChipText,
                  ]}
                >
                  Sort
                </Text>
                <DownArrowSvg
                  width={16}
                  height={16}
                  fill={sortOption !== 'popularity' ? '#612C7E' : '#555'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, activeFilters && styles.activeChip]}
                onPress={() => setShowFilterModal(true)}
              >
                <SettingSvg
                  width={16}
                  height={16}
                  fill={activeFilters ? THEME.COLOR.bgPurple : '#555'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilters && styles.activeChipText,
                  ]}
                >
                  Filter
                </Text>
              </TouchableOpacity>
            </View>

            {initialLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ marginTop: 10, color: '#fff' }}>
                  Loading products...
                </Text>
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
                    isLiked={wishListIds.has(item.id)}
                    isInCart={cartIds.has(item.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                    onPress={handleProductPress}
                    navigation={navigation}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No products found</Text>
                  </View>
                }
                ListFooterComponent={
                  <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
                    {loadingMore ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : !hasMore && apiProducts.length > 0 ? (
                      <Text style={{ color: '#aaa', fontSize: 13 }}>All products loaded</Text>
                    ) : null}
                  </View>
                }
              />
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}
