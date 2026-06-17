import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Video from 'react-native-video'
import Defaults from '../../config/index'
import { THEME } from '../assets/styles/theme'
import { useResponsive } from '../assets/styles/responsive'

// ─── Helpers ────────────────────────────────────────────────────────────────

const stripHtml = (html: string): string =>
  (html ?? '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  const cleaned = imagePath.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http') ? cleaned : `${Defaults.apis.baseUrl}/${cleaned}`
}

// ─── Types (matches the real `/products/:id` response) ──────────────────────

type DetailVariant = {
  Id: number
  CompanyId: number
  ProductId: number
  Barcode: string
  Price: string
  Stock: number
  ProductAttributeId: number
  ProductAttributeValueId: number
  ProductAttribute?: { Id: number; Name: string; AttributeNameCode: string }
  ProductAttributeValue?: { Id: number; Name: string; AttributeValueCode: string }
}

type ProductAttribute = {
  Id: number
  Name: string
  AttributeNameCode: string
}

type ProductAttributeValue = {
  Id: number
  ProductAttributeId: number
  Name: string
  AttributeValueCode: string
}

export type ApiProductDetail = {
  id: number
  name: string
  description: string
  price: string
  barcode: string
  image: string
  images: string[] | null
  video?: string | null
  category: string
  product_type: 'simple' | 'variant'
  stock_in_hand: number
  status: 'active' | 'inactive'
  variants: DetailVariant[]
  ProductAttributes?: ProductAttribute[]
  ProductAttributeValues?: ProductAttributeValue[]
}

interface ApiProductDetailModalProps {
  visible: boolean
  onClose: () => void
  productDetail: ApiProductDetail | null
  loading: boolean
  qty: number
  onAdd: (id: number) => void
  onIncrease: (id: number) => void
  onDecrease: (id: number) => void
}

