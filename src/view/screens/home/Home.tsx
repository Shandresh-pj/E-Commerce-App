import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Image,
  RefreshControl,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { useResponsive } from '../../../hooks/useResponsive';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { SkeletonState } from '../../../design-system/components/SkeletonState';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { AttractiveProductCard } from '../../elements/AttractiveProductCard';
import ApiProductDetailModal, { ApiProductDetail } from '../../elements/ApiProductDetailModal';
import { fetchAllProducts, fetchCategories, addToApiCart, fetchApiCart, removeFromApiCart } from '../../../shared/services/main-service';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';
import { buildImageUrl } from '../../../shared/utils/imageHelper';
import { getAsyncData } from '../../../shared/utils/storage';
import Toast from 'react-native-root-toast';

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  const { gridColumns } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ApiProductDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const raw = await fetchApiCart();
      if (raw) {
        const mapped = raw.map((rawItem: any) => {
          const product = rawItem.product ?? rawItem.Product ?? rawItem;
          return {
            id: Number(product.id ?? product.Id ?? rawItem.product_id ?? rawItem.ProductId ?? rawItem.id),
            quantity: Number(rawItem.quantity ?? rawItem.Quantity ?? 1),
          };
        });
        setCartItems(mapped);
      }
    } catch (e) {}
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const prodRes: any = await fetchAllProducts();
      const list = Array.isArray(prodRes) ? prodRes : prodRes?.items || prodRes?.data || [];
      setProducts(list);

      const catRes: any = await fetchCategories();
      const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];
      setCategories(catList);
      await loadCart();
    } catch (e) {
      console.log('Error loading home API data:', e);
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleProductPress = (prod: any) => {
    const rawImg = prod.image || prod.imageUrl || prod.ImagePath || '';
    const nameStr = prod.name || prod.title || 'Product Detail';
    const formattedDetail: any = {
      id: Number(prod.id || prod._id || 1),
      name: nameStr,
      price: parseFloat(prod.price) || 0,
      regular_price: parseFloat(prod.originalPrice || prod.compare_at_price || prod.mrp || prod.price) || 0,
      description: prod.description || 'Authentic product with official SVK warranty.',
      image: buildImageUrl(rawImg, nameStr),
      images: Array.isArray(prod.images) && prod.images.length > 0
        ? prod.images.map((im: any) => buildImageUrl(typeof im === 'string' ? im : im?.url || im?.ImagePath, nameStr))
        : [buildImageUrl(rawImg, nameStr)],
      barcode: prod.barcode || 'SVK-PROD-001',
      category: prod.category || prod.category_name || 'General',
      product_type: prod.product_type || 'simple',
      stock_in_hand: prod.stock_in_hand ?? 50,
      status: 'active',
      variants: prod.variants || [],
    };
    setSelectedProduct(formattedDetail);
    setModalVisible(true);
  };

  const handleAddToCart = async (prodId: number, productObj?: any) => {
    await addToApiCart(prodId, 1, productObj);
    Toast.show('Item added to Cart 🛒', { duration: Toast.durations.SHORT });
    await loadCart();
  };

  const handleQuantityIncrease = async (prodId: number) => {
    await addToApiCart(prodId, 1, selectedProduct);
    await loadCart();
  };

  const handleQuantityDecrease = async (prodId: number) => {
    const existing = cartItems.find((c) => Number(c.id) === Number(prodId));
    if (existing) {
      if (existing.quantity <= 1) {
        await removeFromApiCart(prodId);
      } else {
        await addToApiCart(prodId, -1, selectedProduct);
      }
      await loadCart();
    }
  };

  const currentSelectedQty = selectedProduct
    ? (cartItems.find((c) => Number(c.id) === Number(selectedProduct.id))?.quantity ?? 0)
    : 0;

  const heroCampaign = {
    title: 'SVK Flagship Clearance',
    subtitle: 'Exclusive Deals Direct from Official Distributors',
    cta: 'Explore Catalog',
    bannerUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  };

  const [deliveryLocation, setDeliveryLocation] = useState<string>('Select Delivery Location');

  const loadDeliveryAddress = useCallback(async () => {
    try {
      const stored = await getAsyncData('selected_delivery_address');
      if (stored) {
        if (stored.isCurrentLocation) {
          const locStr = stored.city
            ? `${stored.line1 ? stored.line1.split(',')[0] + ', ' : ''}${stored.city}`
            : stored.fullAddress || 'Current Location';
          setDeliveryLocation(locStr);
        } else if (stored.city || stored.line1) {
          setDeliveryLocation(`${stored.label || 'Saved'}: ${stored.city || stored.line1}`);
        } else if (stored.fullAddress) {
          setDeliveryLocation(stored.fullAddress);
        }
      }
    } catch (e) {
      console.warn('Error loading delivery location in Home:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDeliveryAddress();
    }, [loadDeliveryAddress])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: insets.bottom + 110,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.greeting, { color: tokens.content.secondary }]}>
              Hello, Member 👋
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Addresses')}
              style={styles.locationRow}
              activeOpacity={0.8}
            >
              <SvkIcon name="mapPin" size={14} color={tokens.brand.primary} />
              <Text
                style={[styles.locationText, { color: tokens.content.primary }]}
                numberOfLines={1}
              >
                {deliveryLocation}
              </Text>
              <SvkIcon name="chevronDown" size={12} color={tokens.content.tertiary} />
            </Pressable>
          </View>

          <View style={styles.headerIcons}>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              style={[styles.iconBtn, { backgroundColor: tokens.surface.secondary }]}
            >
              <SvkIcon name="bell" size={20} color={tokens.content.primary} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar Header */}
        <Pressable
          onPress={() => navigation.navigate('Search')}
          style={[
            styles.searchBar,
            {
              backgroundColor: tokens.surface.secondary,
              borderColor: tokens.border.default,
            },
          ]}
        >
          <SvkIcon name="search" size={20} color={tokens.content.tertiary} />
          <Text style={[styles.searchPlaceholder, { color: tokens.content.tertiary }]}>
            Search products, brands, categories...
          </Text>
          <SvkIcon name="filter" size={18} color={tokens.brand.primary} />
        </Pressable>

        {/* Promotional Campaign Hero */}
        <Surface variant="glass" radius="xl" elevation="medium" style={styles.heroCard}>
          <Image source={{ uri: heroCampaign.bannerUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Badge label="EXCLUSIVE OFFER" variant="gold" size="md" />
            <Text style={styles.heroTitle}>{heroCampaign.title}</Text>
            <Text style={styles.heroSubtitle}>{heroCampaign.subtitle}</Text>
            <Button
              title={heroCampaign.cta}
              onPress={() => navigation.navigate('Categories')}
              variant="gold"
              size="sm"
              fullWidth={false}
              style={{ marginTop: 12 }}
            />
          </View>
        </Surface>

        {/* Dynamic Categories Rail from API */}
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRail}>
            {[1, 2, 3, 4, 5].map((n) => (
              <View key={n} style={{ marginRight: SPACING.xs, marginVertical: 4 }}>
                <SkeletonState width={110} height={36} radius="xl" />
              </View>
            ))}
          </ScrollView>
        ) : categories.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
                Explore Categories
              </Text>
              <Pressable onPress={() => navigation.navigate('Categories')}>
                <Text style={[styles.seeAll, { color: tokens.brand.primary }]}>See All</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRail}>
              {categories.map((cat: any, idx: number) => (
                <Pressable
                  key={cat.id || cat._id || idx}
                  onPress={() => navigation.navigate('Categories', { categoryId: cat.id, categoryName: cat.name || cat.CategoryName })}
                  style={[styles.categoryChip, { backgroundColor: tokens.surface.secondary }]}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: tokens.brand.primarySoft }]}>
                    <SvkIcon name="categories" size={16} color={tokens.brand.primary} />
                  </View>
                  <Text style={[styles.categoryText, { color: tokens.content.primary }]}>
                    {cat.name || cat.CategoryName || cat.title || 'Category'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Flash Deals API Section */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>Flash Deals</Text>
            <View style={[styles.timerBadge, { backgroundColor: tokens.semantic.errorSoft }]}>
              <Text style={{ ...TYPOGRAPHY.caption, color: tokens.semantic.error, fontWeight: '700' }}>
                LIVE DEALS
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10 }}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={{ width: 155, marginRight: 10 }}>
                <SkeletonState width={155} height={190} radius="lg" />
              </View>
            ))}
          </ScrollView>
        ) : products.length > 0 ? (
          <FlatList
            data={products.slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id || item._id)}
            renderItem={({ item }) => (
              <AttractiveProductCard
                id={item.id}
                title={item.name || item.title || 'Product'}
                price={parseFloat(item.price) || 0}
                originalPrice={parseFloat(item.compare_at_price || item.mrp || item.originalPrice)}
                discount={item.discount ? String(item.discount) : undefined}
                imageUrl={item.image || item.imageUrl || item.ImagePath}
                category={item.category || item.category_name}
                onPress={() => handleProductPress(item)}
                onAddToCart={() => handleAddToCart(Number(item.id))}
                style={{ width: 155 }}
              />
            )}
          />
        ) : (
          <EmptyState title="No Flash Deals Available" subtitle="Check back shortly for updated live inventory." />
        )}

        {/* Recommended Products Grid from API */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
            Recommended For You
          </Text>
        </View>

        {loading ? (
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={{ width: `${100 / gridColumns}%`, padding: 4 }}>
                <SkeletonState width="100%" height={200} radius="lg" />
              </View>
            ))}
          </View>
        ) : products.length > 0 ? (
          <View style={styles.gridContainer}>
            {products.map((item) => (
              <View key={String(item.id || item._id)} style={{ width: `${100 / gridColumns}%` }}>
                <AttractiveProductCard
                  id={item.id}
                  title={item.name || item.title || 'Product'}
                  price={parseFloat(item.price) || 0}
                  originalPrice={parseFloat(item.compare_at_price || item.mrp || item.originalPrice)}
                  discount={item.discount ? String(item.discount) : undefined}
                  imageUrl={item.image || item.imageUrl || item.ImagePath}
                  category={item.category || item.category_name}
                  onPress={() => handleProductPress(item)}
                  onAddToCart={() => handleAddToCart(Number(item.id))}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="Catalog Empty" subtitle="Pull down to refresh live product catalog from server." />
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ApiProductDetailModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          productDetail={selectedProduct}
          loading={false}
          qty={currentSelectedQty}
          onAdd={() => handleAddToCart(selectedProduct.id, selectedProduct)}
          onIncrease={() => handleQuantityIncrease(selectedProduct.id)}
          onDecrease={() => handleQuantityDecrease(selectedProduct.id)}
          onViewCart={() => {
            setModalVisible(false);
            navigation.navigate('Cart');
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  greeting: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    ...TYPOGRAPHY.bodyS,
    fontWeight: '700',
    marginHorizontal: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.bodyS,
  },
  heroCard: {
    height: 180,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  heroTitle: {
    ...TYPOGRAPHY.headingL,
    color: '#FFFFFF',
    marginTop: 6,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodyS,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headingM,
  },
  seeAll: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  timerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoriesRail: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    marginRight: SPACING.xs,
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
});
