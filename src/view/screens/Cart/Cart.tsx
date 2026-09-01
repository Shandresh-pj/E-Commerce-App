import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Button } from '../../../design-system/components/Button';
import { TextInput } from '../../../design-system/components/TextInput';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { MovingBackground } from '../../elements/MovingBackground';
import {
  fetchApiCart,
  addToApiCart,
  removeFromApiCart,
  fetchAllCoupons,
  validateCouponCode,
  calculateCouponDiscount,
} from '../../../shared/services/main-service';
import { SPACING } from '../../../design-system/tokens/spacing';
import { buildImageUrl, getFallbackImage } from '../../../shared/utils/imageHelper';
import { BlurhashImage } from '../../../design-system/components/BlurhashImage';
import Toast from 'react-native-root-toast';

export const CartScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number | string, boolean>>({});

  // Coupon Modal state
  const [couponsModalVisible, setCouponsModalVisible] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const loadCartData = useCallback(async () => {
    try {
      setLoading(true);
      const items = await fetchApiCart();
      setCartItems(items || []);
    } catch (e) {
      console.log('loadCartData error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, [loadCartData])
  );

  const updateQuantity = async (id: number | string, delta: number) => {
    const prodId = Number(id);
    if (delta < 0) {
      const existing = cartItems.find((item) => Number(item.id ?? item.product_id) === prodId);
      if (existing && existing.quantity <= 1) {
        await removeFromApiCart(prodId);
      } else {
        await addToApiCart(prodId, -1);
      }
    } else {
      await addToApiCart(prodId, 1);
    }
    await loadCartData();
  };

  const handleImageError = (id: number | string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (parseFloat(String(item.price ?? '0')) || 0) * (Number(item.quantity) || 1),
    0
  );
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 15;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyPromoCode = async (codeToApply?: string) => {
    const targetCode = (codeToApply || promoCode).trim();
    if (!targetCode) {
      Toast.show('Please enter a valid promo code', { duration: Toast.durations.SHORT });
      return;
    }

    const validation = await validateCouponCode(targetCode);
    if (validation?.valid) {
      const disc = await calculateCouponDiscount(targetCode, subtotal);
      const percent = subtotal > 0 ? (disc / subtotal) * 100 : 20;
      setAppliedDiscount(percent);
      setAppliedCouponCode(targetCode.toUpperCase());
      setPromoCode(targetCode.toUpperCase());
      setCouponsModalVisible(false);
      Toast.show(`Coupon ${targetCode.toUpperCase()} Applied! 🎉`, { duration: Toast.durations.SHORT });
    } else {
      Toast.show(validation?.message || 'Invalid promo code', { duration: Toast.durations.SHORT });
    }
  };

  const openCouponsModal = async () => {
    setCouponsModalVisible(true);
    setLoadingCoupons(true);
    try {
      const coupons = await fetchAllCoupons();
      setAvailableCoupons(coupons || []);
    } catch (e) {
      console.log('openCouponsModal error:', e);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const glassBg = isDark ? 'rgba(13, 23, 43, 0.88)' : 'rgba(255, 255, 255, 0.92)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';

  return (
    <MovingBackground theme={isDark ? 'dark' : 'yellow'} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Floating Glass Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), backgroundColor: glassBg, borderColor: glassBorder }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <SvkIcon name="back" size={20} color={tokens.content.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>My Cart 🛒</Text>
        <View style={{ width: 36 }} />
      </View>

      {cartItems.length === 0 ? (
        <EmptyState
          type="cart"
          title="Your Cart is Empty"
          subtitle="Explore our flagship collection and add items to your cart."
          actionTitle="Start Shopping"
          onAction={() => navigation.navigate('Home')}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 180 },
            ]}
          >
            {/* Cart Items */}
            {cartItems.map((item) => {
              const nameStr = item.title || item.name || 'Product';
              const isErr = imageErrorMap[item.id];
              const resolvedImage = isErr
                ? getFallbackImage(nameStr, 'product')
                : buildImageUrl(item.image, nameStr, 'product');

              return (
                <View key={item.id} style={[styles.cartCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
                  <BlurhashImage
                    category={nameStr}
                    source={{ uri: resolvedImage }}
                    style={styles.itemImage}
                    onError={() => handleImageError(item.id)}
                  />
                  <View style={styles.itemInfo}>
                    <Text numberOfLines={2} style={[styles.itemTitle, { color: tokens.content.primary }]}>
                      {nameStr}
                    </Text>
                    <Text style={[styles.itemPrice, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                      ₹{item.price.toFixed(2)}
                    </Text>

                    {/* Quantity Stepper */}
                    <View style={styles.stepperRow}>
                      <Pressable
                        onPress={() => updateQuantity(item.id, -1)}
                        style={styles.stepperBtn}
                      >
                        <SvkIcon name="minus" size={13} color="#FFFFFF" />
                      </Pressable>
                      <Text style={[styles.qtyText, { color: tokens.content.primary }]}>
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => updateQuantity(item.id, 1)}
                        style={styles.stepperBtn}
                      >
                        <SvkIcon name="plus" size={13} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Promo Code Card */}
            <View style={[styles.promoCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
              <View style={styles.promoRow}>
                <TextInput
                  placeholder="Apply Promo Code (e.g. SVK20)"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  containerStyle={{ flex: 1, marginVertical: 0 }}
                />
                <Button
                  title="Apply"
                  onPress={() => handleApplyPromoCode()}
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  style={{ marginLeft: 8, height: 48, borderRadius: 16 }}
                />
              </View>
              <TouchableOpacity
                onPress={openCouponsModal}
                style={styles.viewCouponsBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.viewCouponsText}>🏷️ View Available Promo Codes</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={[styles.billCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
              <Text style={[styles.billHeader, { color: tokens.content.primary }]}>
                Order Summary
              </Text>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: tokens.content.secondary }]}>Subtotal</Text>
                <Text style={[styles.billValue, { color: tokens.content.primary }]}>
                  ₹{subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: tokens.content.secondary }]}>Shipping</Text>
                <Text style={[styles.billValue, { color: shipping === 0 ? tokens.semantic.success : tokens.content.primary }]}>
                  {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                </Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: tokens.semantic.success }]}>
                    Promo Discount ({appliedCouponCode || `${appliedDiscount}%`})
                  </Text>
                  <Text style={[styles.billValue, { color: tokens.semantic.success }]}>
                    -₹{discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.divider, { backgroundColor: tokens.border.default }]} />
              <View style={styles.billRow}>
                <Text style={[styles.totalLabel, { color: tokens.content.primary }]}>Total Amount</Text>
                <Text style={[styles.totalValue, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                  ₹{total.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Floating Checkout Bar */}
          <View
            style={[
              styles.stickyFooter,
              {
                backgroundColor: glassBg,
                borderColor: glassBorder,
                bottom: Math.max(insets.bottom + 68, 78),
              },
            ]}
          >
            <View>
              <Text style={[styles.footerTotalLabel, { color: tokens.content.tertiary }]}>Total Price</Text>
              <Text style={[styles.footerTotalValue, { color: tokens.content.primary }]}>
                ₹{total.toFixed(2)}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('PlaceOrder')}
              style={({ pressed }) => [
                styles.checkoutBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={['#F6C453', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkoutGradient}
              >
                <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* Available Coupons Modal Sheet */}
      <Modal
        visible={couponsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCouponsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCouponsModalVisible(false)} />
          <View style={[styles.modalSheet, { backgroundColor: glassBg, borderColor: glassBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tokens.content.primary }]}>Available Promo Codes 🏷️</Text>
              <Pressable onPress={() => setCouponsModalVisible(false)} style={styles.modalCloseBtn}>
                <SvkIcon name="close" size={18} color={tokens.content.primary} />
              </Pressable>
            </View>

            {loadingCoupons ? (
              <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 40 }} />
            ) : availableCoupons.length === 0 ? (
              <Text style={[styles.noCouponsText, { color: tokens.content.secondary }]}>No promo coupons available right now.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {availableCoupons.map((coupon: any, idx: number) => {
                  const codeStr = (coupon.code || coupon.Code || 'SVK20').toUpperCase();
                  const descStr = coupon.description || coupon.title || 'Get special percentage off on your order';
                  return (
                    <View key={coupon.id || idx} style={[styles.couponCard, { backgroundColor: isDark ? '#081126' : '#EEF3FA' }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.couponCodeText}>{codeStr}</Text>
                        <Text style={[styles.couponDescText, { color: tokens.content.secondary }]}>{descStr}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleApplyPromoCode(codeStr)}
                        style={styles.couponApplyBtn}
                      >
                        <Text style={styles.couponApplyText}>APPLY</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </MovingBackground>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  cartCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 12,
  },
  promoCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCouponsBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  viewCouponsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  billCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  billHeader: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  billValue: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  stickyFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  footerTotalLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerTotalValue: {
    fontSize: 19,
    fontWeight: '900',
  },
  checkoutBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  checkoutGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  checkoutBtnText: {
    color: '#050816',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 8, 22, 0.65)',
  },
  modalSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    borderTopWidth: 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 6,
  },
  noCouponsText: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 20,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  couponCodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F59E0B',
  },
  couponDescText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  couponApplyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  couponApplyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