const ApiProductDetailModal = ({
  visible,
  onClose,
  productDetail,
  loading,
  qty,
  onAdd,
  onIncrease,
  onDecrease,
}: ApiProductDetailModalProps) => {
  const insets = useSafeAreaInsets()
  const r = useResponsive()
  // On tablets the sheet is a centred card rather than a full-width drawer.
  const sheetWidth = r.isTablet ? Math.min(560, r.width) : r.width

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)

  useEffect(() => {
    if (productDetail) {
      setSelectedVariantId(
        productDetail.product_type === 'variant' && productDetail.variants?.length > 0
          ? productDetail.variants[0].Id
          : null
      )
      setActiveImageIndex(0)
      setVideoPlaying(false)
      setVideoLoading(true)
    }
  }, [productDetail?.id])

  if (!visible) return null

  const images: string[] = (productDetail?.images?.length
    ? productDetail.images
    : productDetail?.image
    ? [productDetail.image]
    : []
  ).map(buildImageUrl)

  const videoUri = productDetail?.video ? buildImageUrl(productDetail.video) : null

  const mediaItems: { type: 'image' | 'video'; uri: string }[] = [
    ...images.map(uri => ({ type: 'image' as const, uri })),
    ...(videoUri ? [{ type: 'video' as const, uri: videoUri }] : []),
  ]

  const isVariantType = productDetail?.product_type === 'variant'

  const selectedVariant = productDetail?.variants?.find(v => v.Id === selectedVariantId)

  const description = stripHtml(productDetail?.description ?? '')

  const stock: number = isVariantType
    ? selectedVariant?.Stock ?? 0
    : productDetail?.stock_in_hand ?? 0

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[modalStyles.overlay, r.isTablet && modalStyles.overlayCentered]}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={[modalStyles.sheet, { width: sheetWidth }, r.isTablet && modalStyles.sheetTablet]}>
          <View style={modalStyles.handle} />

          <TouchableOpacity
            style={modalStyles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={modalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={modalStyles.loaderBox}>
              <ActivityIndicator size="large" color={THEME.COLOR.primary} />
              <Text style={modalStyles.loaderText}>Loading details…</Text>
            </View>
          ) : !productDetail ? (
            <View style={modalStyles.loaderBox}>
              <Text style={modalStyles.loaderEmoji}>😕</Text>
              <Text style={modalStyles.loaderText}>Failed to load product.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scrollContent}>
              {/* ── Media Carousel (images, then video as the last slide) ── */}
              {mediaItems.length > 0 ? (
                <View style={modalStyles.imageSection}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={e => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / sheetWidth)
                      setActiveImageIndex(idx)
                      if (mediaItems[idx]?.type !== 'video') setVideoPlaying(false)
                    }}
                  >
                    {mediaItems.map((mediaItem, idx) =>
                      mediaItem.type === 'image' ? (
                        <Image
                          key={idx}
                          source={{ uri: mediaItem.uri }}
                          style={[modalStyles.productImage, { width: sheetWidth }]}
                          resizeMode="contain"
                        />
                      ) : videoPlaying ? (
                        <View key={idx} style={[modalStyles.videoPlayer, { width: sheetWidth }]}>
                          <Video
                            source={{ uri: mediaItem.uri }}
                            style={modalStyles.video}
                            controls
                            resizeMode="contain"
                            paused={false}
                            onLoadStart={() => setVideoLoading(true)}
                            onLoad={() => setVideoLoading(false)}
                            onError={() => setVideoPlaying(false)}
                          />
                          {videoLoading && (
                            <View style={modalStyles.videoLoaderOverlay}>
                              <ActivityIndicator size="large" color="#fff" />
                            </View>
                          )}
                        </View>
                      ) : (
                        <TouchableOpacity
                          key={idx}
                          style={[modalStyles.videoThumb, { width: sheetWidth }]}
                          activeOpacity={0.85}
                          onPress={() => setVideoPlaying(true)}
                        >
                          {images[0] ? (
                            <Image source={{ uri: images[0] }} style={modalStyles.videoThumbImg} resizeMode="cover" />
                          ) : null}
                          <View style={modalStyles.videoThumbOverlay} />
                          <View style={modalStyles.playBtn}>
                            <Text style={modalStyles.playBtnIcon}>▶</Text>
                          </View>
                          <Text style={modalStyles.videoThumbLabel}>Watch Video</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </ScrollView>

                  {mediaItems.length > 1 && (
                    <View style={modalStyles.dotsRow}>
                      {mediaItems.map((_, idx) => (
                        <View
                          key={idx}
                          style={[modalStyles.dot, idx === activeImageIndex && modalStyles.dotActive]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={modalStyles.noImageBox}>
                  <Text style={modalStyles.noImageEmoji}>📦</Text>
                  <Text style={modalStyles.noImageText}>No Image</Text>
                </View>
              )}

              {/* ── Product Info ── */}
              <View style={modalStyles.infoSection}>
                <Text style={modalStyles.productTitle}>{productDetail.name}</Text>

                {/* ── Meta chips: category, status, barcode ── */}
                <View style={modalStyles.metaRow}>
                  {productDetail.category ? (
                    <View style={modalStyles.metaChip}>
                      <Text style={modalStyles.metaText}>{productDetail.category}</Text>
                    </View>
                  ) : null}
                  <View style={[modalStyles.metaChip, { backgroundColor: productDetail.status === 'active' ? THEME.COLOR.successBg : THEME.COLOR.dangerBg }]}>
                    <Text style={[modalStyles.metaText, { color: productDetail.status === 'active' ? THEME.COLOR.success : THEME.COLOR.danger }]}>
                      {productDetail.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <View style={modalStyles.metaChip}>
                    <Text style={modalStyles.metaText}>#{productDetail.barcode}</Text>
                  </View>
                </View>

                {/* ── Product-level price & total stock ── */}
                <View style={modalStyles.priceStockRow}>
                  <View>
                    <Text style={modalStyles.priceLabelSmall}>
                      {isVariantType ? 'Base Price' : 'Price'}
                    </Text>
                    <Text style={modalStyles.price}>
                      ₹{parseFloat(productDetail.price).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={modalStyles.stockInfoBox}>
                    <Text style={modalStyles.stockInfoValue}>{productDetail.stock_in_hand}</Text>
                    <Text style={modalStyles.stockInfoLabel}>Total Units</Text>
                  </View>
                </View>

                {/* ── Attribute Selector ── */}
                {isVariantType && (productDetail.ProductAttributes?.length ?? 0) > 0 && (
                  <View style={modalStyles.variantSection}>
                    {productDetail.ProductAttributes!.map(attr => {
                      const values = (productDetail.ProductAttributeValues ?? []).filter(
                        v => v.ProductAttributeId === attr.Id,
                      )
                      return (
                        <View key={attr.Id} style={modalStyles.attrGroup}>
                          <Text style={modalStyles.attrGroupLabel}>{attr.Name}</Text>
                          <View style={modalStyles.chipRow}>
                            {values.map(val => {
                              const variant = productDetail.variants?.find(
                                v => v.ProductAttributeValueId === val.Id,
                              )
                              const effectiveStock = variant ? variant.Stock : productDetail.stock_in_hand
                              const isSelected = !!variant && variant.Id === selectedVariantId
                              const isUnavailable = effectiveStock === 0
                              return (
                                <TouchableOpacity
                                  key={val.Id}
                                  style={[
                                    modalStyles.chip,
                                    isSelected && modalStyles.chipSelected,
                                    isUnavailable && modalStyles.chipUnavailable,
                                  ]}
                                  onPress={() => {
                                    if (variant && !isUnavailable) setSelectedVariantId(variant.Id)
                                  }}
                                  disabled={isUnavailable}
                                  activeOpacity={0.75}
                                >
                                  <Text
                                    style={[
                                      modalStyles.chipValueName,
                                      isSelected && modalStyles.chipTextSelected,
                                      isUnavailable && modalStyles.chipTextUnavailable,
                                    ]}
                                  >
                                    {val.Name}
                                  </Text>
                                  <>
                                    <Text style={[modalStyles.chipPrice, isSelected && modalStyles.chipTextSelected]}>
                                      ₹{parseFloat(variant ? variant.Price : productDetail.price).toLocaleString('en-IN')}
                                    </Text>
                                    <Text
                                      style={[
                                        modalStyles.chipStock,
                                        { color: effectiveStock > 0 ? THEME.COLOR.success : THEME.COLOR.danger },
                                      ]}
                                    >
                                      {effectiveStock > 0 ? `${effectiveStock} left` : 'Out of Stock'}
                                    </Text>
                                  </>
                                </TouchableOpacity>
                              )
                            })}
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}

                {/* ── Description ── */}
                {description ? (
                  <View style={modalStyles.descSection}>
                    <Text style={modalStyles.sectionLabel}>Description</Text>
                    <Text style={modalStyles.descText}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          )}

          {/* ── Bottom Actions ── */}
          {!loading && productDetail && stock > 0 && (
            <View style={[modalStyles.actionBar, { paddingBottom: 14 + insets.bottom }]}>
              {qty === 0 ? (
                <TouchableOpacity
                  style={modalStyles.cartBtnModal}
                  onPress={() => onAdd(productDetail.id)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Add to cart"
                >
                  <Text style={modalStyles.cartBtnText}>Add to Cart</Text>
                </TouchableOpacity>
              ) : (
                <View style={modalStyles.stepperModal}>
                  <TouchableOpacity style={modalStyles.stepBtnModal} onPress={() => onDecrease(productDetail.id)} accessibilityLabel="Decrease quantity">
                    <Text style={modalStyles.stepTxtModal}>−</Text>
                  </TouchableOpacity>
                  <Text style={modalStyles.stepQtyModal}>{qty}</Text>
                  <TouchableOpacity style={modalStyles.stepBtnModal} onPress={() => onIncrease(productDetail.id)} accessibilityLabel="Increase quantity">
                    <Text style={modalStyles.stepTxtModal}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayCentered: { justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: THEME.COLOR.overlay },
  sheet: {
    backgroundColor: THEME.COLOR.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 0,
    overflow: 'hidden',
  },
  sheetTablet: { borderRadius: 24, maxHeight: '88%' },
  handle: { width: 44, height: 5, backgroundColor: THEME.COLOR.border, borderRadius: 3, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: 18,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: THEME.COLOR.textSecondary, fontFamily: THEME.FONTWEIGHT.Bold },

  loaderBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 12 },
  loaderEmoji: { fontSize: 40 },
  loaderText: { fontSize: 14, color: THEME.COLOR.textSecondary, fontFamily: THEME.FONTWEIGHT.Regular },

  scrollContent: { paddingBottom: 20 },

  imageSection: { backgroundColor: THEME.COLOR.surfaceAlt },
  productImage: { height: 280 },
  noImageBox: { height: 220, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.COLOR.surfaceAlt, gap: 8 },
  noImageEmoji: { fontSize: 44 },
  noImageText: { color: THEME.COLOR.textTertiary, fontSize: 14, fontFamily: THEME.FONTWEIGHT.Medium },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.COLOR.bgGrey },
  dotActive: { backgroundColor: THEME.COLOR.primary, width: 20 },

  videoThumb: { height: 280, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  videoThumbImg: { ...StyleSheet.absoluteFillObject },
  videoThumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  playBtnIcon: { fontSize: 22, color: THEME.COLOR.primary, marginLeft: 3 },
  videoThumbLabel: { position: 'absolute', bottom: 12, color: '#fff', fontSize: 12, fontFamily: THEME.FONTWEIGHT.Bold },
  videoPlayer: { height: 280, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  videoLoaderOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  infoSection: { paddingHorizontal: 20, paddingTop: 16 },

  productTitle: { fontSize: 20, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary, lineHeight: 28, letterSpacing: -0.3 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 12 },
  metaChip: { backgroundColor: THEME.COLOR.surfaceAlt, borderRadius: THEME.RADIUS.small, paddingHorizontal: 10, paddingVertical: 5 },
  metaText: { fontSize: 12, color: THEME.COLOR.textSecondary, fontFamily: THEME.FONTWEIGHT.Medium },

  priceStockRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  priceLabelSmall: { fontSize: 11, fontFamily: THEME.FONTWEIGHT.Medium, color: THEME.COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  price: { fontSize: 26, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.primary },
  stockInfoBox: { alignItems: 'center', backgroundColor: THEME.COLOR.surfaceAlt, borderRadius: THEME.RADIUS.medium, paddingHorizontal: 16, paddingVertical: 8 },
  stockInfoValue: { fontSize: 20, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  stockInfoLabel: { fontSize: 10, fontFamily: THEME.FONTWEIGHT.Medium, color: THEME.COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },

  stockRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, marginBottom: 18, paddingHorizontal: 12, paddingVertical: 7, borderRadius: THEME.RADIUS.pill },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold },

  sectionLabel: { fontSize: 12, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },

  variantSection: { marginBottom: 18 },

  attrGroup: { marginBottom: 16 },
  attrGroupLabel: { fontSize: 13, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: THEME.COLOR.border,
    borderRadius: THEME.RADIUS.small,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: THEME.COLOR.surface,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 3,
    minWidth: 80,
  },
  chipSelected: { borderColor: THEME.COLOR.primary, backgroundColor: THEME.COLOR.primaryLight },
  chipUnavailable: { opacity: 0.4, backgroundColor: THEME.COLOR.surfaceAlt },
  chipValueName: { fontSize: 15, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  chipText: { fontSize: 14, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  chipTextSelected: { color: THEME.COLOR.primaryDark },
  chipTextUnavailable: { color: THEME.COLOR.textTertiary },
  chipPrice: { fontSize: 12, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.textPrimary },
  chipStock: { fontSize: 10, fontFamily: THEME.FONTWEIGHT.Medium },
  chipUnavailableLabel: { fontSize: 10, fontFamily: THEME.FONTWEIGHT.Bold, color: THEME.COLOR.danger },

  descSection: { marginBottom: 16 },
  descText: { fontSize: 14, color: THEME.COLOR.textSecondary, lineHeight: 22, fontFamily: THEME.FONTWEIGHT.Regular },

  actionBar: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: THEME.COLOR.border, backgroundColor: THEME.COLOR.surface },
  cartBtnModal: { backgroundColor: THEME.COLOR.primary, borderRadius: THEME.RADIUS.medium, paddingVertical: 15, alignItems: 'center', flex: 1, ...THEME.SHADOW.card },
  cartBtnText: { color: '#fff', fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold, letterSpacing: 0.3 },
  stepperModal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.COLOR.primary, borderRadius: THEME.RADIUS.medium, flex: 1 },
  stepBtnModal: { paddingHorizontal: 28, paddingVertical: 15 },
  stepTxtModal: { color: '#fff', fontSize: 18, fontFamily: THEME.FONTWEIGHT.Bold },
  stepQtyModal: { color: '#fff', fontSize: 16, fontFamily: THEME.FONTWEIGHT.Bold, minWidth: 30, textAlign: 'center' },
})

export default ApiProductDetailModal
