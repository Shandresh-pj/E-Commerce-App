import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Defaults from '../../../config/index';
import HeartIcon from '../../assets/images/svg/Svg2/HeartIcon';
import {
  fetchMyWishlist,
  toggleWishlist,
} from '../../../shared/services/main-service';
import CloseIcon from '../../assets/images/svg/Svg2/CloseIcon';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import styles from './WishListStyle';
import { THEME } from '../../assets/styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeartIconWhite from '../../assets/images/svg/Svg2/HeartIconWhite';

// ─── Product Card ─────────────────────────────────────────────────────────────
interface WishListCardProps {
  product: any;
  onRemove: (productId: number) => Promise<void>;
}

const WishListCard = ({ product, onRemove }: WishListCardProps) => {
  const [removing, setRemoving] = useState(false);

  let imageUrl: string | null = null;
  if (product.images && product.images.length > 0) {
    let imgPath = product.images[0].replace(/\\/g, '/');
    imageUrl = imgPath.startsWith('http')
      ? imgPath
      : `${Defaults.apis.baseUrl}/api/v1/${imgPath.replace(/^\/+/, '')}`;
  }

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(product.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageBox}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
        ) : (
          <Text style={styles.imageFallback}>{product.emoji || 'Img'}</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCol}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.points}>Score : </Text>
          <Text style={styles.points}>{product.points}</Text>
        </View>
      </View>

      {/* Remove */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={handleRemove}
        disabled={removing}
      >
        {removing ? (
          <ActivityIndicator size="small" color={THEME.COLOR.bgPurple} />
        ) : (
          <CloseIcon />
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─── WishList Screen ──────────────────────────────────────────────────────────
export default function WishListScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, []),
  );

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const dataList = await fetchMyWishlist();
      if (dataList && dataList.length >= 0) {
        const mapped = dataList.map((item: any) => ({
          id: item.ProductId || item.Product?.Id || item.Id,
          code: item.Code || item.Product?.Code,
          points: item.Points || item.Product?.Points || 0,
          images:
            item.Images?.map((img: any) => img.ImageName) ??
            item.Product?.Images?.map((img: any) => img.ImageName) ??
            [],
          name:
            item.ProductTranslations?.length > 0
              ? item.ProductTranslations[0].Name
              : item.Product?.ProductTranslations?.length > 0
                ? item.Product.ProductTranslations[0].Name
                : item.Code || item.Product?.Code || 'Product',
          brand: 'Generic',
          rating: 4.0,
          discount: 0,
          emoji: item.Code || item.Product?.Code,
        }));
        setWishlistItems(mapped);
      }
    } catch (error) {
      console.log('fetchWishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const success = await toggleWishlist(productId, true); // true since we are removing
      if (success) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.log('removeItem error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color='#fff' />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor='#2a2c40'
        translucent
      />
      <SafeAreaView edges={['left', 'right',]} style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Wishlist</Text>
          </View>
          <View style={styles.cartCountBadge}>
            <HeartIconWhite filled={false} />
            <Text style={[styles.countText, { marginLeft: 5 }]}>{wishlistItems.length}</Text>
          </View>
        </View>

        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
          style={styles.bakcgroundImage}
        >
          <FlatList
            data={wishlistItems}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <WishListCard product={item} onRemove={removeItem} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <HeartIcon filled={false} />
                <Text style={styles.emptyTitle}>Your Wishlist is Empty!</Text>
                <Text style={styles.emptySubtitle}>
                  Explore our products and tap the heart icon to save them here.
                </Text>
                <TouchableOpacity
                  style={styles.shopNowBtn}
                  onPress={() =>
                    (navigation as any).navigate('Home', { screen: 'ProductList' })
                  }
                >
                  <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={<View style={{ height: 40 }} />}
          />
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}
