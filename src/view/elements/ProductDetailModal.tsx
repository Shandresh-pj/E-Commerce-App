import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import Defaults from '../../config/index'
import PrimaryButton from './PrimaryButton'
import { useTheme } from '../../shared/context/ThemeContext'
import {
  StarIcon,
  TruckIcon,
  ShieldIcon,
  HeartIcon,
  ShareIcon,
  CheckIcon,
  XIcon,
  TagIcon,
} from './SvgIcons'

const { width: screenWidth } = Dimensions.get('window')

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

const buildImageUrl = (imageName: string): string => {
  if (!imageName) return ''
  const cleaned = imageName.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http')
    ? cleaned
    : `${Defaults.apis.baseUrl}/api/${cleaned}`
}

interface ProductDetailModalProps {
  visible: boolean
  onClose: () => void
  productDetail: any | null
  loading: boolean
  onAddToCart?: (product: any) => Promise<void>
  cartIds?: Set<number>
  navigation: any
}

const ProductDetailModal = ({
  visible,
  onClose,
  productDetail,
  loading,
  onAddToCart,
  cartIds = new Set(),
  navigation,
}: ProductDetailModalProps) => {
  const { colors, isDark } = useTheme()
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (productDetail) {
      setSelectedVariantId(
        productDetail.ProductVariant?.length > 0
          ? productDetail.ProductVariant[0].Id
          : null,
      )
      setActiveImageIndex(0)
    }
  }, [productDetail?.Id])

  if (!visible) return null

  const images: string[] =
    productDetail?.ProductImages?.map((pi: any) =>
      buildImageUrl(pi.Images.ImageName),
    ) ?? []

  const selectedVariant = productDetail?.ProductVariant?.find(
    (v: any) => v.Id === selectedVariantId,
  )

  const productName = productDetail?.ProductTranslations?.[0]?.Name ?? productDetail?.name ?? 'Product'
  const description = stripHtml(
    productDetail?.ProductTranslations?.[0]?.Description ?? productDetail?.description ?? '',
  )

  const productType: string = productDetail?.ProductType ?? 'Single'
  const isVariantType = productType === 'Variant'

  const stock: number = isVariantType
    ? selectedVariant?.Stock ?? 10
    : Math.floor(parseFloat(productDetail?.StockInHand ?? productDetail?.stock ?? '15'))

  const isInCart = productDetail ? cartIds.has(productDetail.Id || productDetail.id) : false

  const rawPrice = isVariantType && selectedVariant
    ? parseFloat(selectedVariant.Price)
    : parseFloat(productDetail?.price ?? productDetail?.Price ?? productDetail?.Points ?? '299')

  const scoreValue = rawPrice.toFixed(2)
  const originalPrice = (rawPrice * 1.25).toFixed(2)

  const cartProduct = {
    id: productDetail?.Id || productDetail?.id,
    name: productName,
    points: rawPrice,
    images: images,
    quantity: 1,
    ...(isVariantType && selectedVariant
      ? {
          variantId: selectedVariant.Id,
          variantCode: selectedVariant.ProductVariantCode,
          variantPrice: rawPrice,
        }
      : {}),
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={[s.sheet, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={[s.handle, { backgroundColor: colors.borderStrong }]} />

          {/* Action Header */}
          <View style={s.headerActions}>
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
              onPress={() => setIsWishlisted(!isWishlisted)}
            >
              <HeartIcon size={20} color={isWishlisted ? '#EF4444' : colors.textSecondary} filled={isWishlisted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
              onPress={onClose}
            >
              <XIcon size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.loaderBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[s.loaderText, { color: colors.textSecondary }]}>Loading product details...</Text>
            </View>
          ) : !productDetail ? (
            <View style={s.loaderBox}>
              <Text style={[s.loaderText, { color: colors.textSecondary }]}>Product information unavailable.</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scrollContent}
            >
              {/* Image Gallery */}
              {images.length > 0 ? (
                <View style={s.imageSection}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={e => {
                      const idx = Math.round(
                        e.nativeEvent.contentOffset.x / screenWidth,
                      )
                      setActiveImageIndex(idx)
                    }}
                  >
                    {images.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={[s.productImage, { width: screenWidth }]}
                        resizeMode="contain"
                      />
                    ))}
                  </ScrollView>

                  {images.length > 1 && (
                    <View style={s.dotsRow}>
                      {images.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            s.dot,
                            { backgroundColor: colors.border },
                            idx === activeImageIndex && { backgroundColor: colors.accent, width: 22 },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={[s.noImageBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <Text style={s.noImageEmoji}>📦</Text>
                  <Text style={[s.noImageText, { color: colors.textSecondary }]}>SVK Signature Collection</Text>
                </View>
              )}

              {/* Information Section */}
              <View style={s.infoSection}>
                {/* Brand Badge */}
                <View style={s.brandRow}>
                  <View style={[s.brandBadge, { backgroundColor: colors.accentGlow }]}>
                    <Text style={[s.brandBadgeText, { color: colors.accent }]}>SVK ORIGINAL</Text>
                  </View>
                  <View style={s.ratingBadge}>
                    <StarIcon size={14} color="#F59E0B" filled={true} />
                    <Text style={[s.ratingText, { color: colors.textPrimary }]}>4.9 (128 reviews)</Text>
                  </View>
                </View>

                {/* Product Title */}
                <Text style={[s.productTitle, { color: colors.textPrimary }]}>{productName}</Text>

                {/* Price Section */}
                <View style={s.scoreRow}>
                  <Text style={[s.scoreValue, { color: colors.textPrimary }]}>${scoreValue}</Text>
                  <Text style={[s.originalPrice, { color: colors.textMuted }]}>${originalPrice}</Text>
                  <View style={s.discountBadge}>
                    <Text style={s.discountText}>20% OFF</Text>
                  </View>
                </View>

                {/* Delivery & Stock Info Bar */}
                <View style={[s.trustCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <View style={s.trustItem}>
                    <TruckIcon size={18} color="#2563EB" />
                    <Text style={[s.trustText, { color: colors.textPrimary }]}>Free Express Delivery</Text>
                  </View>
                  <View style={s.trustDivider} />
                  <View style={s.trustItem}>
                    <ShieldIcon size={18} color="#22C55E" />
                    <Text style={[s.trustText, { color: colors.textPrimary }]}>
                      {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                    </Text>
                  </View>
                </View>

                {/* Variants Selection */}
                {isVariantType && productDetail.ProductVariant?.length > 0 && (
                  <View style={s.variantSection}>
                    <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>Select Variant</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={s.variantRow}>
                        {productDetail.ProductVariant.map((variant: any) => {
                          const isSelected = variant.Id === selectedVariantId
                          const variantLabel = variant.ProductVariantCode
                          const variantPriceVal = parseFloat(variant.Price)
                          const variantStock: number = variant.Stock ?? 0
                          const isOutOfStock = variantStock === 0

                          return (
                            <TouchableOpacity
                              key={variant.Id}
                              style={[
                                s.variantChip,
                                {
                                  borderColor: isSelected ? colors.accent : colors.border,
                                  backgroundColor: isSelected ? colors.accentGlow : colors.surfaceSecondary,
                                },
                              ]}
                              onPress={() => !isOutOfStock && setSelectedVariantId(variant.Id)}
                              disabled={isOutOfStock}
                            >
                              <Text
                                style={[
                                  s.variantChipText,
                                  { color: isSelected ? colors.accentText : colors.textPrimary },
                                ]}
                              >
                                {variantLabel}
                              </Text>
                              <Text style={[s.variantPrice, { color: colors.textSecondary }]}>
                                ${variantPriceVal.toFixed(2)}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* Description */}
                {description ? (
                  <View style={s.descSection}>
                    <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>Product Highlights</Text>
                    <Text style={[s.descText, { color: colors.textSecondary }]}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          )}

          {/* Sticky Bottom Actions */}
          {!loading && productDetail && stock > 0 && onAddToCart && (
            <View style={[s.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <PrimaryButton
                label={isInCart ? 'View Cart & Checkout' : 'Add to Cart — $' + scoreValue}
                variant="primary"
                style={s.actionBtn}
                onPress={() => {
                  if (isInCart) {
                    onClose()
                    ;(navigation as any).navigate('Cart')
                  } else {
                    onAddToCart(cartProduct)
                  }
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 0,
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loaderText: { fontSize: 14, fontWeight: '500' },

  scrollContent: { paddingBottom: 24 },

  imageSection: { alignItems: 'center' },
  productImage: { height: 260 },
  noImageBox: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noImageEmoji: { fontSize: 44 },
  noImageText: { fontSize: 14, fontWeight: '600' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  infoSection: { paddingHorizontal: 20, paddingTop: 14 },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600' },

  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustText: { fontSize: 12, fontWeight: '600' },
  trustDivider: { width: 1, height: 20, backgroundColor: 'rgba(100,116,139,0.3)' },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  variantSection: { marginBottom: 20 },
  variantRow: { flexDirection: 'row', gap: 10 },
  variantChip: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  variantChipText: { fontSize: 13, fontWeight: '700' },
  variantPrice: { fontSize: 11 },

  descSection: { marginBottom: 20 },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },

  actionBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  actionBtn: { width: '100%' },
})

export default ProductDetailModal
