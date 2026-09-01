import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  fetchProductsByCategory,
  fetchProductDetail,
  fetchCategories,
  fetchApiCart,
  addToApiCart,
  removeFromApiCart,
  fetchMyWishlist,
  toggleWishlist,
} from '../../../shared/services/main-service';
import Toast from 'react-native-root-toast';
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage';
import { useTabBar } from '../../../shared/context/TabBarContext';
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';
import { useResponsive } from '../../../hooks/useResponsive';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { SkeletonState } from '../../../design-system/components/SkeletonState';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';
import { buildImageUrl, getFallbackImage } from '../../../shared/utils/imageHelper';
import { BlurhashImage } from '../../../design-system/components/BlurhashImage';

const { width: W } = Dimensions.get('window');
const SIDEBAR_WIDTH = 76;

type ApiProduct = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  images: string[] | null;
  product_type: 'simple' | 'variant';
  stock_in_hand: number;
  status: 'active' | 'inactive';
  variants: any[];
  [key: string]: any;
};

type SortKey = 'default' | 'price_lh' | 'price_hl' | 'stock';

const FILTER_CHIPS = [
  { key: 'default', label: '↕ All' },
  { key: 'stock', label: '⚡ In Stock' },
  { key: 'price_lh', label: 'Price: Low' },
  { key: 'price_hl', label: 'Price: High' },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  Electronics: '⚡',
  Fashion: '👗',
  Home: '🏡',
  Beauty: '🧴',
  Sports: '⚽',
  Automotive: '🚗',
  Groceries: '🥦',
  Beverages: '🥤',
};

