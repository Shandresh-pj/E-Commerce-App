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
import { useTheme } from '../../../hooks/useTheme';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Button } from '../../../design-system/components/Button';
import { TextInput } from '../../../design-system/components/TextInput';
import { EmptyState } from '../../../design-system/components/EmptyState';
import {
  fetchApiCart,
  addToApiCart,
  removeFromApiCart,
  fetchAllCoupons,
  validateCouponCode,
  calculateCouponDiscount,
} from '../../../shared/services/main-service';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
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

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <SvkIcon name="back" size={24} color={tokens.content.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.content.primary }]}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      {cartItems.length === 0 ? (
        <EmptyState
          icon="cart"
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
                <Surface key={item.id} variant="card" radius="lg" bordered style={styles.cartCard}>
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
                    <Text style={[styles.itemPrice, { color: tokens.content.brand }]}>
                      ₹{item.price.toFixed(2)}
                    </Text>

                    {/* Quantity Stepper */}
                    <View style={styles.stepperRow}>
                      <Pressable
                        onPress={() => updateQuantity(item.id, -1)}
                        style={[styles.stepperBtn, { backgroundColor: tokens.surface.interactive }]}
                      >
                        <SvkIcon name="minus" size={14} color={tokens.content.primary} />
                      </Pressable>
                      <Text style={[styles.qtyText, { color: tokens.content.primary }]}>
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => updateQuantity(item.id, 1)}
                        style={[styles.stepperBtn, { backgroundColor: tokens.surface.interactive }]}
                      >
                        <SvkIcon name="plus" size={14} color={tokens.content.primary} />
                      </Pressable>
                    </View>
                  </View>
                </Surface>
              );
            })}

            {/* Promo Code Card */}
            <Surface variant="card" radius="lg" bordered style={styles.promoCard}>
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
                  style={{ marginLeft: 8, height: 48 }}
                />
              </View>
              <TouchableOpacity
                onPress={openCouponsModal}
                style={styles.viewCouponsBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.viewCouponsText}>🏷️ View Available Promo Codes</Text>
              </TouchableOpacity>
            </Surface>

            {/* Order Summary */}
            <Surface variant="card" radius="lg" bordered style={styles.billCard}>
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
                <Text style={[styles.totalValue, { color: tokens.content.brand }]}>
                  ₹{total.toFixed(2)}
                </Text>
              </View>
            </Surface>
          </ScrollView>

          {/* Sticky Checkout Bar */}
          <View
            style={[
              styles.stickyFooter,
              {
                backgroundColor: tokens.surface.card,
                borderColor: tokens.border.default,
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
            <Button
              title="Proceed to Checkout"
              onPress={() => navigation.navigate('PlaceOrder')}
              variant="gold"
              size="lg"
              fullWidth={false}
              style={{ minWidth: 200 }}
            />
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
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderTopColor: tokens.border.default },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.modalBadge}>🏷️</Text>
                <Text style={[styles.modalTitle, { color: tokens.content.primary }]}>Available Promo Codes</Text>
              </View>
              <TouchableOpacity onPress={() => setCouponsModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={[styles.modalCloseText, { color: tokens.content.secondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingCoupons ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {availableCoupons.map((coupon) => (
                  <Surface
                    key={coupon.id || coupon.code}
                    variant="card"
                    radius="lg"
                    bordered
                    style={styles.couponCard}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={styles.codeTag}>
                          <Text style={styles.codeTagText}>{coupon.code}</Text>
                        </View>
                        <Text style={styles.couponTitle}>{coupon.title}</Text>
                      </View>
                      <Text style={[styles.couponDesc, { color: tokens.content.secondary }]}>
                        {coupon.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.applyCouponBtn}
                      onPress={() => handleApplyPromoCode(coupon.code)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.applyCouponText}>APPLY</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.headingM,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  cartCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  itemTitle: {
    ...TYPOGRAPHY.title,
  },
  itemPrice: {
    ...TYPOGRAPHY.price,
    marginVertical: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...TYPOGRAPHY.label,
    marginHorizontal: 12,
  },
  promoCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCouponsBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewCouponsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  billCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  billHeader: {
    ...TYPOGRAPHY.headingS,
    marginBottom: SPACING.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    ...TYPOGRAPHY.bodyM,
  },
  billValue: {
    ...TYPOGRAPHY.title,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    ...TYPOGRAPHY.headingS,
  },
  totalValue: {
    ...TYPOGRAPHY.priceLarge,
  },
  stickyFooter: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  footerTotalLabel: {
    ...TYPOGRAPHY.caption,
  },
  footerTotalValue: {
    ...TYPOGRAPHY.headingL,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalBadge: {
    fontSize: 20,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerLoading: {
    padding: 40,
    alignItems: 'center',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  codeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginRight: 8,
  },
  codeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  couponDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  applyCouponBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
