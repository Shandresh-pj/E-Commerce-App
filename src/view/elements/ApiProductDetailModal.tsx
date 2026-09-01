import React, { useState, useEffect, useRef } from 'react'
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
  Dimensions,
  Alert,
  Share,
  Animated,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Video from 'react-native-video'
import LinearGradient from 'react-native-linear-gradient'
import Defaults from '../../config/index'
import { toggleWishlist } from '../../shared/services/main-service'
import Toast from 'react-native-root-toast'
import { buildImageUrl, getFallbackImage } from '../../shared/utils/imageHelper'
import { SvkIcon } from '../../design-system/icons/SvkIcon'
import { BlurhashImage } from '../../design-system/components/BlurhashImage'
import { useTheme } from '../../hooks/useTheme'

const { width: W } = Dimensions.get('window')

const stripHtml = (html: string): string =>
  (html ?? '')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const TILE_COLORS = ['#F8FAFC', '#F1F5F9', '#EFF6FF', '#ECFDF5', '#F5F3FF', '#FFF7ED']

const DEFAULT_HIGHLIGHTS = [
  'Freshly sourced and quality checked by official SVK labs',
  'Stored and delivered under temperature controlled care',
  'Hassle-free easy 7-day returns & replacement guarantee',
  'Best value price match direct from authorized distributor',
]

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
  [key: string]: any
}

type ProductAttribute = { Id: number; Name: string; AttributeNameCode: string }
type ProductAttributeValue = {
  Id: number
  ProductAttributeId: number
  Name: string
  AttributeValueCode: string
}

type AttributeDetail = {
  Id: number
  ProductId: number
  ProductAttributeId: number
  ProductAttributeValueId: number
  AttributeName: string
  AttributeValue: string
}

type CreatorDetail = {
  id: number
  name: string
  email: string
  mobilenumber?: string
  userType?: string
  status?: string
  [key: string]: any
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
  product_type: 'simple' | 'variant' | 'single'
  stock_in_hand: number
  status: 'active' | 'inactive'
  variants: DetailVariant[]
  ProductAttributes?: ProductAttribute[]
  ProductAttributeValues?: ProductAttributeValue[]
  Attributes?: AttributeDetail[]
  creator?: CreatorDetail
  manufacture_date?: string
  expiry_date?: string
  approval_status?: string
  low_stock_threshold?: number
  critical_stock_threshold?: number
  stock?: number
  [key: string]: any
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
  onViewCart?: () => void
  related?: any[]
  onSelectRelated?: (id: number) => void
}

