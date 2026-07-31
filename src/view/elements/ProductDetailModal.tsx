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
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
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

  const productType: string = productDetail?.ProductType ?? 'Single'
  const isVariantType = productType === 'Variant'

  const stock: number = isVariantType
    ? selectedVariant?.Stock
    : Math.floor(parseFloat(productDetail?.StockInHand ?? '0'))

  const isInCart = productDetail ? cartIds.has(productDetail.Id) : false

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
          <View style={s.handle} />

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={s.loaderBox}>
              <ActivityIndicator size="large" color="#0C831F" />
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
              {/* Image Carousel */}
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
                          style={[s.dot, idx === activeImageIndex && s.dotActive]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={s.noImageBox}>
                  <Text style={s.noImageEmoji}>📦</Text>
                  <Text style={s.noImageText}>No Image</Text>
                </View>
              )}

              {/* Product Info */}
              <View style={s.infoSection}>
                <Text style={s.productTitle}>{productName}</Text>

                <View style={s.scoreRow}>
                  <Text style={s.scoreValue}>{scoreValue}</Text>
                  <Text style={s.scoreUnit}>Scores</Text>
                </View>

                {/* Stock Badge */}
                <View style={s.stockRow}>
                  <View
                    style={[
                      s.stockDot,
                      { backgroundColor: stock > 0 ? '#0C831F' : '#EF4444' },
                    ]}
                  />
                  <Text
                    style={[
                      s.stockText,
                      { color: stock > 0 ? '#0C831F' : '#EF4444' },
                    ]}
                  >
                    {stock > 0
                      ? `In Stock (${stock} available)`
                      : 'Out of Stock'}
                  </Text>
                </View>

                {/* Variants */}
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
                                    { backgroundColor: variantLabel.toLowerCase() },
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
                              <Text
                                style={[
                                  s.variantStockBadge,
                                  {
                                    color: variantStock > 0 ? '#0C831F' : '#EF4444',
                                    borderColor: variantStock > 0 ? '#0C831F' : '#EF4444',
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

                {/* Description */}
                {description ? (
                  <View style={s.descSection}>
                    <Text style={s.sectionLabel}>Description</Text>
                    <Text style={s.descText}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          )}

          {/* Bottom Actions */}
          {!loading && productDetail && stock > 0 && onAddToCart && (
            <View style={s.actionBar}>
              <PrimaryButton
                label={isInCart ? 'Go to Cart' : 'Add to Cart'}
                variant={isInCart ? 'success' : 'success'}
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ECECEA',
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#8a8a8a',
    fontFamily: 'DMSans-Bold',
  },

  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loaderText: { fontSize: 14, color: '#8a8a8a', fontFamily: 'DMSans-Regular' },

  scrollContent: { paddingBottom: 20 },

  imageSection: { backgroundColor: 'rgba(255,255,255,0.4)' },
  productImage: { height: 280 },
  noImageBox: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    gap: 8,
  },
  noImageEmoji: { fontSize: 44 },
  noImageText: { color: '#9a9a9a', fontSize: 14, fontFamily: 'DMSans-Medium' },
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
    backgroundColor: '#ECECEA',
  },
  dotActive: { backgroundColor: '#0C831F', width: 18 },

  infoSection: { paddingHorizontal: 20, paddingTop: 14 },

  productTitle: {
    fontSize: 19,
    fontFamily: 'DMSans-Bold',
    color: '#141414',
    lineHeight: 26,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  scoreValue: {
    fontSize: 26,
    fontFamily: 'DMSans-Bold',
    color: '#0C831F',
  },
  scoreUnit: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#8a8a8a',
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontFamily: 'DMSans-Bold' },

  sectionLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#8a8a8a',
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
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  variantChipSelected: {
    borderColor: '#0C831F',
    backgroundColor: 'rgba(12,131,31,0.08)',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  variantChipText: {
    fontSize: 13,
    color: '#141414',
    fontFamily: 'DMSans-Medium',
  },
  variantChipTextSelected: {
    color: '#141414',
    fontFamily: 'DMSans-Bold',
  },
  variantPrice: { fontSize: 12, color: '#9a9a9a' },
  variantPriceSelected: {
    color: '#141414',
    fontFamily: 'DMSans-Bold',
  },
  variantChipDisabled: {
    borderColor: '#ECECEA',
    backgroundColor: 'rgba(255,255,255,0.3)',
    opacity: 0.5,
  },
  variantChipTextDisabled: { color: '#9a9a9a' },
  variantStockBadge: {
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },

  descSection: { marginBottom: 16 },
  descText: {
    fontSize: 14,
    color: '#8a8a8a',
    lineHeight: 22,
    fontFamily: 'DMSans-Regular',
  },

  actionBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ECECEA',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  actionBtn: { width: '100%' },
})

export default ProductDetailModal
