import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SvkIcon } from '../../design-system/icons/SvkIcon';
import { SPACING } from '../../design-system/tokens/spacing';
import { buildImageUrl, getFallbackImage } from '../../shared/utils/imageHelper';
import { toggleWishlist, addToApiCart } from '../../shared/services/main-service';
import { BlurhashImage } from '../../design-system/components/BlurhashImage';
import Toast from 'react-native-root-toast';

export interface ProductCardProps {
  id: string | number;
  title: string;
  price: number | string;
  originalPrice?: number | string;
  discount?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  category?: string;
  onPress?: () => void;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const AttractiveProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  originalPrice,
  discount,
  rating = 4.8,
  reviewCount,
  imageUrl,
  category,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  style,
}) => {
  const { tokens, isDark } = useTheme();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  // Safe numeric parsing for prices
  const numPrice = typeof price === 'number' ? price : parseFloat(String(price)) || 0;
  const numOrigPrice =
    originalPrice != null
      ? typeof originalPrice === 'number'
        ? originalPrice
        : parseFloat(String(originalPrice)) || 0
      : undefined;

  // Animated scale for press & button interactions
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const wishAnim = React.useRef(new Animated.Value(1)).current;
  const plusAnim = React.useRef(new Animated.Value(1)).current;

  const resolvedImage = imageError
    ? getFallbackImage(title || category, 'product')
    : buildImageUrl(imageUrl, title || category, 'product');

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handleWishlistPress = async () => {
    const nextState = !wishlisted;
    setWishlisted(nextState);
    Animated.sequence([
      Animated.timing(wishAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.spring(wishAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    try {
      if (id != null) {
        await toggleWishlist(Number(id), wishlisted, { name: title, price: numPrice, image: imageUrl });
        Toast.show(nextState ? 'Added to Wishlist ♥' : 'Removed from Wishlist', { duration: Toast.durations.SHORT });
      }
    } catch (e) {
      console.log('handleWishlistPress error:', e);
    }
    onToggleWishlist?.();
  };

  const handleAddPress = async () => {
    setAdded(true);
    Animated.sequence([
      Animated.timing(plusAnim, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.spring(plusAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    try {
      if (id != null) {
        await addToApiCart(Number(id), 1, { name: title, title, price: numPrice, image: imageUrl });
        Toast.show('Added to Cart 🛒', { duration: Toast.durations.SHORT });
      }
    } catch (e) {
      console.log('handleAddPress error:', e);
    }
    onAddToCart?.();
    setTimeout(() => setAdded(false), 1200);
  };

  // Calculate discount percentage if not explicit string
  let discountPercent = discount;
  if (!discountPercent && numOrigPrice && numOrigPrice > numPrice) {
    const pct = Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100);
    if (pct > 0) discountPercent = `${pct}% OFF`;
  }

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardInner}
      >
        {/* Compact Image Container */}
        <View style={[styles.imageContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
          <BlurhashImage
            category={category || title}
            source={{ uri: resolvedImage }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          {/* Discount Badge */}
          {discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}</Text>
            </View>
          ) : null}

          {/* Animated Wishlist Toggle */}
          <Animated.View style={{ transform: [{ scale: wishAnim }], position: 'absolute', top: 6, right: 6 }}>
            <Pressable
              onPress={handleWishlistPress}
              style={[
                styles.wishlistBtn,
                { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)' },
              ]}
              hitSlop={6}
            >
              <SvkIcon
                name={wishlisted ? 'heartFilled' : 'heart'}
                size={15}
                color={wishlisted ? '#EF4444' : tokens.content.primary}
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* Details Content */}
        <View style={styles.content}>
          <Text
            numberOfLines={2}
            style={[styles.title, { color: tokens.content.primary }]}
          >
            {title}
          </Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <SvkIcon name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            {reviewCount != null && reviewCount > 0 ? (
              <Text style={[styles.reviewCount, { color: tokens.content.tertiary }]}>
                ({reviewCount})
              </Text>
            ) : null}
          </View>

          {/* Price & Action Row */}
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.price, { color: tokens.brand.primary }]}>
                ₹{numPrice.toFixed(2)}
              </Text>
              {numOrigPrice && numOrigPrice > numPrice ? (
                <Text style={[styles.originalPrice, { color: tokens.content.tertiary }]}>
                  ₹{numOrigPrice.toFixed(2)}
                </Text>
              ) : null}
            </View>

            <Animated.View style={{ transform: [{ scale: plusAnim }] }}>
              <Pressable
                onPress={handleAddPress}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: added ? '#10B981' : tokens.brand.primary },
                  pressed && { opacity: 0.82 },
                ]}
              >
                <SvkIcon name={added ? 'checkCircle' : 'plus'} size={15} color="#FFFFFF" />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardInner: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 132,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  wishlistBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16,
    height: 32,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 10,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    marginTop: -1,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
