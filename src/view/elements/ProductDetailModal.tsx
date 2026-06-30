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
import { THEME } from '../assets/styles/theme'
import PrimaryButton from './PrimaryButton'

const { width: screenWidth } = Dimensions.get('window')

// ─── Helper Functions ─────────────────────────────────────────────────────────
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

// ─── Product Detail Modal ─────────────────────────────────────────────────────
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
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  )
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (productDetail) {
      setSelectedVariantId(
        productDetail.ProductVariant?.length > 0
          ? productDetail.ProductVariant[0].Id
          : null,
      )
      setActiveImageIndex(0)
    }
    // Re-init only when a different product loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDetail?.Id])

  if (!visible) return null

  const images: string[] =
    productDetail?.ProductImages?.map((pi: any) =>
      buildImageUrl(pi.Images.ImageName),
    ) ?? []

  const selectedVariant = productDetail?.ProductVariant?.find(
    (v: any) => v.Id === selectedVariantId,
  )

  const productName = productDetail?.ProductTranslations?.[0]?.Name ?? 'Product'
  const description = stripHtml(
    productDetail?.ProductTranslations?.[0]?.Description ?? '',
  )

  // ── ProductType: "Single" | "Variant" ──────────────────────────────────────
  const productType: string = productDetail?.ProductType ?? 'Single'
  const isVariantType = productType === 'Variant'

  const stock: number = isVariantType
    ? selectedVariant?.Stock
    : Math.floor(parseFloat(productDetail?.StockInHand ?? '0'))

  const isInCart = productDetail ? cartIds.has(productDetail.Id) : false

  // Cart payload includes variant details only when applicable
  const cartProduct = {
    id: productDetail?.Id,
    name: productName,
    points:
      isVariantType && selectedVariant
        ? parseFloat(selectedVariant.Price)
        : productDetail?.Points ?? 0,
    images: images,
    quantity: 1,
    ...(isVariantType && selectedVariant
      ? {
          variantId: selectedVariant.Id,
          variantCode: selectedVariant.ProductVariantCode,
          variantPrice: parseFloat(selectedVariant.Price),
        }
      : {}),
  }

  const scoreValue =
    selectedVariant && parseFloat(selectedVariant.Price) > 0
      ? parseFloat(selectedVariant.Price).toFixed(0)
      : productDetail?.Points

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          {/* Drag handle */}
          <View style={s.handle} />

          {/* Close button */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={s.loaderBox}>
              <ActivityIndicator size="large" color={THEME.COLOR.primary} />
              <Text style={s.loaderText}>Loading details...</Text>
            </View>
          ) : !productDetail ? (
            <View style={s.loaderBox}>
              <Text style={s.loaderText}>Failed to load product.</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scrollContent}
            >
              {/* ── Image Carousel ── */}
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

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <View style={s.dotsRow}>
                      {images.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            s.dot,
                            idx === activeImageIndex && s.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={s.noImageBox}>
                  <Text style={s.noImageText}>No Image</Text>
                </View>
              )}

              {/* ── Product Info ── */}
              <View style={s.infoSection}>
                <Text style={s.productTitle}>{productName}</Text>

                {/* Score / Price based on ProductType */}
                <View style={s.scoreRow}>
                  <Text style={s.scoreValue}>{scoreValue}</Text>
                  <Text style={s.scoreUnit}>Scores</Text>
                </View>

                {/* ── Stock Badge ── */}
                <View style={s.stockRow}>
                  <View
                    style={[
                      s.stockDot,
                      {
                        backgroundColor:
                          stock > 0 ? THEME.COLOR.success : THEME.COLOR.danger,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      s.stockText,
                      {
                        color:
                          stock > 0 ? THEME.COLOR.success : THEME.COLOR.danger,
                      },
                    ]}
                  >
                    {stock > 0
                      ? `In Stock (${stock} available)`
                      : 'Out of Stock'}
                  </Text>
                </View>

                {/* ── Variants — only shown when ProductType === "Variant" ── */}
                {isVariantType && productDetail.ProductVariant?.length > 0 && (
                  <View style={s.variantSection}>
                    <Text style={s.sectionLabel}>Select Variant</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={s.variantRow}>
                        {productDetail.ProductVariant.map((variant: any) => {
                          const isSelected = variant.Id === selectedVariantId
                          const variantLabel = variant.ProductVariantCode
                          const variantPriceVal = parseFloat(variant.Price)
                          const variantStock: number = variant.Stock ?? 0
                          const isColorVariant =
                            /^(red|green|blue|yellow|black|white|pink|orange|purple|grey|gray|brown)$/i.test(
                              variantLabel,
                            )
                          const isOutOfStock = variantStock === 0

                          return (
                            <TouchableOpacity
                              key={variant.Id}
                              style={[
                                s.variantChip,
                                isSelected && s.variantChipSelected,
                                isOutOfStock && s.variantChipDisabled,
                              ]}
                              onPress={() =>
                                !isOutOfStock && setSelectedVariantId(variant.Id)
                              }
                              disabled={isOutOfStock}
                            >
                              {isColorVariant && (
                                <View
                                  style={[
                                    s.colorDot,
                                    {
                                      backgroundColor: variantLabel.toLowerCase(),
                                    },
                                  ]}
                                />
                              )}
                              <Text
                                style={[
                                  s.variantChipText,
                                  isSelected && s.variantChipTextSelected,
                                  isOutOfStock && s.variantChipTextDisabled,
                                ]}
                              >
                                {variantLabel}
                              </Text>
                              <Text
                                style={[
                                  s.variantPrice,
                                  isSelected && s.variantPriceSelected,
                                ]}
                              >
                                {variantPriceVal.toFixed(0)} Scores
                              </Text>
                              {/* Per-variant stock indicator */}
                              <Text
                                style={[
                                  s.variantStockBadge,
                                  {
                                    color:
                                      variantStock > 0
                                        ? THEME.COLOR.success
                                        : THEME.COLOR.danger,
                                    borderColor:
                                      variantStock > 0
                                        ? THEME.COLOR.success
                                        : THEME.COLOR.danger,
                                  },
                                ]}
                              >
                                {variantStock > 0 ? `Qty: ${variantStock}` : 'N/A'}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* ── Description ── */}
                {description ? (
                  <View style={s.descSection}>
                    <Text style={s.sectionLabel}>Description</Text>
                    <Text style={s.descText}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          )}

          {/* ── Bottom Actions ── */}
          {!loading && productDetail && stock > 0 && onAddToCart && (
            <View style={s.actionBar}>
              <PrimaryButton
                label={isInCart ? 'Go to Cart' : 'Add to Cart'}
                variant={isInCart ? 'success' : 'primary'}
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
    backgroundColor: THEME.COLOR.overlay,
  },
  sheet: {
    backgroundColor: THEME.COLOR.surface,
    borderTopLeftRadius: THEME.RADIUS.xlarge,
    borderTopRightRadius: THEME.RADIUS.xlarge,
    maxHeight: '90%',
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.COLOR.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },

  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loaderText: { fontSize: 14, color: THEME.COLOR.textSecondary },

  scrollContent: { paddingBottom: 20 },

  imageSection: { backgroundColor: THEME.COLOR.surfaceAlt },
  productImage: { height: 280 },
  noImageBox: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.COLOR.surfaceAlt,
  },
  noImageText: { color: THEME.COLOR.textTertiary, fontSize: 16 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.COLOR.bgGrey,
  },
  dotActive: { backgroundColor: THEME.COLOR.primary, width: 18 },

  infoSection: { paddingHorizontal: THEME.SPACING.lg, paddingTop: 14 },

  productTitle: {
    fontSize: 19,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    lineHeight: 26,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: THEME.SPACING.sm,
  },
  scoreValue: {
    fontSize: 26,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.primaryDark,
  },
  scoreUnit: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: THEME.COLOR.textSecondary,
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold },

  sectionLabel: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  variantSection: { marginBottom: 16 },
  variantRow: { flexDirection: 'row', gap: 10 },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: THEME.COLOR.border,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: THEME.COLOR.surface,
  },
  variantChipSelected: {
    borderColor: THEME.COLOR.primary,
    backgroundColor: THEME.COLOR.primarySoft,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  variantChipText: {
    fontSize: 13,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  variantChipTextSelected: {
    color: THEME.COLOR.primary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  variantPrice: { fontSize: 12, color: THEME.COLOR.textTertiary },
  variantPriceSelected: {
    color: THEME.COLOR.primary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  variantChipDisabled: {
    borderColor: THEME.COLOR.border,
    backgroundColor: THEME.COLOR.surfaceAlt,
    opacity: 0.5,
  },
  variantChipTextDisabled: { color: THEME.COLOR.textTertiary },
  variantStockBadge: {
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Bold,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },

  descSection: { marginBottom: 16 },
  descText: {
    fontSize: 14,
    color: THEME.COLOR.textSecondary,
    lineHeight: 22,
  },

  actionBar: {
    paddingHorizontal: THEME.SPACING.lg,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.COLOR.border,
    backgroundColor: THEME.COLOR.surface,
  },
  actionBtn: { width: '100%' },
})

export default ProductDetailModal
