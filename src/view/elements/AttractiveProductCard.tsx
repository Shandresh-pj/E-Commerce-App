import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Surface } from '../../design-system/surfaces/Surface';
import { SvkIcon } from '../../design-system/icons/SvkIcon';
import { Badge } from '../../design-system/components/Badge';
import { TYPOGRAPHY } from '../../design-system/tokens/typography';
import { SPACING } from '../../design-system/tokens/spacing';

export interface ProductCardProps {
  id: string | number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
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
  reviewCount = 120,
  imageUrl,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  style,
}) => {
  const { tokens, isDark } = useTheme();
  const [wishlisted, setWishlisted] = useState(isWishlisted);

  const defaultImage =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';

  const handleWishlistPress = () => {
    setWishlisted(!wishlisted);
    onToggleWishlist?.();
  };

  return (
    <Surface
      variant="card"
      radius="lg"
      elevation="low"
      bordered
      onPress={onPress}
      style={style ? [styles.card, style] : styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {discount && (
          <View style={styles.discountBadge}>
            <Badge label={discount} variant="gold" size="sm" />
          </View>
        )}
        <Pressable
          onPress={handleWishlistPress}
          style={({ pressed }) => [
            styles.wishlistButton,
            { backgroundColor: tokens.surface.glass },
            pressed && { scale: 0.9 },
          ]}
          accessibilityLabel="Add to Wishlist"
        >
          <SvkIcon
            name={wishlisted ? 'heartFilled' : 'heart'}
            size={18}
            color={wishlisted ? '#EF4444' : tokens.content.primary}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[styles.title, { color: tokens.content.primary }]}
        >
          {title}
        </Text>

        <View style={styles.ratingRow}>
          <SvkIcon name="star" size={14} color="#F59E0B" />
          <Text style={[styles.ratingText, { color: tokens.content.primary }]}>
            {rating}
          </Text>
          <Text style={[styles.reviewCount, { color: tokens.content.tertiary }]}>
            ({reviewCount})
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.price, { color: tokens.content.brand }]}>
              ${price.toFixed(2)}
            </Text>
            {originalPrice && originalPrice > price && (
              <Text style={[styles.originalPrice, { color: tokens.content.tertiary }]}>
                ${originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
          <Pressable
            onPress={onAddToCart}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: tokens.brand.primary },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Add to Cart"
          >
            <SvkIcon name="plus" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: SPACING.xs,
    overflow: 'hidden',
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.title,
    marginBottom: 4,
    height: 40,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewCount: {
    ...TYPOGRAPHY.caption,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    ...TYPOGRAPHY.price,
  },
  originalPrice: {
    ...TYPOGRAPHY.caption,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