const num = (v: any) => {
  const n = parseFloat(String(v ?? ''))
  return isNaN(n) ? 0 : n
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
  onViewCart,
  related = [],
  onSelectRelated,
}: ApiProductDetailModalProps) => {
  const insets = useSafeAreaInsets()
  const { tokens, isDark } = useTheme()

  const mediaScrollRef = useRef<ScrollView>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [wished, setWished] = useState(false)
  const [wishLoading, setWishLoading] = useState(false)
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  const handleShare = async () => {
    if (!productDetail) return
    try {
      await Share.share({
        message: `Check out ${productDetail.name} for ₹${price.toFixed(2)} on SVK Store!`,
        title: productDetail.name,
      })
    } catch (error) {
      console.log('Share error:', error)
    }
  }

  useEffect(() => {
    if (productDetail) {
      setSelectedVariantId(
        productDetail.product_type === 'variant' && productDetail.variants?.length > 0
          ? productDetail.variants[0].Id
          : null,
      )
      setActiveImageIndex(0)
      setVideoPlaying(false)
      setVideoLoading(true)
      setWished(false)
      setFailedImages({})
      setFullscreenImage(null)
    }
  }, [productDetail])

  if (!visible) return null

  const images: string[] = (() => {
    if (!productDetail) return []
    const rawList: string[] = []

    if (productDetail.image && typeof productDetail.image === 'string') {
      rawList.push(productDetail.image)
    }
    if (productDetail.ImagePath && typeof productDetail.ImagePath === 'string') {
      rawList.push(productDetail.ImagePath)
    }

    if (Array.isArray(productDetail.images) && productDetail.images.length > 0) {
      productDetail.images.forEach((img: any) => {
        const u = typeof img === 'string' ? img : img?.ImagePath || img?.ImageName || img?.url
        if (u) rawList.push(u)
      })
    }

    const nameStr = productDetail.name || productDetail.Name || ''
    const uniqueRaw = Array.from(new Set(rawList.filter(Boolean)))
    const resolved = uniqueRaw.map(u => buildImageUrl(u, nameStr, 'product'))
    const fallback = getFallbackImage(nameStr, 'product')

    if (resolved.length === 0) {
      return [fallback]
    }
    return resolved
  })()

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
    : (productDetail?.stock_in_hand ?? productDetail?.stock ?? 0)

  const price = selectedVariant ? num(selectedVariant.Price) : num(productDetail?.price)
  const mrp = num(
    (selectedVariant as any)?.Mrp ??
    (selectedVariant as any)?.compare_at_price ??
    productDetail?.mrp ??
    productDetail?.compare_at_price ??
    (price * 1.2),
  )
  const discount = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0
  const total = qty > 0 ? price * qty : price

  const unit = productDetail?.base_unit || productDetail?.unit || productDetail?.weight || ''
  const ratingRaw = productDetail?.rating ?? productDetail?.avg_rating
  const rating = ratingRaw != null && num(ratingRaw) > 0 ? num(ratingRaw).toFixed(1) : '4.8'

  const highlights: string[] = (() => {
    if (Array.isArray(productDetail?.Attributes) && productDetail!.Attributes.length > 0) {
      const attrLines = productDetail!.Attributes
        .map((a: any) => a?.AttributeValue || a?.AttributeName)
        .filter(Boolean)
      if (attrLines.length > 0) return attrLines
    }
    if (description) {
      const parts = description
        .split(/[.\n•|]/)
        .map(p => p.trim())
        .filter(
          p =>
            p.length > 3 &&
            /[a-zA-Z]{3,}/.test(p) &&
            !/[{}\[\]"<>]|::|ProductAttribute|AttributeValue/i.test(p),
        )
      if (parts.length) return parts.slice(0, 5)
    }
    return DEFAULT_HIGHLIGHTS
  })()

  const relatedList = (related || []).filter(r => r && r.id !== productDetail?.id).slice(0, 8)
  const letter = productDetail?.name ? productDetail.name[0].toUpperCase() : '📦'

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />

        <View style={[s.sheet, { backgroundColor: isDark ? '#0B132B' : '#FFFFFF' }]}>
          {loading ? (
            <View style={s.loaderBox}>
              <ActivityIndicator size="large" color={tokens.brand.primary} />
              <Text style={[s.loaderText, { color: tokens.content.secondary }]}>Loading details…</Text>
            </View>
          ) : !productDetail ? (
            <View style={s.loaderBox}>
              <Text style={s.loaderEmoji}>😕</Text>
              <Text style={[s.loaderText, { color: tokens.content.secondary }]}>Failed to load product.</Text>
            </View>
          ) : (
            <React.Fragment>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                
                {/* Hero Media Container */}
                <View style={[s.imageSection, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  
                  {/* Floating Action Buttons */}
                  <View style={[s.topActions, { top: insets.top + 10 }]}>
                    <Pressable
                      style={({ pressed }) => [
                        s.roundBtn,
                        { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)' },
                        pressed && { scale: 0.9 },
                      ]}
                      onPress={onClose}
                    >
                      <SvkIcon name="back" size={18} color={tokens.content.primary} />
                    </Pressable>

                    <View style={s.topActionsRight}>
                      <Pressable
                        style={({ pressed }) => [
                          s.roundBtn,
                          { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)' },
                          pressed && { scale: 0.9 },
                        ]}
                        onPress={async () => {
                          if (!productDetail || wishLoading) return
                          setWishLoading(true)
                          try {
                            const success = await toggleWishlist(productDetail.id, wished)
                            if (success) {
                              setWished(w => !w)
                              Toast.show(!wished ? 'Added to Wishlist ♥' : 'Removed from Wishlist', { duration: Toast.durations.SHORT })
                            }
                          } finally {
                            setWishLoading(false)
                          }
                        }}
                      >
                        {wishLoading ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <SvkIcon
                            name={wished ? 'heartFilled' : 'heart'}
                            size={18}
                            color={wished ? '#EF4444' : tokens.content.primary}
                          />
                        )}
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          s.roundBtn,
                          { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)' },
                          pressed && { scale: 0.9 },
                        ]}
                        onPress={handleShare}
                      >
                        <SvkIcon name="share" size={18} color={tokens.content.primary} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Main Media Carousel */}
                  {mediaItems.length > 0 ? (
                    <>
                      <ScrollView
                        ref={mediaScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e => {
                          const idx = Math.round(e.nativeEvent.contentOffset.x / W)
                          setActiveImageIndex(idx)
                          if (mediaItems[idx]?.type !== 'video') setVideoPlaying(false)
                        }}
                      >
                        {mediaItems.map((mediaItem, idx) =>
                          mediaItem.type === 'image' ? (
                            <TouchableOpacity
                              key={idx}
                              activeOpacity={0.92}
                              onPress={() =>
                                setFullscreenImage(
                                  failedImages[idx]
                                    ? getFallbackImage(productDetail?.name, 'product')
                                    : mediaItem.uri,
                                )
                              }
                              style={{ width: W, height: 250, justifyContent: 'center', alignItems: 'center' }}
                            >
                              <BlurhashImage
                                category={productDetail?.name}
                                source={{
                                  uri: failedImages[idx]
                                    ? getFallbackImage(productDetail?.name, 'product')
                                    : mediaItem.uri,
                                }}
                                style={{ width: W * 0.85, height: 230 }}
                                resizeMode="contain"
                                onError={() => setFailedImages(prev => ({ ...prev, [idx]: true }))}
                              />
                            </TouchableOpacity>
                          ) : (
                            <View key={idx} style={{ width: W, height: 250, justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ color: tokens.content.primary }}>Video Preview</Text>
                            </View>
                          )
                        )}
                      </ScrollView>

                      {/* Pagination Dots */}
                      {mediaItems.length > 1 && (
                        <View style={s.dotsRow}>
                          {mediaItems.map((_, idx) => (
                            <View
                              key={idx}
                              style={[
                                s.dot,
                                { backgroundColor: idx === activeImageIndex ? tokens.brand.primary : 'rgba(148, 163, 184, 0.4)' },
                                idx === activeImageIndex && { width: 16 },
                              ]}
                            />
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={s.noImageBox}>
                      <Text style={s.bigLetter}>{letter}</Text>
                    </View>
                  )}
                </View>

                {/* Thumbnail Strip (below hero section to prevent overlap) */}
                {mediaItems.length > 1 && (
                  <View style={s.thumbBarWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbScroll}>
                      {mediaItems.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.85}
                          onPress={() => {
                            setActiveImageIndex(idx)
                            mediaScrollRef.current?.scrollTo({ x: idx * W, animated: true })
                          }}
                          style={[
                            s.thumbBox,
                            { borderColor: idx === activeImageIndex ? tokens.brand.primary : 'transparent' },
                          ]}
                        >
                          <Image
                            source={{
                              uri: failedImages[idx]
                                ? getFallbackImage(productDetail?.name, 'product')
                                : item.uri,
                            }}
                            style={s.thumbImg}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Details Section */}
                <View style={s.infoSection}>
                  
                  {/* Category Pill & Express Delivery Tag */}
                  <View style={s.tagRow}>
                    <View style={[s.catPill, { backgroundColor: tokens.brand.primarySoft }]}>
                      <Text style={[s.catPillText, { color: tokens.brand.primary }]}>
                        {productDetail.category || 'Standard'}
                      </Text>
                    </View>
                    {unit ? (
                      <View style={[s.catPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        <Text style={[s.catPillText, { color: tokens.content.secondary }]}>
                          {unit}
                        </Text>
                      </View>
                    ) : null}
                    <View style={s.deliveryPill}>
                      <Text style={s.deliveryPillText}>⚡ Express 10-Min Delivery</Text>
                    </View>
                  </View>

                  {/* Title & Rating */}
                  <View style={s.titleRow}>
                    <Text style={[s.productTitle, { color: tokens.content.primary }]}>
                      {productDetail.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <SvkIcon name="star" size={14} color="#F59E0B" />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706', marginLeft: 4 }}>
                        {rating}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing Header Block */}
                  <View style={[s.priceBlock, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F8FAFC' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={[s.price, { color: tokens.brand.primary }]}>
                        ₹{price.toFixed(2)}
                      </Text>
                      {mrp > price && (
                        <Text style={[s.mrp, { color: tokens.content.tertiary }]}>
                          ₹{mrp.toFixed(2)}
                        </Text>
                      )}
                    </View>
                    {discount > 0 && (
                      <View style={s.discountBadge}>
                        <Text style={s.discountText}>{discount}% OFF</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.taxNote, { color: tokens.content.tertiary }]}>Inclusive of all taxes & free shipping options</Text>

                  {/* Feature Cards Grid */}
                  <View style={s.featureRow}>
                    {[
                      { icon: 'truck', label: '10-Min\nExpress' },
                      { icon: 'shieldCheck', label: 'Verified\nQuality' },
                      { icon: 'coins', label: 'Best\nValue' },
                    ].map(f => (
                      <View
                        key={f.label}
                        style={[
                          s.featureCard,
                          {
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#F8FAFC',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
                          },
                        ]}
                      >
                        <SvkIcon name={f.icon as any} size={20} color={tokens.brand.primary} />
                        <Text style={[s.featureLabel, { color: tokens.content.primary }]}>{f.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Highlights */}
                  <Text style={[s.blockTitle, { color: tokens.content.primary }]}>Product Highlights</Text>
                  <View
                    style={[
                      s.highlightCard,
                      {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
                      },
                    ]}
                  >
                    {highlights.map((h, i) => (
                      <View key={i} style={s.highlightRow}>
                        <View style={s.checkCircle}>
                          <SvkIcon name="checkCircle" size={14} color="#10B981" />
                        </View>
                        <Text style={[s.highlightText, { color: tokens.content.primary }]}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Description */}
                  {!!description && (
                    <View style={s.section}>
                      <Text style={[s.blockTitle, { color: tokens.content.primary }]}>Description</Text>
                      <View
                        style={[
                          s.descriptionCard,
                          {
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
                          },
                        ]}
                      >
                        <Text style={[s.descriptionText, { color: tokens.content.secondary }]}>{description}</Text>
                      </View>
                    </View>
                  )}

                  {/* Related Items Strip */}
                  {relatedList.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                      <Text style={[s.blockTitle, { color: tokens.content.primary }]}>You Might Also Like</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {relatedList.map((rel, idx) => (
                          <TouchableOpacity
                            key={rel.id || idx}
                            style={[
                              s.relatedCard,
                              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: tokens.border.default },
                            ]}
                            onPress={() => onSelectRelated?.(rel.id)}
                          >
                            <Image
                              source={{ uri: buildImageUrl(rel.image, rel.name, 'product') }}
                              style={s.relatedImg}
                              resizeMode="cover"
                            />
                            <Text style={[s.relatedName, { color: tokens.content.primary }]} numberOfLines={1}>
                              {rel.name}
                            </Text>
                            <Text style={[s.relatedPrice, { color: tokens.brand.primary }]}>
                              ₹{num(rel.price).toFixed(2)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                </View>
              </ScrollView>

              {/* Sticky Action Footer Bar */}
              <View
                style={[
                  s.actionBar,
                  {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
                    paddingBottom: 14 + insets.bottom,
                  },
                ]}
              >
                <View style={s.totalBox}>
                  <Text style={[s.totalLabel, { color: tokens.content.tertiary }]}>Total Amount</Text>
                  <Text style={[s.totalValue, { color: tokens.content.primary }]}>₹{total.toFixed(2)}</Text>
                </View>

                {stock > 0 ? (
                  qty === 0 ? (
                    <TouchableOpacity
                      style={[s.mainAddBtn, { backgroundColor: tokens.brand.primary }]}
                      onPress={() => onAdd(productDetail.id)}
                      activeOpacity={0.88}
                    >
                      <SvkIcon name="bag" size={18} color="#FFFFFF" />
                      <Text style={s.mainAddBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.stepperActionRow}>
                      {/* Quantity Stepper */}
                      <View style={[s.stepperBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        <TouchableOpacity
                          style={s.stepBtn}
                          onPress={() => onDecrease(productDetail.id)}
                          hitSlop={6}
                        >
                          <SvkIcon name="minus" size={14} color={tokens.content.primary} />
                        </TouchableOpacity>
                        <Text style={[s.stepQtyText, { color: tokens.content.primary }]}>{qty}</Text>
                        <TouchableOpacity
                          style={s.stepBtn}
                          onPress={() => onIncrease(productDetail.id)}
                          hitSlop={6}
                        >
                          <SvkIcon name="plus" size={14} color={tokens.content.primary} />
                        </TouchableOpacity>
                      </View>

                      {/* Go To Cart Button */}
                      <TouchableOpacity
                        style={[s.viewCartBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => {
                          onClose()
                          onViewCart?.()
                        }}
                        activeOpacity={0.88}
                      >
                        <Text style={s.viewCartText}>View Cart</Text>
                        <SvkIcon name="chevronRight" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )
                ) : (
                  <View style={[s.mainAddBtn, { backgroundColor: '#94A3B8' }]}>
                    <Text style={s.mainAddBtnText}>Out of Stock</Text>
                  </View>
                )}
              </View>

            </React.Fragment>
          )}
        </View>
      </View>

      {/* Fullscreen Image Zoom Modal */}
      {!!fullscreenImage && (
        <Modal
          visible={!!fullscreenImage}
          transparent
          animationType="fade"
          onRequestClose={() => setFullscreenImage(null)}
        >
          <View style={s.fullscreenOverlay}>
            <TouchableOpacity
              style={s.fullscreenCloseBtn}
              onPress={() => setFullscreenImage(null)}
            >
              <Text style={s.fullscreenCloseText}>✕ Close</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: fullscreenImage }}
              style={s.fullscreenImg}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </Modal>
  )
}

export default ApiProductDetailModal

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 8, 22, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '94%',
    minHeight: '60%',
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  loaderEmoji: {
    fontSize: 36,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageSection: {
    position: 'relative',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  noImageBox: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLetter: {
    fontSize: 48,
    fontWeight: '800',
    color: '#94A3B8',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginHorizontal: 3,
  },
  thumbBarWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  thumbScroll: {
    alignItems: 'center',
  },
  thumbBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
  },
  catPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  deliveryPill: {
    backgroundColor: 'rgba(246, 196, 83, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.35)',
  },
  deliveryPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#F59E0B',
  },
  titleRow: {
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  mrp: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#F6C453',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#F6C453',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: '#050816',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  taxNote: {
    fontSize: 11,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  highlightCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkCircle: {
    marginRight: 10,
  },
  highlightText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  section: {
    marginBottom: 18,
  },
  descriptionCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  descriptionText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  relatedCard: {
    width: 130,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 12,
  },
  relatedImg: {
    width: '100%',
    height: 94,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  totalBox: {
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  mainAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 26,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  mainAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  stepperActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQtyText: {
    fontSize: 16,
    fontWeight: '900',
    marginHorizontal: 12,
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullscreenCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fullscreenImg: {
    width: W,
    height: W * 1.2,
  },
})
