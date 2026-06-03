import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
} from 'react-native';
import { useTabBar } from '../../../shared/context/TabBarContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Defaults from '../../../config/index';
import CartSvg from '../../assets/images/svg/cart.svg';
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage';
import styles from './CartStyle';
import { THEME } from '../../assets/styles/theme';
import CloseIcon from '../../assets/images/svg/Svg2/CloseIcon';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import CartIcon from '../../assets/images/svg/cart.svg';

// ─── Product Card ────────────────────────────────────────────────────────────
interface CartCardProps {
  product: any;
  onRemove: (productId: number) => Promise<void>;
  onQtyUpdate: (productId: number, newQty: number) => Promise<void>;
}

const CartCard = ({ product, onRemove, onQtyUpdate }: CartCardProps) => {
  const [loading, setLoading] = useState(false);

  let imageUrl: string | null = null;
  if (product.images && product.images.length > 0) {
    let imgPath = product.images[0].replace(/\\/g, '/');
    imageUrl = imgPath.startsWith('http')
      ? imgPath
      : `${Defaults.apis.baseUrl}/api/v1/${imgPath.replace(/^\/+/, '')}`;
  }

  const handleRemove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onRemove(product.id);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = (delta: number) => {
    const newQty = (product.quantity || 1) + delta;
    if (newQty <= 0) {
      handleRemove();
    } else {
      onQtyUpdate(product.id, newQty);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            />
          ) : (
            <Text style={{ fontSize: 18, color: '#aaa', fontWeight: 'bold' }}>
              {product.emoji || 'Img'}
            </Text>
          )}
        </View>

        <View style={{ paddingLeft: 15, flex: 1 }}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Score : </Text>
            <Text style={styles.points}>{product.points}</Text>
          </View>

          {product.variantCode && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>variant : </Text>
              <Text style={styles.points}>{product.variantCode}</Text>
            </View>
          )}

          <View style={styles.cardFooterRow}>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(-1)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{product.quantity || 1}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={handleRemove}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={THEME.COLOR.bgPurple} />
              ) : (
                <CloseIcon />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Cart Screen ────────────────────────────────────────────────────────────
export default function CartScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { showTabBar, hideTabBar } = useTabBar();
  const scrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar();
    } else if (currentScrollY < scrollY.current) {
      showTabBar();
    }
    scrollY.current = currentScrollY;
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, []),
  );

  const fetchCart = async () => {
    setLoading(true);
    try {
      const storedCart = (await getAsyncData('cart_items')) || [];
      if (Array.isArray(storedCart)) {
        setCartItems(storedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.log('fetchCart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const updatedCart = cartItems.filter(item => item.id !== productId);
      await setAsyncData('cart_items', updatedCart as any);
      setCartItems(updatedCart);
      Toast.show('Removed from cart', { duration: Toast.durations.SHORT });
    } catch (error) {
      console.log('removeItem error:', error);
      Toast.show('Failed to remove item', { duration: Toast.durations.SHORT });
    }
  };

  const updateQuantity = async (productId: number, newQty: number) => {
    try {
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item,
      );
      await setAsyncData('cart_items', updatedCart as any);
      setCartItems(updatedCart);
    } catch (error) {
      console.log('updateQuantity error:', error);
    }
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (item.points || 0) * (item.quantity || 1),
      0,
    );
  }, [cartItems]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color='#fff' />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor='#2a2c40'
        translucent
      />
      <SafeAreaView edges={['left', 'right',]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => (navigation as any).navigate('ProductList')}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Cart</Text>
          </View>

          <View style={styles.cartCountBadge}>
            <CartIcon style={{ marginRight: 8 }} />
            <Text style={styles.cartCountText}>{cartItems.length}</Text>
          </View>
        </View>
        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
          style={styles.bakcgroundImage}
        >
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
                <View style={styles.emptyState}>
                  <CartSvg width={64} height={64} fill="#ddd" />
                  <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
                  <Text style={styles.emptySubtitle}>
                    You haven't added anything to your cart yet. Go shopping!
                  </Text>
                  <TouchableOpacity
                    style={styles.shopNowBtn}
                    onPress={() => (navigation as any).navigate('ProductList')}
                  >
                    <Text style={styles.shopNowText}>Shop Now</Text>
                  </TouchableOpacity>
                </View>
              }
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          {cartItems.length > 0 && (
            <View
              style={[styles.footer,]}
            >
              <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>Total Score</Text>
                <Text style={styles.totalPrice}>{totalAmount}</Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => (navigation as any).navigate('PlaceOrder')}
              >
                <Text style={styles.checkoutText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          )}

        </ImageBackground>
      </SafeAreaView>
    </>
  );
}
