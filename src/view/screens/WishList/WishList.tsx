import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
  Pressable,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Defaults from '../../../config/index'
import { fetchMyWishlist, toggleWishlist, addToApiCart } from '../../../shared/services/main-service'
import Toast from 'react-native-root-toast'
import { useTheme } from '../../../shared/context/ThemeContext'
import { ArrowLeftIcon, HeartIcon, CartIcon } from '../../elements/SvgIcons'
import { BlurhashImage } from '../../../design-system/components/BlurhashImage'
import { MovingBackground } from '../../elements/MovingBackground'
import { EmptyWishlistIllustration } from '../../elements/SvgIllustrations'

const { width: W } = Dimensions.get('window')
const GUTTER = 12
const CARD_WIDTH = (W - 32 - GUTTER) / 2

const buildImageUrl = (img: string | undefined | null): string | null => {
  if (!img) return null
  const cleaned = img.replace(/\\/g, '/').replace(/^\/+/, '')
  return cleaned.startsWith('http')
    ? cleaned
    : `${Defaults.apis.baseUrl}/${cleaned}`
}

const WishCard = ({
  product,
  index,
  onRemove,
  onMove,
}: {
  product: any
  index: number
  onRemove: (id: number) => Promise<void>
  onMove: (product: any) => Promise<void>
}) => {
  const { colors, isDark } = useTheme()
  const [removing, setRemoving] = useState(false)
  const [moving, setMoving] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imageUrl = buildImageUrl(product.image || (product.images && product.images[0]))
  const price = parseFloat(String(product.points ?? product.price ?? 0)) || 0

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    try { await onRemove(product.id) } finally { setRemoving(false) }
  }
  const handleMove = async () => {
    if (moving) return
    setMoving(true)
    try { await onMove(product) } finally { setMoving(false) }
  }

  const glassBg = isDark ? 'rgba(13, 23, 43, 0.88)' : 'rgba(255, 255, 255, 0.92)'
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)'

  return (
    <View style={[s.card, { width: CARD_WIDTH, backgroundColor: glassBg, borderColor: glassBorder }]}>
      <View style={[s.imgBox, { backgroundColor: isDark ? '#081126' : '#EEF3FA' }]}>
        {imageUrl && !imgError ? (
          <BlurhashImage
            category={product.name}
            source={{ uri: imageUrl }}
            style={s.img}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Text style={[s.fallback, { color: colors.textMuted }]}>{product.name ? product.name[0].toUpperCase() : '🛍️'}</Text>
        )}
        <TouchableOpacity
          style={[s.heartBtn, { backgroundColor: isDark ? 'rgba(5, 8, 22, 0.82)' : 'rgba(255, 255, 255, 0.88)' }]}
          onPress={handleRemove}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {removing ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <HeartIcon size={16} color="#EF4444" filled={true} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={[s.name, { color: colors.textPrimary }]} numberOfLines={2}>{product.name}</Text>
      <Text style={[s.price, { color: isDark ? '#60A5FA' : '#2563EB' }]}>₹{price.toFixed(2)}</Text>

      <Pressable
        style={({ pressed }) => [
          s.addBtn,
          pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
        ]}
        onPress={handleMove}
        disabled={moving}
      >
        <LinearGradient
          colors={['#F6C453', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.addBtnInner}
        >
          {moving ? (
            <ActivityIndicator size="small" color="#050816" />
          ) : (
            <>
              <CartIcon size={14} color="#050816" />
              <Text style={s.addBtnText}>Move to Cart</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  )
}

export default function WishListScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const { colors, isDark } = useTheme()
  const [loading, setLoading] = useState(true)
  const [wishlistItems, setWishlistItems] = useState<any[]>([])

  useFocusEffect(
    useCallback(() => {
      fetchWishlist()
    }, []),
  )

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const dataList = await fetchMyWishlist()
      if (dataList && dataList.length >= 0) {
        const mapped = dataList.map((item: any) => {
          const product = item.product ?? item.Product ?? item
          return {
            wishlistId: item.id ?? item.Id,
            id: product.id ?? product.Id ?? item.product_id ?? item.ProductId,
            name: product.name ?? item.name ?? 'Product',
            points: parseFloat(product.price ?? item.price ?? '0') || 0,
            image: product.image ?? item.image ?? null,
            images: product.images ?? item.images ?? [],
            unit: product.unit ?? product.weight ?? item.unit ?? '',
          }
        })
        setWishlistItems(mapped)
      }
    } catch (error) {
      console.log('fetchWishlist error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (productId: number) => {
    try {
      const success = await toggleWishlist(productId, true)
      if (success) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
        Toast.show('Removed from wishlist', { duration: Toast.durations.SHORT })
      }
    } catch (error) {
      console.log('removeItem error:', error)
    }
  }

  const moveToCart = async (product: any) => {
    try {
      const success = await addToApiCart(product.id, 1)
      if (success) {
        await removeItem(product.id)
        Toast.show('Moved to cart 🛒', { duration: Toast.durations.SHORT })
      } else {
        Toast.show('Failed to add to cart', { duration: Toast.durations.SHORT })
      }
    } catch (error) {
      console.log('moveToCart error:', error)
      Toast.show('Failed to move to cart', { duration: Toast.durations.SHORT })
    }
  }

  const glassBg = isDark ? 'rgba(13, 23, 43, 0.88)' : 'rgba(255, 255, 255, 0.92)'
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)'

  return (
    <MovingBackground theme={isDark ? 'dark' : 'yellow'} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[s.header, { paddingTop: Math.max(insets.top, 16), backgroundColor: glassBg, borderColor: glassBorder }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Wishlist ♥</Text>
        {wishlistItems.length > 0 ? (
          <View style={s.countBadge}>
            <Text style={s.countText}>{wishlistItems.length}</Text>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[s.loadingText, { color: colors.textSecondary }]}>Loading wishlist…</Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={wishlistItems.length > 0 ? { gap: GUTTER } : undefined}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <WishCard product={item} index={index} onRemove={removeItem} onMove={moveToCart} />
          )}
          ListHeaderComponent={
            wishlistItems.length > 0 ? (
              <Text style={[s.subHeading, { color: colors.textSecondary }]}>
                {wishlistItems.length} saved item{wishlistItems.length > 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <EmptyWishlistIllustration size={160} isDark={isDark} />
              <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>Your Wishlist is Empty</Text>
              <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                Tap the heart icon on any product to save it here for later.
              </Text>
              <TouchableOpacity
                style={s.emptyCtaBtn}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.85}
              >
                <Text style={s.emptyCtaText}>Start Exploring →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </MovingBackground>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 22,
    borderWidth: 1.5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontWeight: '800', fontSize: 18, letterSpacing: 0.3 },
  countBadge: {
    borderRadius: 12,
    minWidth: 26,
    height: 26,
    backgroundColor: '#F6C453',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { fontWeight: '900', fontSize: 11.5, color: '#050816' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32 },
  loadingText: { fontSize: 14, fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingTop: 14, gap: GUTTER },
  subHeading: { fontWeight: '800', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  card: {
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  imgBox: {
    height: 136,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  fallback: { fontSize: 40, fontWeight: '800' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  name: {
    fontWeight: '700',
    fontSize: 12.5,
    marginTop: 8,
    lineHeight: 16,
    height: 32,
  },
  price: { fontWeight: '900', fontSize: 15, marginTop: 4 },

  addBtn: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    gap: 6,
    borderRadius: 14,
  },
  addBtnText: { fontWeight: '900', fontSize: 12, color: '#050816' },

  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 19, fontWeight: '800', marginTop: 14, marginBottom: 6 },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 280,
  },
  emptyCtaBtn: {
    borderRadius: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCtaText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
})
