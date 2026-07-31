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
  Dimensions,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Video from 'react-native-video'
import Defaults from '../../config/index'
import { toggleWishlist } from '../../shared/services/main-service'
import Toast from 'react-native-root-toast'

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

const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  const cleaned = imagePath.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http') ? cleaned : `${Defaults.apis.baseUrl}/${cleaned}`
}

// Soft pastel backgrounds for image / related-product tiles
const TILE_COLORS = ['#E9ECFB', '#FFE0E0', '#FFF4D6', '#E4F6E6', '#EBE4FF', '#FFE9E0']

const DEFAULT_HIGHLIGHTS = [
  'Freshly sourced and quality checked',
  'Stored and delivered with care',
  'Easy returns if you are not happy',
  'Best value, everyday low price',
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
  /** Optional "You might also like" products (from the same screen list). */
  related?: any[]
  /** Called when a related product is tapped — parent can open its detail. */
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

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [wished, setWished] = useState(false)
  const [wishLoading, setWishLoading] = useState(false)

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Pricing
  const price = selectedVariant ? num(selectedVariant.Price) : num(productDetail?.price)
  const mrp = num(
    (selectedVariant as any)?.Mrp ??
      (selectedVariant as any)?.compare_at_price ??
      productDetail?.mrp ??
      productDetail?.compare_at_price,
  )
  const discount = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0
  const total = qty > 0 ? price * qty : price

  const unit = productDetail?.unit || productDetail?.weight || ''
  const ratingRaw = productDetail?.rating ?? productDetail?.avg_rating
  const rating = ratingRaw != null && num(ratingRaw) > 0 ? num(ratingRaw).toFixed(1) : null

  // Highlights: split description into short lines, else defaults
  const highlights: string[] = (() => {
    if (Array.isArray(productDetail?.highlights) && productDetail!.highlights.length) {
      return productDetail!.highlights.slice(0, 5)
    }
    if (description) {
      const parts = description
        .split(/[.\n•|]/)
        .map(p => p.trim())
        // keep only clean prose — drop lines that look like leaked JSON/code
        .filter(
          p =>
            p.length > 6 &&
            /[a-zA-Z]{3,}/.test(p) &&
            !/[{}\[\]"<>]|::|ProductAttribute|AttributeValue/i.test(p),
        )
      if (parts.length) return parts.slice(0, 5)
    }
    return  DEFAULT_HIGHLIGHTS
  })()

  const relatedList = (related || []).filter(r => r && r.id !== productDetail?.id).slice(0, 8)
  const letter = productDetail?.name ? productDetail.name[0].toUpperCase() : '📦'

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          {loading ? (
            <View style={s.loaderBox}>
              <ActivityIndicator size="large" color="#0C831F" />
              <Text style={s.loaderText}>Loading details…</Text>
            </View>
          ) : !productDetail ? (
            <View style={s.loaderBox}>
              <Text style={s.loaderEmoji}>😕</Text>
              <Text style={s.loaderText}>Failed to load product.</Text>
            </View>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {/* ===== Media + floating action buttons ===== */}
                <View style={[s.imageSection, { backgroundColor: TILE_COLORS[0] }]}>
                  {mediaItems.length > 0 ? (
                    <>
                      <ScrollView
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
                            <Image
                              key={idx}
                              source={{ uri: mediaItem.uri }}
                              style={s.productImage}
                              resizeMode="contain"
                            />
                          ) : videoPlaying ? (
                            <View key={idx} style={s.videoPlayer}>
                              <Video
                                source={{ uri: mediaItem.uri }}
                                style={s.video}
                                controls
                                resizeMode="contain"
                                paused={false}
                                onLoadStart={() => setVideoLoading(true)}
                                onLoad={() => setVideoLoading(false)}
                                onError={() => setVideoPlaying(false)}
                              />
                              {videoLoading && (
                                <View style={s.videoLoaderOverlay}>
                                  <ActivityIndicator size="large" color="#fff" />
                                </View>
                              )}
                            </View>
                          ) : (
                            <TouchableOpacity
                              key={idx}
                              style={s.videoThumb}
                              activeOpacity={0.85}
                              onPress={() => setVideoPlaying(true)}
                            >
                              {images[0] ? (
                                <Image source={{ uri: images[0] }} style={s.videoThumbImg} resizeMode="cover" />
                              ) : null}
                              <View style={s.videoThumbOverlay} />
                              <View style={s.playBtn}>
                                <Text style={s.playBtnIcon}>▶</Text>
                              </View>
                              <Text style={s.videoThumbLabel}>Watch Video</Text>
                            </TouchableOpacity>
                          ),
                        )}
                      </ScrollView>
                      {mediaItems.length > 1 && (
                        <View style={s.dotsRow}>
                          {mediaItems.map((_, idx) => (
                            <View key={idx} style={[s.dot, idx === activeImageIndex && s.dotActive]} />
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={s.noImageBox}>
                      <Text style={s.bigLetter}>{letter}</Text>
                    </View>
                  )}

                  {/* Top action row */}
                  <View style={s.topActions}>
                    <TouchableOpacity style={s.roundBtn} onPress={onClose} activeOpacity={0.85} accessibilityLabel="Back">
                      <Text style={s.roundBtnIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={s.topActionsRight}>
                      <TouchableOpacity
                        style={s.roundBtn}
                        onPress={async () => {
                          if (!productDetail || wishLoading) return
                          setWishLoading(true)
                          try {
                            const success = await toggleWishlist(productDetail.id, wished)
                            if (success) {
                              setWished(w => !w)
                              if (!wished) {
                                Alert.alert('Wishlist', 'Product added to wishlist successfully!')
                              } else {
                                Toast.show('Removed from wishlist', { duration: Toast.durations.SHORT })
                              }
                            } else {
                              Toast.show('Failed to update wishlist', { duration: Toast.durations.SHORT })
                            }
                          } finally {
                            setWishLoading(false)
                          }
                        }}
                        activeOpacity={0.85}
                        accessibilityLabel="Wishlist"
                      >
                        {wishLoading
                          ? <ActivityIndicator size="small" color="#e91e63" />
                          : <Text style={[s.roundBtnIcon, wished && { color: '#e91e63' }]}>{wished ? '♥' : '♡'}</Text>
                        }
                      </TouchableOpacity>
                      <TouchableOpacity style={s.roundBtn} activeOpacity={0.85} accessibilityLabel="Share">
                        <Text style={s.roundBtnIcon}>↗</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Delivery pill */}
                  <View style={s.deliveryPill}>
                    <Text style={s.deliveryBolt}>⚡</Text>
                    <Text style={s.deliveryPillText}>Delivery in 8 min</Text>
                  </View>
                </View>

                {/* ===== Info ===== */}
                <View style={s.infoSection}>
                  <View style={s.titleRow}>
                    <Text style={s.productTitle}>{productDetail.name}</Text>
                    {rating && (
                      <View style={s.ratingChip}>
                        <Text style={s.ratingText}>{rating} ★</Text>
                      </View>
                    )}
                  </View>
                  {!!unit && <Text style={s.unit}>{unit}</Text>}

                  {/* Price */}
                  <View style={s.priceRow}>
                    <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>
                    {mrp > price && <Text style={s.mrp}>₹{mrp.toLocaleString('en-IN')}</Text>}
                    {discount > 0 && (
                      <View style={s.discountBadge}>
                        <Text style={s.discountText}>{discount}% OFF</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.taxNote}>Inclusive of all taxes</Text>

                  {/* Pack size / variants */}
                  {isVariantType && (productDetail.variants?.length ?? 0) > 0 && (
                    <View style={s.block}>
                      <Text style={s.blockTitle}>Select pack size</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.packRow}
                      >
                        {productDetail.variants.map(v => {
                          const isSel = v.Id === selectedVariantId
                          const vLabel = v.ProductAttributeValue?.Name || v.ProductVariantCode || 'Pack'
                          const vPrice = num(v.Price)
                          const vMrp = num((v as any).Mrp ?? (v as any).compare_at_price)
                          const isOut = (v.Stock ?? 0) === 0
                          return (
                            <TouchableOpacity
                              key={v.Id}
                              style={[s.packCard, isSel && s.packCardSel, isOut && s.packCardOut]}
                              onPress={() => !isOut && setSelectedVariantId(v.Id)}
                              disabled={isOut}
                              activeOpacity={0.8}
                            >
                              <Text style={[s.packLabel, isSel && s.packLabelSel]} numberOfLines={1}>
                                {vLabel}
                              </Text>
                              <View style={s.packPriceRow}>
                                <Text style={[s.packPrice, isSel && s.packLabelSel]}>
                                  ₹{vPrice.toLocaleString('en-IN')}
                                </Text>
                                {vMrp > vPrice && <Text style={s.packMrp}>₹{vMrp.toLocaleString('en-IN')}</Text>}
                              </View>
                              {isOut && <Text style={s.packOut}>Out of stock</Text>}
                            </TouchableOpacity>
                          )
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* Feature cards */}
                  <View style={s.featureRow}>
                    {[
                      { icon: '⚡', label: '10-min\ndelivery' },
                      { icon: '↩️', label: 'Easy\nreturns' },
                      { icon: '✅', label: 'Quality\nchecked' },
                    ].map(f => (
                      <View key={f.label} style={s.featureCard}>
                        <Text style={s.featureIcon}>{f.icon}</Text>
                        <Text style={s.featureLabel}>{f.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Highlights */}
                  <Text style={[s.blockTitle, { marginTop: 22, marginBottom: 10 }]}>Highlights</Text>
                  <View style={s.highlightCard}>
                    {highlights.map((h, i) => (
                      <View key={i} style={[s.highlightRow, i < highlights.length - 1 && s.highlightDivider]}>
                        <Text style={s.highlightCheck}>✓</Text>
                        <Text style={s.highlightText}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Description */}
                  {!!productDetail.description && (
                    <View style={s.section}>
                      <Text style={s.blockTitle}>Product Description</Text>
                      <View style={s.descriptionCard}>
                        <Text style={s.descriptionText}>{description}</Text>
                      </View>
                    </View>
                  )}

                  {/* Attributes */}
                  {productDetail.Attributes && productDetail.Attributes.length > 0 && (
                    <View style={s.section}>
                      <Text style={s.blockTitle}>Specifications</Text>
                      <View style={s.attributesGrid}>
                        {productDetail.Attributes.map((attr, idx) => (
                          <View key={idx} style={[s.attributeRow, idx === productDetail.Attributes!.length - 1 && { borderBottomWidth: 0 }]}>
                            <Text style={s.attributeName}>{attr.AttributeName}</Text>
                            <Text style={s.attributeValue}>{attr.AttributeValue}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Timeline / Dates */}
                  {(productDetail.manufacture_date || productDetail.expiry_date) && (
                    <View style={s.section}>
                      <Text style={s.blockTitle}>Dates & Lifecycle</Text>
                      <View style={s.datesCard}>
                        {!!productDetail.manufacture_date && (
                          <View style={s.dateCol}>
                            <Text style={s.dateLabel}>🏭 Manufacture Date</Text>
                            <Text style={s.dateValue}>{productDetail.manufacture_date}</Text>
                          </View>
                        )}
                        {!!productDetail.manufacture_date && !!productDetail.expiry_date && (
                          <View style={s.dateDivider} />
                        )}
                        {!!productDetail.expiry_date && (
                          <View style={s.dateCol}>
                            <Text style={s.dateLabel}>⌛ Expiry Date</Text>
                            <Text style={s.dateValue}>{productDetail.expiry_date}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Stock & Barcode info */}
                  <View style={s.section}>
                    <Text style={s.blockTitle}>Inventory & Status</Text>
                    <View style={s.inventoryCard}>
                      <View style={s.invRow}>
                        <View style={s.invCol}>
                          <Text style={s.invLabel}>Stock In Hand</Text>
                          <Text style={s.invValue}>{stock} units</Text>
                        </View>
                        <View style={s.invCol}>
                          <Text style={s.invLabel}>Barcode</Text>
                          <Text style={s.invValue}>{productDetail.barcode || 'N/A'}</Text>
                        </View>
                      </View>
                      
                      <View style={s.invDivider} />

                      <View style={s.invRow}>
                        <View style={s.invCol}>
                          <Text style={s.invLabel}>System Status</Text>
                          <View style={[s.badge, productDetail.status === 'active' ? s.badgeActive : s.badgeInactive]}>
                            <Text style={[s.badgeText, productDetail.status === 'active' ? s.badgeTextActive : s.badgeTextInactive]}>
                              {(productDetail.status || 'inactive').toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <View style={s.invCol}>
                          <Text style={s.invLabel}>Approval Status</Text>
                          <View style={[s.badge, productDetail.approval_status === 'Published' ? s.badgeApproved : s.badgePending]}>
                            <Text style={[s.badgeText, productDetail.approval_status === 'Published' ? s.badgeTextApproved : s.badgeTextPending]}>
                              {productDetail.approval_status || 'Draft'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Show threshold warning if stock is low */}
                      {stock > 0 && productDetail.low_stock_threshold != null && stock <= productDetail.low_stock_threshold && (
                        <View style={[s.thresholdWarning, stock <= (productDetail.critical_stock_threshold ?? 0) ? s.thresholdCritical : s.thresholdLow]}>
                          <Text style={[s.thresholdText, stock <= (productDetail.critical_stock_threshold ?? 0) && { color: '#C0392B' }]}>
                            ⚠️ {stock <= (productDetail.critical_stock_threshold ?? 0) ? 'Critical Stock Warning!' : 'Low Stock Warning!'} Threshold: {productDetail.low_stock_threshold}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Creator Details */}
                  {productDetail.creator && (
                    <View style={s.section}>
                      <Text style={s.blockTitle}>Seller Information</Text>
                      <View style={s.creatorCard}>
                        <View style={s.creatorHeader}>
                          <View style={s.creatorAvatar}>
                            <Text style={s.creatorAvatarTxt}>
                              {productDetail.creator.name ? productDetail.creator.name[0].toUpperCase() : '👤'}
                            </Text>
                          </View>
                          <View style={s.creatorMeta}>
                            <Text style={s.creatorName}>{productDetail.creator.name}</Text>
                            <View style={s.roleBadge}>
                              <Text style={s.roleBadgeTxt}>{productDetail.creator.userType || 'Seller'}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={s.creatorDetailsRow}>
                          <View style={s.creatorDetailItem}>
                            <Text style={s.creatorItemLabel}>✉️ Email</Text>
                            <Text style={s.creatorItemValue} numberOfLines={1}>{productDetail.creator.email}</Text>
                          </View>
                          {!!productDetail.creator.mobilenumber && (
                            <View style={s.creatorDetailItem}>
                              <Text style={s.creatorItemLabel}>📞 Phone</Text>
                              <Text style={s.creatorItemValue}>{productDetail.creator.mobilenumber}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* You might also like */}
                  {relatedList.length > 0 && (
                    <>
                      <Text style={[s.blockTitle, { marginTop: 24, marginBottom: 12 }]}>You might also like</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.relatedRow}
                      >
                        {relatedList.map((item, idx) => {
                          const rImg = buildImageUrl(item.image)
                          const rPrice = num(item.price)
                          return (
                            <View key={item.id} style={s.relatedCard}>
                              <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => onSelectRelated?.(item.id)}
                              >
                                <View style={[s.relatedImg, { backgroundColor: TILE_COLORS[(idx + 1) % TILE_COLORS.length] }]}>
                                  {rImg ? (
                                    <Image source={{ uri: rImg }} style={s.relatedImgInner} resizeMode="contain" />
                                  ) : (
                                    <Text style={s.relatedLetter}>
                                      {item.name ? item.name[0].toUpperCase() : '📦'}
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                              <Text style={s.relatedName} numberOfLines={1}>{item.name}</Text>
                              <View style={s.relatedBottom}>
                                <Text style={s.relatedPrice}>₹{rPrice.toLocaleString('en-IN')}</Text>
                                <TouchableOpacity
                                  style={s.relatedAdd}
                                  onPress={() => onAdd(item.id)}
                                  activeOpacity={0.82}
                                >
                                  <Text style={s.relatedAddTxt}>ADD</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )
                        })}
                      </ScrollView>
                    </>
                  )}
                </View>
              </ScrollView>

              {/* ===== Bottom action bar ===== */}
              <View style={[s.actionBar, { paddingBottom: 12 + insets.bottom }]}>
                <View style={s.totalBox}>
                  <Text style={s.totalLabel}>Total</Text>
                  <Text style={s.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
                </View>

                {stock > 0 ? (
                  qty === 0 ? (
                    <TouchableOpacity
                      style={s.addBtn}
                      onPress={() => onAdd(productDetail.id)}
                      activeOpacity={0.88}
                      accessibilityLabel="Add to cart"
                    >
                      <Text style={s.addBtnText}>Add to cart</Text>
                      <Text style={s.addBtnCart}>🛒</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.qtyRow}>
                      <View style={s.stepper}>
                        <TouchableOpacity style={s.stepBtn} onPress={() => onDecrease(productDetail.id)}>
                          <Text style={s.stepTxt}>−</Text>
                        </TouchableOpacity>
                        <Text style={s.stepQty}>{qty}</Text>
                        <TouchableOpacity style={s.stepBtn} onPress={() => onIncrease(productDetail.id)}>
                          <Text style={s.stepTxt}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={s.cartBtn}
                        onPress={() => {
                          onClose()
                          onViewCart?.()
                        }}
                        activeOpacity={0.88}
                      >
                        <Text style={s.cartBtnText}>Cart</Text>
                        <Text style={s.cartBtnArrow}>→</Text>
                      </TouchableOpacity>
                    </View>
                  )
                ) : (
                  <View style={[s.addBtn, s.addBtnDisabled]}>
                    <Text style={s.addBtnText}>Out of stock</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '94%',
    overflow: 'hidden',
  },

  loaderBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  loaderEmoji: { fontSize: 40 },
  loaderText: { fontSize: 14, color: '#8a8a8a', fontFamily: 'DMSans-Regular' },

  scrollContent: { paddingBottom: 24 },

  // Media
  imageSection: { height: 320, position: 'relative' },
  productImage: { height: 320, width: W },
  noImageBox: { height: 320, alignItems: 'center', justifyContent: 'center' },
  bigLetter: { fontSize: 150, fontFamily: 'DMSans-Bold', color: 'rgba(20,20,20,0.16)' },
  dotsRow: {
    position: 'absolute',
    bottom: 54,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(20,20,20,0.2)' },
  dotActive: { backgroundColor: '#141414', width: 20 },

  videoThumb: { height: 320, width: W, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  videoThumbImg: { ...StyleSheet.absoluteFillObject },
  videoThumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  playBtnIcon: { fontSize: 22, color: '#141414', marginLeft: 3 },
  videoThumbLabel: { position: 'absolute', bottom: 60, color: '#fff', fontSize: 12, fontFamily: 'DMSans-Bold' },
  videoPlayer: { height: 320, width: W, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  videoLoaderOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  topActions: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topActionsRight: { flexDirection: 'row', gap: 10 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  roundBtnIcon: { fontSize: 19, color: '#141414' },

  deliveryPill: {
    position: 'absolute',
    left: 20,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#141414',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deliveryBolt: { fontSize: 12 },
  deliveryPillText: { color: '#FFE000', fontFamily: 'DMSans-Bold', fontSize: 12.5 },

  // Info
  infoSection: {
    marginTop: -16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  productTitle: { flex: 1, fontSize: 23, fontFamily: 'DMSans-Bold', color: '#141414', lineHeight: 28, letterSpacing: -0.4 },
  ratingChip: {
    backgroundColor: '#0C831F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 3,
  },
  ratingText: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 13 },
  unit: { fontFamily: 'DMSans-Medium', fontSize: 14, color: '#8a8a8a', marginTop: 4 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  price: { fontSize: 28, fontFamily: 'DMSans-Bold', color: '#141414', letterSpacing: -0.5 },
  mrp: { fontSize: 16, fontFamily: 'DMSans-Medium', color: '#9a9a9a', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#FFE2CC', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4 },
  discountText: { color: '#D9730D', fontFamily: 'DMSans-Bold', fontSize: 12.5 },
  taxNote: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#9a9a9a', marginTop: 5 },

  block: { marginTop: 22 },
  blockTitle: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414', marginBottom: 12 },

  packRow: { gap: 12, paddingRight: 8 },
  packCard: {
    minWidth: 108,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  packCardSel: { borderColor: '#FFC400', backgroundColor: '#FFFBEB' },
  packCardOut: { opacity: 0.5 },
  packLabel: { fontFamily: 'DMSans-Bold', fontSize: 14.5, color: '#141414' },
  packLabelSel: { color: '#141414' },
  packPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  packPrice: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#141414' },
  packMrp: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: '#9a9a9a', textDecorationLine: 'line-through' },
  packOut: { fontFamily: 'DMSans-Bold', fontSize: 10, color: '#C0392B', marginTop: 4 },

  featureRow: { flexDirection: 'row', gap: 12, marginTop: 22 },
  featureCard: {
    flex: 1,
    backgroundColor: '#F7F7F5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: { fontSize: 22 },
  featureLabel: { fontFamily: 'DMSans-Bold', fontSize: 12, color: '#141414', textAlign: 'center', lineHeight: 15 },

  highlightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEC',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  highlightDivider: { borderBottomWidth: 1, borderBottomColor: '#F2F2F0' },
  highlightCheck: { color: '#0C831F', fontFamily: 'DMSans-Bold', fontSize: 15 },
  highlightText: { flex: 1, fontFamily: 'DMSans-Medium', fontSize: 14, color: '#333', lineHeight: 19 },

  relatedRow: { gap: 12, paddingRight: 8 },
  relatedCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 16,
    padding: 8,
  },
  relatedImg: { height: 92, borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  relatedImgInner: { width: '100%', height: '100%' },
  relatedLetter: { fontSize: 34, fontFamily: 'DMSans-Bold', color: 'rgba(0,0,0,0.14)' },
  relatedName: { fontFamily: 'DMSans-Bold', fontSize: 12.5, color: '#141414', marginTop: 7 },
  relatedBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  relatedPrice: { fontFamily: 'DMSans-Bold', fontSize: 13.5, color: '#141414' },
  relatedAdd: {
    borderWidth: 1.5,
    borderColor: '#0C831F',
    backgroundColor: '#E8F7EA',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  relatedAddTxt: { fontFamily: 'DMSans-Bold', fontSize: 11.5, color: '#0C831F' },

  // Bottom bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0EC',
    backgroundColor: '#FFFFFF',
  },
  totalBox: {},
  totalLabel: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#8a8a8a' },
  totalValue: { fontFamily: 'DMSans-Bold', fontSize: 20, color: '#141414' },

  addBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  addBtnDisabled: { backgroundColor: '#B7B7B4', shadowOpacity: 0 },
  addBtnText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'DMSans-Bold', letterSpacing: 0.2 },
  addBtnCart: { fontSize: 17 },

  qtyRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C831F',
    borderRadius: 16,
    paddingHorizontal: 6,
  },
  stepBtn: { width: 46, height: 56, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { color: '#fff', fontSize: 24, fontFamily: 'DMSans-Bold' },
  stepQty: { color: '#fff', fontSize: 18, fontFamily: 'DMSans-Bold', minWidth: 24, textAlign: 'center' },
  cartBtn: {
    height: 56,
    paddingHorizontal: 22,
    backgroundColor: '#141414',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBtnText: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 16 },
  cartBtnArrow: { color: '#fff', fontSize: 17 },

  // New detailed view styles
  section: {
    marginTop: 22,
  },
  descriptionCard: {
    backgroundColor: '#F9F9F7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECECEA',
  },
  descriptionText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14.5,
    color: '#444444',
    lineHeight: 22,
  },
  attributesGrid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
  },
  attributeName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#8A8A8A',
  },
  attributeValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#141414',
  },
  datesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3FBF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4F6E6',
  },
  dateCol: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#555555',
    marginBottom: 4,
  },
  dateValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#0C831F',
  },
  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#C5ECD0',
    marginHorizontal: 12,
  },
  inventoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEC',
    borderRadius: 16,
    padding: 16,
  },
  invRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  invCol: {
    flex: 1,
  },
  invLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 6,
  },
  invValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#141414',
  },
  invDivider: {
    height: 1,
    backgroundColor: '#F2F2F0',
    marginVertical: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
  },
  badgeActive: {
    backgroundColor: '#E4F6E6',
  },
  badgeTextActive: {
    color: '#0C831F',
  },
  badgeInactive: {
    backgroundColor: '#FFEBEB',
  },
  badgeTextInactive: {
    color: '#C0392B',
  },
  badgeApproved: {
    backgroundColor: '#E8F7EA',
    borderWidth: 1,
    borderColor: '#C5ECD0',
  },
  badgeTextApproved: {
    color: '#0C831F',
  },
  badgePending: {
    backgroundColor: '#FFF8E6',
    borderWidth: 1,
    borderColor: '#FBE6C2',
  },
  badgeTextPending: {
    color: '#D9730D',
  },
  thresholdWarning: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  thresholdLow: {
    backgroundColor: '#FFF5E6',
  },
  thresholdCritical: {
    backgroundColor: '#FFEBEB',
  },
  thresholdText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#D9730D',
  },
  creatorCard: {
    backgroundColor: '#F9F9FB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECECEF',
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E9ECFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarTxt: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#4F46E5',
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#141414',
  },
  roleBadge: {
    backgroundColor: '#E9ECFB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleBadgeTxt: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10.5,
    color: '#4F46E5',
  },
  creatorDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 12,
  },
  creatorDetailItem: {
    flex: 1,
  },
  creatorItemLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  creatorItemValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#333333',
  },
})

export default ApiProductDetailModal
