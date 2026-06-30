import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { useTabBar } from '../../../shared/context/TabBarContext'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Defaults from '../../../config/index'
import CartSvg from '../../assets/images/svg/cart.svg'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import styles from './CartStyle'
import { THEME } from '../../assets/styles/theme'
import CloseIcon from '../../assets/images/svg/Svg2/CloseIcon'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader, { HeaderIconButton } from '../../elements/AppHeader'
import PrimaryButton from '../../elements/PrimaryButton'
import EmptyState from '../../elements/EmptyState'
import QtyStepper from '../../elements/QtyStepper'

// ─── Product Card ────────────────────────────────────────────────────────────
interface CartCardProps {
  product: any
  onRemove: (productId: number) => Promise<void>
  onQtyUpdate: (productId: number, newQty: number) => Promise<void>
}

const CartCard = ({ product, onRemove, onQtyUpdate }: CartCardProps) => {
  const [loading, setLoading] = useState(false)

  let imageUrl: string | null = null
  if (product.images && product.images.length > 0) {
    let imgPath = product.images[0].replace(/\\/g, '/')
    imageUrl = imgPath.startsWith('http')
      ? imgPath
      : `${Defaults.apis.baseUrl}/api/${imgPath.replace(/^\/+/, '')}`
  }

  const handleRemove = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onRemove(product.id)
    } finally {
      setLoading(false)
    }
  }

  const updateQty = (delta: number) => {
    const newQty = (product.quantity || 1) + delta
    if (newQty <= 0) {
      handleRemove()
    } else {
      onQtyUpdate(product.id, newQty)
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

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={handleRemove}
            disabled={loading}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={THEME.COLOR.primary} />
            ) : (
              <CloseIcon size={16} color={THEME.COLOR.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.scorePill}>
          <Text style={styles.scoreValue}>{product.points}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        {product.variantCode ? (
          <View style={styles.variantChip}>
            <Text style={styles.variantText}>Variant: {product.variantCode}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooterRow}>
          <QtyStepper
            value={product.quantity || 1}
            onIncrement={() => updateQty(1)}
            onDecrement={() => updateQty(-1)}
            size="sm"
          />
        </View>
      </View>
    </View>
  )
}

// ─── Cart Screen ────────────────────────────────────────────────────────────
export default function CartScreen() {
  const navigation = useNavigation()

  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<any[]>([])
  const { showTabBar, hideTabBar } = useTabBar()
  const scrollY = useRef(0)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar()
    } else if (currentScrollY < scrollY.current) {
      showTabBar()
    }
    scrollY.current = currentScrollY
  }

  useFocusEffect(
    useCallback(() => {
      fetchCart()
    }, []),
  )

  const fetchCart = async () => {
    setLoading(true)
    try {
      const storedCart = (await getAsyncData('cart_items')) || []
      if (Array.isArray(storedCart)) {
        setCartItems(storedCart)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.log('fetchCart error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (productId: number) => {
    try {
      const updatedCart = cartItems.filter(item => item.id !== productId)
      await setAsyncData('cart_items', updatedCart as any)
      setCartItems(updatedCart)
      Toast.show('Removed from cart', { duration: Toast.durations.SHORT })
    } catch (error) {
      console.log('removeItem error:', error)
      Toast.show('Failed to remove item', { duration: Toast.durations.SHORT })
    }
  }

  const updateQuantity = async (productId: number, newQty: number) => {
    try {
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item,
      )
      await setAsyncData('cart_items', updatedCart as any)
      setCartItems(updatedCart)
    } catch (error) {
      console.log('updateQuantity error:', error)
    }
  }

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (item.points || 0) * (item.quantity || 1),
      0,
    )
  }, [cartItems])

  if (loading) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <AppHeader
          title="Cart"
          onLeftPress={() => (navigation as any).navigate('ProductList')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.COLOR.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <AppHeader
        title="Cart"
        onLeftPress={() => (navigation as any).navigate('ProductList')}
        right={
          <HeaderIconButton
            onPress={() => {}}
            badge={cartItems.length}
          >
            <CartSvg />
          </HeaderIconButton>
        }
      />

      <FlatList
        data={cartItems}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <CartCard
            product={item}
            onRemove={removeItem}
            onQtyUpdate={updateQuantity}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<CartSvg width={42} height={42} fill={THEME.COLOR.primary} />}
            title="Your cart is empty"
            subtitle="You haven't added anything yet. Start shopping to fill it up!"
            ctaLabel="Shop Now"
            onCtaPress={() => (navigation as any).navigate('ProductList')}
          />
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalInfo}>
            <Text style={styles.totalLabel}>Total Score</Text>
            <View style={styles.totalValueRow}>
              <Text style={styles.totalScore}>{totalAmount}</Text>
              <Text style={styles.totalUnit}>pts</Text>
            </View>
          </View>
          <PrimaryButton
            label="Place Order"
            style={styles.checkoutBtn}
            onPress={() => (navigation as any).navigate('PlaceOrder')}
          />
        </View>
      )}
    </SafeAreaView>
  )
}