const ProductCard = React.memo(({
  item,
  qty,
  isWished,
  cardWidth,
  onAdd,
  onIncrease,
  onDecrease,
  onPress,
  onToggleWishlist,
}: {
  item: ApiProduct;
  qty: number;
  isWished: boolean;
  cardWidth: number;
  onAdd: (id: number) => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onPress: (id: number) => void;
  onToggleWishlist: (id: number) => void;
}) => {
  const { tokens, isDark } = useTheme();
  const initialImg = buildImageUrl(item.image, item.name, 'product');
  const [imgSrc, setImgSrc] = useState(initialImg);

  useEffect(() => {
    setImgSrc(buildImageUrl(item.image, item.name, 'product'));
  }, [item.image, item.name]);

  const inStock = (item.stock_in_hand ?? 1) > 0;
  const price = parseFloat(item.price) || 0;
  const mrp = parseFloat(item.compare_at_price || item.mrp) || 0;
  const discount = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <View
      style={[
        cardStyles.root,
        {
          width: cardWidth,
          backgroundColor: tokens.surface.card,
          borderColor: tokens.border.default,
        },
      ]}
    >
      <View style={{ position: 'relative' }}>
        <TouchableOpacity activeOpacity={0.88} onPress={() => onPress(item.id)}>
          <View style={[cardStyles.imgBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
            {discount > 0 && (
              <View style={cardStyles.discountBadge}>
                <Text style={cardStyles.discountText}>{discount}% OFF</Text>
              </View>
            )}
            <BlurhashImage
              category={item.name}
              source={{ uri: imgSrc }}
              style={cardStyles.img}
              resizeMode="cover"
              onError={() => {
                const fallback = getFallbackImage(item.name, 'product');
                if (imgSrc !== fallback) {
                  setImgSrc(fallback);
                }
              }}
            />
            {!inStock && (
              <View style={cardStyles.oosOverlay}>
                <Text style={cardStyles.oosLabel}>Out of Stock</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Wishlist Toggle */}
        <TouchableOpacity
          style={[cardStyles.heartBtn, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}
          onPress={() => onToggleWishlist(item.id)}
          activeOpacity={0.7}
        >
          <SvkIcon name={isWished ? 'heartFilled' : 'heart'} size={16} color={isWished ? '#EF4444' : tokens.content.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={cardStyles.body}>
        <Text style={[cardStyles.name, { color: tokens.content.primary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[cardStyles.unit, { color: tokens.content.tertiary }]}>
          {item.unit || item.weight || 'Official SVK Guarantee'}
        </Text>

        <View style={cardStyles.priceRow}>
          <View>
            <Text style={[cardStyles.price, { color: tokens.content.primary }]}>₹{price.toFixed(2)}</Text>
            {mrp > price && <Text style={[cardStyles.mrp, { color: tokens.content.tertiary }]}>₹{mrp.toFixed(2)}</Text>}
          </View>

          {inStock && (
            qty === 0 ? (
              <TouchableOpacity
                style={[cardStyles.addBtn, { backgroundColor: tokens.brand.primary }]}
                onPress={() => onAdd(item.id)}
                activeOpacity={0.85}
              >
                <Text style={cardStyles.addTxt}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={[cardStyles.stepper, { backgroundColor: tokens.brand.primary }]}>
                <TouchableOpacity style={cardStyles.stepBtn} onPress={() => onDecrease(item.id)}>
                  <Text style={cardStyles.stepTxt}>−</Text>
                </TouchableOpacity>
                <Text style={cardStyles.stepQty}>{qty}</Text>
                <TouchableOpacity style={cardStyles.stepBtn} onPress={() => onIncrease(item.id)}>
                  <Text style={cardStyles.stepTxt}>+</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </View>
    </View>
  );
});

export const CategoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  const { width: screenWidth, gridColumns } = useResponsive();
  const navigation = useNavigation<any>();
  const { showTabBar } = useTabBar();

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sort, setSort] = useState<SortKey>('default');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ApiProductDetail | null>(null);

  const productAreaWidth = screenWidth - SIDEBAR_WIDTH;
  const cardWidth = (productAreaWidth - SPACING.md * 2 - SPACING.xs) / Math.max(1, gridColumns - 1);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetchCategories();
      const filtered = cats.filter((c: any) => c.status !== false);
      setAllCategories(filtered);
      setActiveCategory((prev: any) => prev ?? filtered[0] ?? null);
    } catch (e) {
      console.log('loadCategories error:', e);
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const raw = await fetchApiCart();
      if (raw) {
        const mapped = raw.map((rawItem: any) => {
          const product = rawItem.product ?? rawItem.Product ?? rawItem;
          const prodId = Number(product.id ?? product.Id ?? rawItem.product_id ?? rawItem.ProductId ?? rawItem.id);
          return {
            cartItemId: rawItem.id ?? rawItem.Id,
            id: prodId,
            name: product.name ?? rawItem.name ?? 'Product',
            price: parseFloat(product.price ?? rawItem.price ?? '0') || 0,
            quantity: Number(rawItem.quantity ?? rawItem.Quantity ?? 1),
          };
        });
        setCartItems(mapped);
      }
    } catch (e) {
      console.log('loadCart error:', e);
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      const dataList = await fetchMyWishlist();
      if (dataList) {
        const ids = dataList.map((item: any) => {
          const product = item.product ?? item.Product ?? item;
          return Number(product.id ?? product.Id ?? item.product_id ?? item.ProductId ?? item.id);
        });
        setWishlistProductIds(new Set(ids));
      }
    } catch (e) {
      console.log('loadWishlist error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      showTabBar();
      loadCategories();
      loadCart();
      loadWishlist();
    }, [showTabBar, loadCategories, loadCart, loadWishlist])
  );

  const loadProducts = useCallback(async () => {
    if (!activeCategory) return;
    setLoadingProducts(true);
    try {
      const data = await fetchProductsByCategory(activeCategory.id, activeCategory.name);
      setProducts(data);
    } finally {
      setLoadingProducts(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory) loadProducts();
  }, [activeCategory, loadProducts]);

  const toggleWish = useCallback(
    async (id: number) => {
      const targetId = Number(id);
      const isWished = wishlistProductIds.has(targetId);
      setWishlistProductIds((prev) => {
        const next = new Set(prev);
        if (isWished) next.delete(targetId);
        else next.add(targetId);
        return next;
      });

      const success = await toggleWishlist(targetId, isWished);
      if (success) {
        Toast.show(isWished ? 'Removed from Wishlist' : 'Added to Wishlist ♥', { duration: Toast.durations.SHORT });
      }
    },
    [wishlistProductIds]
  );

  const handleAddToCart = async (id: number) => {
    const targetId = Number(id);
    const success = await addToApiCart(targetId, 1);
    if (success) {
      Toast.show('Item added to Cart', { duration: Toast.durations.SHORT });
      loadCart();
    }
  };

  const handleQuantityIncrease = async (id: number) => {
    const targetId = Number(id);
    const existing = cartItems.find((c) => Number(c.id) === targetId);
    if (existing) {
      await addToApiCart(targetId, 1);
      loadCart();
    }
  };

  const handleQuantityDecrease = async (id: number) => {
    const targetId = Number(id);
    const existing = cartItems.find((c) => Number(c.id) === targetId);
    if (existing) {
      if (existing.quantity === 1) {
        await removeFromApiCart(existing.cartItemId || targetId);
      } else {
        await addToApiCart(targetId, -1);
      }
      loadCart();
    }
  };

  const openProductDetail = async (id: number) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const detail = await fetchProductDetail(id);
      if (detail) {
        setDetailProduct(detail);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (sort === 'stock') {
      result = result.filter((p) => (p.stock_in_hand ?? 1) > 0);
    } else if (sort === 'price_lh') {
      result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sort === 'price_hl') {
      result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }
    return result;
  }, [products, sort]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: tokens.surface.base, borderBottomColor: tokens.border.subtle }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>Explore Categories</Text>
          <Pressable onPress={() => navigation.navigate('Search')} style={styles.searchIconBtn}>
            <SvkIcon name="search" size={20} color={tokens.content.primary} />
          </Pressable>
        </View>
      </View>

      {/* Main Dual-Column Body */}
      <View style={styles.mainBody}>
        {/* Left Category Rail Sidebar */}
        <View style={[styles.sidebar, { backgroundColor: tokens.surface.secondary, borderRightColor: tokens.border.subtle }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
            {allCategories.map((cat) => {
              const isActive = activeCategory?.id === cat.id;
              const emoji = CATEGORY_EMOJIS[cat.name] || '📦';
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat)}
                  style={[
                    styles.sidebarItem,
                    isActive && { backgroundColor: tokens.brand.primarySoft, borderColor: tokens.brand.primary },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sidebarEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.sidebarLabel,
                      { color: isActive ? tokens.brand.primary : tokens.content.primary },
                      isActive && { fontWeight: '700' },
                    ]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Category Product Panel */}
        <View style={styles.productPanel}>
          {/* Active Category Header Banner */}
          {activeCategory && (
            <View style={styles.categoryBanner}>
              <Text style={[styles.categoryBannerTitle, { color: tokens.content.primary }]}>
                {activeCategory.name}
              </Text>
              <Text style={[styles.categoryBannerCount, { color: tokens.content.tertiary }]}>
                {filteredProducts.length} Live Items Available
              </Text>

              {/* Filter Sort Rail */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRail}>
                {FILTER_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip.key}
                    onPress={() => setSort(chip.key as SortKey)}
                    style={[
                      styles.filterChip,
                      { backgroundColor: tokens.surface.secondary, borderColor: tokens.border.default },
                      sort === chip.key && { backgroundColor: tokens.brand.primary, borderColor: tokens.brand.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: tokens.content.primary },
                        sort === chip.key && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Product Grid / Loading / Empty */}
          {loadingProducts ? (
            <View style={styles.loadingGrid}>
              {[1, 2, 3, 4].map((n) => (
                <View key={n} style={{ width: cardWidth, marginBottom: 12 }}>
                  <SkeletonState width="100%" height={180} radius="lg" />
                </View>
              ))}
            </View>
          ) : filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              numColumns={Math.max(1, gridColumns - 1)}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.gridContent}
              renderItem={({ item }) => {
                const cartMatch = cartItems.find((c) => c.id === item.id);
                const qty = cartMatch ? cartMatch.quantity : 0;
                const isWished = wishlistProductIds.has(item.id);
                return (
                  <ProductCard
                    item={item}
                    qty={qty}
                    isWished={isWished}
                    cardWidth={cardWidth}
                    onAdd={handleAddToCart}
                    onIncrease={handleQuantityIncrease}
                    onDecrease={handleQuantityDecrease}
                    onPress={openProductDetail}
                    onToggleWishlist={toggleWish}
                  />
                );
              }}
            />
          ) : (
            <EmptyState
              icon="bag"
              title="Category Currently Empty"
              subtitle="Pull down or select another category to explore our collection."
            />
          )}
        </View>
      </View>

      {/* Floating Glassmorphic Cart Bar */}
      {totalCartCount > 0 && (
        <View style={[styles.floatingCartBar, { bottom: Math.max(insets.bottom + 76, 86) }]}>
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.floatingCartGradient}>
            <View>
              <Text style={styles.floatingCartQty}>{totalCartCount} Items in Cart</Text>
              <Text style={styles.floatingCartPrice}>₹{totalCartPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.floatingCartBtn}>
              <Text style={styles.floatingCartBtnText}>View Cart →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <ApiProductDetailModal
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
          productDetail={detailProduct}
          loading={detailLoading}
          qty={cartItems.find((c) => c.id === detailProduct.id)?.quantity || 0}
          onAdd={() => handleAddToCart(detailProduct.id)}
          onIncrease={() => handleQuantityIncrease(detailProduct.id)}
          onDecrease={() => handleQuantityDecrease(detailProduct.id)}
          onViewCart={() => {
            setDetailVisible(false);
            navigation.navigate('Cart');
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TYPOGRAPHY.headingM,
    fontWeight: '700',
  },
  searchIconBtn: {
    padding: SPACING.xs,
  },
  mainBody: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
  },
  sidebarContent: {
    paddingVertical: SPACING.xs,
  },
  sidebarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  sidebarEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  sidebarLabel: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    fontSize: 10.5,
  },
  productPanel: {
    flex: 1,
  },
  categoryBanner: {
    padding: SPACING.sm,
  },
  categoryBannerTitle: {
    ...TYPOGRAPHY.headingS,
    fontWeight: '700',
  },
  categoryBannerCount: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  filterRail: {
    marginTop: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: 8,
  },
  gridContent: {
    padding: SPACING.sm,
    paddingBottom: 150,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  floatingCartQty: {
    ...TYPOGRAPHY.caption,
    color: '#E2E8F0',
  },
  floatingCartPrice: {
    ...TYPOGRAPHY.title,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  floatingCartBtn: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 14,
  },
  floatingCartBtnText: {
    ...TYPOGRAPHY.caption,
    color: '#0F172A',
    fontWeight: '800',
  },
});

const cardStyles = StyleSheet.create({
  root: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  imgBox: {
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#F6C453',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#F6C453',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: '#050816',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  oosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 22, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oosLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  body: {
    padding: 10,
  },
  name: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    height: 32,
  },
  unit: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    ...TYPOGRAPHY.bodyS,
    fontWeight: '900',
  },
  mrp: {
    ...TYPOGRAPHY.caption,
    fontSize: 9.5,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepBtn: {
    paddingHorizontal: 4,
  },
  stepTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  stepQty: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginHorizontal: 4,
  },
});
