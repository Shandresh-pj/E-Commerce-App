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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Defaults from '../../../config/index'
import { fetchMyWishlist, toggleWishlist, addToApiCart } from '../../../shared/services/main-service'
import Toast from 'react-native-root-toast'
import { useTheme } from '../../../shared/context/ThemeContext'
import { ArrowLeftIcon, HeartIcon, CartIcon, TrashIcon } from '../../elements/SvgIcons'

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
  const price = product.points || 0

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

  return (
    <View style={[s.card, { width: CARD_WIDTH, backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={[s.imgBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
        {imageUrl && !imgError ? (
          <Image source={{ uri: imageUrl }} style={s.img} resizeMode="contain" onError={() => setImgError(true)} />
        ) : (
          <Text style={[s.fallback, { color: colors.textMuted }]}>{product.name ? product.name[0].toUpperCase() : '🛍️'}</Text>
        )}
        <TouchableOpacity
          style={[s.heartBtn, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
          onPress={handleRemove}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {removing ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <HeartIcon size={18} color="#EF4444" filled={true} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={[s.name, { color: colors.textPrimary }]} numberOfLines={2}>{product.name}</Text>
      <Text style={[s.price, { color: colors.textPrimary }]}>${price.toFixed(2)}</Text>

      <TouchableOpacity
        style={[
          s.addBtn,
          {
            backgroundColor: isDark ? colors.accentGlow : colors.surfaceSecondary,
            borderColor: colors.borderStrong,
          },
        ]}
        onPress={handleMove}
        disabled={moving}
        activeOpacity={0.85}
      >
        {moving ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <View style={s.addBtnInner}>
            <CartIcon size={15} color={colors.accent} />
            <Text style={[s.addBtnText, { color: colors.accent }]}>Move to Cart</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default function WishListScreen() {
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

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBg} />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Wishlist</Text>
        {wishlistItems.length > 0 && (
          <View style={[s.countBadge, { backgroundColor: colors.accent }]}>
            <Text style={[s.countText, { color: colors.accentText }]}>{wishlistItems.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[s.loadingText, { color: colors.textSecondary }]}>Loading wishlist…</Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={wishlistItems.length > 0 ? { gap: GUTTER } : undefined}
          contentContainerStyle={s.listContent}
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
              <View style={[s.emptyIconBox, { backgroundColor: colors.surfaceCard }]}>
                <HeartIcon size={44} color={colors.accent} filled={false} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>Your wishlist is empty</Text>
              <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                Tap the heart icon on any product to save it here for later.
              </Text>
              <TouchableOpacity
                style={[s.emptyCtaBtn, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.85}
              >
                <Text style={[s.emptyCtaText, { color: colors.accentText }]}>Start Exploring →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: { flex: 1, fontWeight: '800', fontSize: 24, letterSpacing: -0.4 },
  countBadge: {
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    paddingHorizontal: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { fontWeight: '800', fontSize: 13 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: GUTTER },
  subHeading: { fontWeight: '700', fontSize: 13, marginBottom: 12, marginTop: 2 },

  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  },
  imgBox: {
    height: 130,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  name: {
    fontWeight: '700',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 17,
    height: 34,
  },
  price: { fontWeight: '800', fontSize: 16, marginTop: 4 },

  addBtn: {
    marginTop: 10,
    height: 38,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtnText: { fontWeight: '700', fontSize: 12.5 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySub: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 260,
  },
  emptyCtaBtn: {
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    elevation: 4,
  },
  emptyCtaText: { fontSize: 15, fontWeight: '800' },
})
