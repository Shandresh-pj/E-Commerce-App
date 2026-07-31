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
import LinearGradient from 'react-native-linear-gradient'

const { width: W } = Dimensions.get('window')
const GUTTER = 12
const CARD_WIDTH = (W - 32 - GUTTER) / 2

const PRODUCT_BG_COLORS = [
  '#FFE0E0', '#FFF4D6', '#E0F0FF', '#E4F6E6',
  '#EBE4FF', '#FFE9E0', '#E0FFE8', '#F4E8FF',
]

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
  const [removing, setRemoving] = useState(false)
  const [moving, setMoving] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imageUrl = buildImageUrl(product.image || (product.images && product.images[0]))
  const bg = PRODUCT_BG_COLORS[index % 8]
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
    <View style={[s.card, { width: CARD_WIDTH }]}>
      <View style={[s.imgBox, { backgroundColor: bg }]}>
        {imageUrl && !imgError ? (
          <Image source={{ uri: imageUrl }} style={s.img} resizeMode="contain" onError={() => setImgError(true)} />
        ) : (
          <Text style={s.fallback}>{product.name ? product.name[0].toUpperCase() : '🛍️'}</Text>
        )}
        <TouchableOpacity style={s.heartBtn} onPress={handleRemove} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {removing ? <ActivityIndicator size="small" color="#e91e63" /> : <Text style={s.heartIcon}>♥</Text>}
        </TouchableOpacity>
      </View>

      <Text style={s.name} numberOfLines={2}>{product.name}</Text>
      <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>

      <TouchableOpacity style={s.addBtn} onPress={handleMove} disabled={moving} activeOpacity={0.85}>
        {moving ? (
          <ActivityIndicator size="small" color="#0C831F" />
        ) : (
          <Text style={s.addBtnText}>Add to cart</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default function WishListScreen() {
  const navigation = useNavigation<any>()
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
          // Support both nested product shape and flat shape
          const product = item.product ?? item.Product ?? item
          return {
            wishlistId: item.id ?? item.Id,            // wishlist row id
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
        // Also remove from wishlist
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
    <LinearGradient colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']} locations={[0, 0.4, 1]} style={s.root}>
      <StatusBar backgroundColor="#F4F5F0" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Wishlist</Text>
          {wishlistItems.length > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countText}>{wishlistItems.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#0C831F" />
            <Text style={s.loadingText}>Loading wishlist…</Text>
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
                <Text style={s.subHeading}>{wishlistItems.length} saved item{wishlistItems.length > 1 ? 's' : ''}</Text>
              ) : null
            }
            ListEmptyComponent={
              <View style={s.emptyState}>
                <View style={s.emptyIconBox}>
                  <Text style={{ fontSize: 44 }}>🤍</Text>
                </View>
                <Text style={s.emptyTitle}>Your wishlist is empty</Text>
                <Text style={s.emptySub}>
                  Tap the heart on any product to save it here for later.
                </Text>
                <TouchableOpacity style={s.emptyCtaBtn} onPress={() => navigation.navigate('Categories')} activeOpacity={0.85}>
                  <Text style={s.emptyCtaText}>Start shopping →</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

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
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  backArrow: { fontSize: 18, color: '#141414' },
  headerTitle: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 24, color: '#141414', letterSpacing: -0.4 },
  countBadge: {
    backgroundColor: '#141414',
    borderRadius: 13,
    minWidth: 28,
    height: 28,
    paddingHorizontal: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#FFE000' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32 },
  loadingText: { fontSize: 14, color: '#8a8a8a', fontFamily: 'DMSans-Regular' },

  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: GUTTER },
  subHeading: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#8a8a8a', marginBottom: 12, marginTop: 2 },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0EC',
    borderRadius: 18,
    padding: 9,
  },
  imgBox: {
    height: 120,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  fallback: { fontSize: 40, fontFamily: 'DMSans-Bold', color: 'rgba(0,0,0,0.14)' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  heartIcon: { fontSize: 17, color: '#e91e63' },

  name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#141414',
    marginTop: 9,
    lineHeight: 16,
    height: 32,
  },
  price: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#141414', marginTop: 3 },

  addBtn: {
    marginTop: 9,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#0C831F',
    backgroundColor: '#E8F7EA',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontFamily: 'DMSans-Bold', fontSize: 13, color: '#0C831F' },

  emptyState: { alignItems: 'center', paddingTop: 90, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 92,
    height: 92,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 20, fontFamily: 'DMSans-Bold', color: '#141414', marginBottom: 8 },
  emptySub: {
    fontSize: 13.5,
    fontFamily: 'DMSans-Regular',
    color: '#8a8a8a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    maxWidth: 260,
  },
  emptyCtaBtn: {
    backgroundColor: '#0C831F',
    borderRadius: 14,
    paddingHorizontal: 30,
    paddingVertical: 14,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  emptyCtaText: { fontSize: 15, fontFamily: 'DMSans-Bold', color: '#FFFFFF' },
})
