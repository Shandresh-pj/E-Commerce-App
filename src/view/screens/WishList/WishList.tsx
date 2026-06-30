import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Defaults from '../../../config/index'
import HeartIcon from '../../assets/images/svg/Svg2/HeartIcon'
import HeartIconWhite from '../../assets/images/svg/Svg2/HeartIconWhite'
import {
  fetchMyWishlist,
  toggleWishlist,
} from '../../../shared/services/main-service'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import CloseIcon from '../../assets/images/svg/Svg2/CloseIcon'
import Toast from 'react-native-root-toast'
import styles from './WishListStyle'
import { THEME } from '../../assets/styles/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader, { HeaderIconButton } from '../../elements/AppHeader'
import PrimaryButton from '../../elements/PrimaryButton'
import EmptyState from '../../elements/EmptyState'

// ─── Product Card ─────────────────────────────────────────────────────────────
interface WishListCardProps {
  product: any
  onRemove: (productId: number) => Promise<void>
  onMoveToCart: (product: any) => Promise<void>
}

const WishListCard = ({
  product,
  onRemove,
  onMoveToCart,
}: WishListCardProps) => {
  const [removing, setRemoving] = useState(false)
  const [moving, setMoving] = useState(false)

  let imageUrl: string | null = null
  if (product.images && product.images.length > 0) {
    let imgPath = product.images[0].replace(/\\/g, '/')
    imageUrl = imgPath.startsWith('http')
      ? imgPath
      : `${Defaults.apis.baseUrl}/api/${imgPath.replace(/^\/+/, '')}`
  }

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    try {
      await onRemove(product.id)
    } finally {
      setRemoving(false)
    }
  }

  const handleMove = async () => {
    if (moving) return
    setMoving(true)
    try {
      await onMoveToCart(product)
    } finally {
      setMoving(false)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imageFallback}>{product.emoji || 'Img'}</Text>
        )}
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.scorePill}>
          <Text style={styles.scoreValue}>{product.points}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
        <PrimaryButton
          label="Move to Cart"
          size="sm"
          loading={moving}
          style={styles.moveBtn}
          onPress={handleMove}
        />
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={handleRemove}
        disabled={removing}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {removing ? (
          <ActivityIndicator size="small" color={THEME.COLOR.primary} />
        ) : (
          <CloseIcon size={15} color={THEME.COLOR.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  )
}

// ─── WishList Screen ──────────────────────────────────────────────────────────
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
        const mapped = dataList.map((item: any) => ({
          id: item.ProductId || item.Product?.Id || item.Id,
          code: item.Code || item.Product?.Code,
          points: item.Points || item.Product?.Points || 0,
          images:
            item.Images?.map((img: any) => img.ImageName) ??
            item.Product?.Images?.map((img: any) => img.ImageName) ??
            [],
          name:
            item.ProductTranslations?.length > 0
              ? item.ProductTranslations[0].Name
              : item.Product?.ProductTranslations?.length > 0
                ? item.Product.ProductTranslations[0].Name
                : item.Code || item.Product?.Code || 'Product',
          brand: 'Generic',
          rating: 4.0,
          discount: 0,
          emoji: item.Code || item.Product?.Code,
        }))
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
      const success = await toggleWishlist(productId, true) // true since we are removing
      if (success) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
      }
    } catch (error) {
      console.log('removeItem error:', error)
    }
  }

  const moveToCart = async (product: any) => {
    try {
      const existingCart = (await getAsyncData('cart_items')) || []
      const cartArray = Array.isArray(existingCart) ? existingCart : []
      const alreadyInCart = cartArray.some((item: any) => item.id === product.id)
      if (!alreadyInCart) {
        await setAsyncData('cart_items', [
          ...cartArray,
          { ...product, quantity: 1 },
        ] as any)
      }
      // Remove from wishlist after moving
      const success = await toggleWishlist(product.id, true)
      if (success) {
        setWishlistItems(prev => prev.filter(item => item.id !== product.id))
      }
      Toast.show('Moved to cart', { duration: Toast.durations.SHORT })
    } catch (error) {
      console.log('moveToCart error:', error)
      Toast.show('Failed to move to cart', { duration: Toast.durations.SHORT })
    }
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <AppHeader
        title="My Wishlist"
        right={
          <HeaderIconButton onPress={() => {}} badge={wishlistItems.length}>
            <HeartIconWhite filled={false} />
          </HeaderIconButton>
        }
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME.COLOR.primary} />
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <WishListCard
              product={item}
              onRemove={removeItem}
              onMoveToCart={moveToCart}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<HeartIcon filled size={42} color={THEME.COLOR.primary} />}
              title="Your wishlist is empty"
              subtitle="Tap the heart on any product to save it here for later."
              ctaLabel="Shop Now"
              onCtaPress={() =>
                navigation.navigate('Home', { screen: 'ProductList' })
              }
            />
          }
        />
      )}
    </SafeAreaView>
  )
}
