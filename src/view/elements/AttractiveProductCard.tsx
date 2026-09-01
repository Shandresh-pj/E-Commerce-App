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
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  };

  const handleWishlistPress = async () => {
    const nextState = !wishlisted;
    setWishlisted(nextState);
    Animated.sequence([
      Animated.timing(wishAnim, { toValue: 1.18, duration: 120, useNativeDriver: true }),
      Animated.spring(wishAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
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
      Animated.timing(plusAnim, { toValue: 1.22, duration: 100, useNativeDriver: true }),
      Animated.spring(plusAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
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

  const glassBg = isDark ? 'rgba(13, 23, 43, 0.88)' : 'rgba(255, 255, 255, 0.92)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.65)';

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          backgroundColor: glassBg,
          borderColor: glassBorder,
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
        {/* Floating Image Container */}
        <View style={[styles.imageContainer, { backgroundColor: isDark ? '#081126' : '#EEF3FA' }]}>
          <BlurhashImage
            category={category || title}
            source={{ uri: resolvedImage }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          {/* Premium Aurora Gold Discount Badge */}
          {discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}</Text>
            </View>
          ) : null}

          {/* Floating Glass Circular Wishlist Button */}
          <Animated.View style={{ transform: [{ scale: wishAnim }], position: 'absolute', top: 8, right: 8 }}>
            <Pressable
              onPress={handleWishlistPress}
              style={[
                styles.wishlistBtn,
                { backgroundColor: isDark ? 'rgba(5, 8, 22, 0.82)' : 'rgba(255, 255, 255, 0.88)', borderColor: glassBorder },
              ]}
              hitSlop={6}
            >
              <SvkIcon
                name={wishlisted ? 'heartFilled' : 'heart'}
                size={14}
                color={wishlisted ? '#EF4444' : (isDark ? '#F8FAFC' : '#0F172A')}
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
              <SvkIcon name="star" size={11} color="#F6C453" />
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
              <Text style={[styles.price, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
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
                  { backgroundColor: added ? '#10B981' : '#2563EB' },
                  pressed && { opacity: 0.85 },
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
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
  cardInner: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 136,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F6C453',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#F6C453',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#050816',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    height: 34,
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
    backgroundColor: 'rgba(246, 196, 83, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
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
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  originalPrice: {
    fontSize: 10.5,
    textDecorationLine: 'line-through',
    marginTop: -1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
