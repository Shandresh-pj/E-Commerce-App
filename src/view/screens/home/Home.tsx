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
import { fetchAllProducts, fetchCategories, addToApiCart } from '../../../shared/services/main-service';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';
import Toast from 'react-native-root-toast';

export const HomeScreen = ({ navigation }: any) => {
  const { tokens, isDark } = useTheme();
  const { gridColumns } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ApiProductDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const prodRes: any = await fetchAllProducts();
      const list = Array.isArray(prodRes) ? prodRes : prodRes?.items || prodRes?.data || [];
      setProducts(list);

      const catRes: any = await fetchCategories();
      const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];
      setCategories(catList);
    } catch (e) {
      console.log('Error loading home API data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleProductPress = (prod: any) => {
    const formattedDetail: any = {
      id: Number(prod.id || prod._id || 1),
      name: prod.name || prod.title || 'Product Detail',
      price: parseFloat(prod.price) || 0,
      regular_price: parseFloat(prod.originalPrice || prod.compare_at_price || prod.price) || 0,
      description: prod.description || 'Authentic product with official SVK warranty.',
      image: prod.image || prod.imageUrl || '',
      images: [prod.image || prod.imageUrl || ''],
      barcode: prod.barcode || 'SVK-PROD-001',
      category: prod.category || 'Electronics',
      product_type: prod.product_type || 'simple',
      stock_in_hand: prod.stock_in_hand ?? 50,
      status: 'active',
      variants: prod.variants || [],
    };
    setSelectedProduct(formattedDetail);
    setModalVisible(true);
  };

  const handleAddToCart = async (prodId: number) => {
    const success = await addToApiCart(prodId, 1);
    if (success) {
      Toast.show('Item added to Cart', { duration: Toast.durations.SHORT });
    }
  };

  const heroCampaign = {
    title: 'SVK Flagship Clearance',
    subtitle: 'Exclusive Deals Direct from Official Distributors',
    cta: 'Explore Catalog',
    bannerUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: tokens.content.secondary }]}>
              Hello, Member 👋
            </Text>
            <Pressable onPress={() => navigation.navigate('MapView')} style={styles.locationRow}>
              <SvkIcon name="mapPin" size={14} color={tokens.brand.primary} />
              <Text style={[styles.locationText, { color: tokens.content.primary }]}>
                New York, USA
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
            Explore Categories
          </Text>
          <Pressable onPress={() => navigation.navigate('Categories')}>
            <Text style={[styles.seeAll, { color: tokens.brand.primary }]}>See All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRail}>
          {(categories.length > 0 ? categories : [
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Fashion' },
            { id: 3, name: 'Home' },
            { id: 4, name: 'Beauty' },
            { id: 5, name: 'Sports' },
            { id: 6, name: 'Automotive' },
          ]).map((cat: any, idx: number) => (
            <Pressable
              key={cat.id || idx}
              onPress={() => navigation.navigate('Categories', { categoryId: cat.id, categoryName: cat.name })}
              style={[styles.categoryChip, { backgroundColor: tokens.surface.secondary }]}
            >
              <View style={[styles.categoryIconCircle, { backgroundColor: tokens.brand.primarySoft }]}>
                <SvkIcon name="categories" size={20} color={tokens.brand.primary} />
              </View>
              <Text style={[styles.categoryText, { color: tokens.content.primary }]}>
                {cat.name || cat.CategoryName || cat.title || 'Category'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

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
          <View style={{ paddingVertical: 20 }}>
            <SkeletonState width={170} height={200} radius="lg" />
          </View>
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
                originalPrice={parseFloat(item.compare_at_price || item.mrp) || (parseFloat(item.price) * 1.25)}
                discount={item.discount ? String(item.discount) : undefined}
                imageUrl={item.image || item.imageUrl}
                onPress={() => handleProductPress(item)}
                onAddToCart={() => handleAddToCart(Number(item.id))}
                style={{ width: 170 }}
              />
            )}
          />
        ) : (
          <EmptyState title="No Flash Deals Available" subtitle="Check back shortly for updated live inventory." />
        )}

        {/* Recommended Products Grid from API */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
          <Text style={[styles.sectionTitle, { color: tokens.content.primary }]}>
            Recommended For You
          </Text>
        </View>

        {loading ? (
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={{ width: `${100 / gridColumns}%`, padding: 4 }}>
                <SkeletonState width="100%" height={220} radius="lg" />
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
                  originalPrice={parseFloat(item.compare_at_price || item.mrp)}
                  discount={item.discount ? String(item.discount) : undefined}
                  imageUrl={item.image || item.imageUrl}
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
          qty={1}
          onAdd={() => handleAddToCart(selectedProduct.id)}
          onIncrease={() => {}}
          onDecrease={() => {}}
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
