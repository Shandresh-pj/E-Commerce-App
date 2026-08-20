import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Surface } from '../../../design-system/surfaces/Surface';
import { SvkIcon } from '../../../design-system/icons/SvkIcon';
import { Button } from '../../../design-system/components/Button';
import { TextInput } from '../../../design-system/components/TextInput';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { fetchApiCart } from '../../../shared/services/main-service';
import { TYPOGRAPHY } from '../../../design-system/tokens/typography';
import { SPACING } from '../../../design-system/tokens/spacing';

export const CartScreen = ({ navigation }: any) => {
  const { tokens, isDark } = useTheme();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const [cartItems, setCartItems] = useState<any[]>([
    {
      id: '1',
      title: 'iPhone 15 Pro (128GB, Blue Titanium)',
      price: 999.0,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60',
    },
    {
      id: '2',
      title: 'AirPods Pro (2nd Generation)',
      price: 159.0,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&auto=format&fit=crop&q=60',
    },
  ]);

  useEffect(() => {
    fetchApiCart()
      .then((res: any) => {
        if (res?.data && res.data.length > 0) {
          setCartItems(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any[]
    );
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SVK20') {
      setAppliedDiscount(20);
    } else {
      setAppliedDiscount(10);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.surface.base }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Cart Items */}
            {cartItems.map((item) => (
              <Surface key={item.id} variant="card" radius="lg" bordered style={styles.cartCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text numberOfLines={2} style={[styles.itemTitle, { color: tokens.content.primary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemPrice, { color: tokens.content.brand }]}>
                    ${item.price.toFixed(2)}
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
            ))}

            {/* Promo Code Input */}
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
                  onPress={handleApplyPromo}
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  style={{ marginLeft: 8, height: 48 }}
                />
              </View>
            </Surface>

            {/* Bill Summary */}
            <Surface variant="card" radius="lg" bordered style={styles.billCard}>
              <Text style={[styles.billHeader, { color: tokens.content.primary }]}>
                Order Summary
              </Text>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: tokens.content.secondary }]}>Subtotal</Text>
                <Text style={[styles.billValue, { color: tokens.content.primary }]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: tokens.content.secondary }]}>Shipping</Text>
                <Text style={[styles.billValue, { color: shipping === 0 ? tokens.semantic.success : tokens.content.primary }]}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: tokens.semantic.success }]}>Promo Discount</Text>
                  <Text style={[styles.billValue, { color: tokens.semantic.success }]}>
                    -${discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.divider, { backgroundColor: tokens.border.default }]} />
              <View style={styles.billRow}>
                <Text style={[styles.totalLabel, { color: tokens.content.primary }]}>Total Amount</Text>
                <Text style={[styles.totalValue, { color: tokens.content.brand }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </Surface>
          </ScrollView>

          {/* Sticky Checkout Bar */}
          <View
            style={[
              styles.stickyFooter,
              { backgroundColor: tokens.surface.card, borderColor: tokens.border.default },
            ]}
          >
            <View>
              <Text style={[styles.footerTotalLabel, { color: tokens.content.tertiary }]}>Total Price</Text>
              <Text style={[styles.footerTotalValue, { color: tokens.content.primary }]}>
                ${total.toFixed(2)}
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
    paddingBottom: 100,
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
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  footerTotalLabel: {
    ...TYPOGRAPHY.caption,
  },
  footerTotalValue: {
    ...TYPOGRAPHY.headingL,
  },
});
