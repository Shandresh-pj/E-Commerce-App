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
import LinearGradient from 'react-native-linear-gradient';
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
import { MovingBackground } from '../../elements/MovingBackground';
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
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

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
    title: 'LIQUID AURORA COMMERCE OS',
    subtitle: '100% Official Certified Distributors & Direct Warranty',
    cta: 'Explore Catalog →',
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

  const glassBg = isDark ? 'rgba(13, 23, 43, 0.85)' : 'rgba(255, 255, 255, 0.90)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.65)';

  return (
    <MovingBackground theme={isDark ? 'dark' : 'yellow'} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: insets.bottom + 110,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* Floating Glass Header Row */}
        <View style={[styles.headerRow, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>SVK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: tokens.content.secondary }]}>
                Welcome back 👋
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Addresses')}
                style={styles.locationRow}
              >
                <SvkIcon name="mapPin" size={13} color="#2563EB" />
                <Text
                  style={[styles.locationText, { color: tokens.content.primary }]}
                  numberOfLines={1}
                >
                  {deliveryLocation}
                </Text>
                <SvkIcon name="chevronDown" size={11} color={tokens.content.tertiary} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF3FA' }]}
          >
            <SvkIcon name="bell" size={18} color={tokens.content.primary} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Floating Search Bar */}
        <Pressable
          onPress={() => navigation.navigate('Search')}
          style={[
            styles.searchBar,
            {
              backgroundColor: glassBg,
              borderColor: glassBorder,
            },
          ]}
        >
          <SvkIcon name="search" size={19} color="#3B82F6" />
          <Text style={[styles.searchPlaceholder, { color: tokens.content.tertiary }]}>
            Search products, categories, deals...
          </Text>
          <View style={styles.filterBtn}>
            <SvkIcon name="filter" size={16} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Premium Promotional Campaign Hero Banner */}
        <View style={[styles.heroCard, { borderColor: glassBorder }]}>
          <Image source={{ uri: heroCampaign.bannerUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={isDark ? ['rgba(5,8,22,0.2)', 'rgba(5,8,22,0.92)'] : ['rgba(37,99,235,0.2)', 'rgba(5,8,22,0.88)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>✦ AURORA EXCLUSIVE</Text>
            </View>
            <Text style={styles.heroTitle}>{heroCampaign.title}</Text>
            <Text style={styles.heroSubtitle}>{heroCampaign.subtitle}</Text>
            <Pressable
              onPress={() => navigation.navigate('Categories')}
              style={({ pressed }) => [
                styles.heroCtaBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={['#F6C453', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heroCtaGradient}
              >
                <Text style={styles.heroCtaText}>{heroCampaign.cta}</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Categories Rail */}
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRail}>
            {[1, 2, 3, 4, 5].map((n) => (
              <View key={n} style={{ marginRight: SPACING.xs, marginVertical: 4 }}>
                <SkeletonState width={110} height={38} radius="xl" />
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
                <Text style={styles.seeAllText}>See All →</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRail}>
              {categories.map((cat: any, idx: number) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id || cat._id || idx}
                    onPress={() => {
                      setActiveCategory(cat.id);
                      navigation.navigate('Categories', { categoryId: cat.id, categoryName: cat.name || cat.CategoryName });
                    }}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isActive ? '#2563EB' : glassBg,
                        borderColor: isActive ? '#F6C453' : glassBorder,
                      },
                    ]}
                  >
                    <View style={[styles.categoryIconCircle, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(37,99,235,0.12)' }]}>
                      <SvkIcon name="categories" size={15} color={isActive ? '#FFFFFF' : '#2563EB'} />
                    </View>
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isActive ? '#FFFFFF' : tokens.content.primary },
                      ]}
                    >
                      {cat.name || cat.CategoryName || cat.title || 'Category'}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {/* Flash Deals Section */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>Flash Deals</Text>
            <View style={styles.timerBadge}>
              <Text style={styles.timerBadgeText}>⚡ LIVE DEALS</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10 }}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={{ width: 165, marginRight: 10 }}>
                <SkeletonState width={165} height={200} radius="lg" />
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
                style={{ width: 165 }}
              />
            )}
          />
        ) : (
          <EmptyState title="No Flash Deals Available" subtitle="Check back shortly for updated live inventory." />
        )}

        {/* Recommended Products Grid */}
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

      {/* Product Detail Modal Sheet */}
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
    </MovingBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#F6C453',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  greeting: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '800',
    marginHorizontal: 4,
    flex: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F6C453',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    height: 190,
    marginBottom: SPACING.lg,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  heroBadge: {
    backgroundColor: 'rgba(246, 196, 83, 0.25)',
    borderWidth: 1,
    borderColor: '#F6C453',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#F6C453',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 3,
  },
  heroCtaBtn: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroCtaGradient: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroCtaText: {
    color: '#050816',
    fontSize: 12.5,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#3B82F6',
  },
  timerBadge: {
    backgroundColor: 'rgba(246, 196, 83, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  timerBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
  categoriesRail: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
});
