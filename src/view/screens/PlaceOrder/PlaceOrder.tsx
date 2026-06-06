import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import Defaults from '../../../config/index';
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage';
import { postData } from '../../../shared/services/main-service';
import Toast from 'react-native-root-toast';
import styles from './PlaceOrdersStyle';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import { THEME } from '../../assets/styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  id: number;
  variantId?: number;
  name: string;
  variantCode: string;
  points: number;
  quantity: number;
  images?: string[];
  emoji?: string;
}

interface DeliveryAddressForm {
  Street: string;
  City: string;
  State: string;
  Pincode: string;
  Country: string;
}

interface OrderItem {
  ProductId: number;
  ProductVariantId: number;
  Qty: number;
}

interface OrderAddress {
  Street: string;
  City: string;
  State: string;
  Pincode: string;
  Country: string;
}

interface OrderPayload {
  OrderItems: OrderItem[];
  Address: OrderAddress;
}

// ─── Order Item Row ───────────────────────────────────────────────────────────
const OrderItemRow = ({ item }: { item: CartItem }) => {
  let imageUrl: string | null = null;
  if (item.images && item.images.length > 0) {
    let imgPath = item.images[0].replace(/\\/g, '/');
    imageUrl = imgPath.startsWith('http')
      ? imgPath
      : `${Defaults.apis.baseUrl}/api/${imgPath.replace(/^\/+/, '')}`;
  }

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderItemImage}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
        ) : (
          <Text style={styles.itemEmoji}>{item.emoji || '📦'}</Text>
        )}
      </View>
      <View style={styles.orderItemInfo}>
        <Text style={styles.orderItemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.orderItemMeta}>Qty: {item.quantity}</Text>
      </View>

      <View style={styles.orderItemPoints}>
        <Text style={styles.orderItemScore}>
          {(item.points || 0) * (item.quantity || 1)}
        </Text>
        <Text style={styles.orderItemScoreLabel}>pts</Text>
      </View>
      {/* {item.variantCode && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.orderItemName}>variant : </Text>
            <Text style={styles.orderItemName}>{item.variantCode}</Text>
          </View>
        )} */}
    </View>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// ─── Controlled Input Field ───────────────────────────────────────────────────
const ControlledInput = ({
  label,
  name,
  control,
  rules,
  placeholder,
  keyboardType = 'default',
  maxLength,
}: {
  label: string;
  name: keyof DeliveryAddressForm;
  control: any;
  rules?: object;
  placeholder?: string;
  keyboardType?: any;
  maxLength?: number;
}) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, error && styles.textInputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder || label}
            placeholderTextColor="#b0b8c1"
            keyboardType={keyboardType}
            maxLength={maxLength}
          />
        </View>
        {error && (
          <Text style={styles.errorText}>
            {error.message || `${label} is required`}
          </Text>
        )}
      </View>
    )}
  />
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PlaceOrderScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryAddressForm>({
    defaultValues: {
      Street: '',
      City: '',
      State: '',
      Pincode: '',
      Country: 'India',
    },
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = (await getAsyncData('cart_items')) || [];
      setCartItems(Array.isArray(storedCart) ? storedCart : []);
      console.log('storedcard', storedCart);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + (item.points || 0) * (item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cartItems],
  );

  // ─── Submit Handler ─────────────────────────────────────────────────────────
  const onSubmit = (formData: DeliveryAddressForm) => {
    if (cartItems.length === 0) {
      Toast.show('Your cart is empty', { duration: Toast.durations.SHORT });
      return;
    }

    Alert.alert('Confirm Order', `Place order for ${totalPoints} points?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setPlacing(true);
          try {
            const payload: OrderPayload = {
              OrderItems: cartItems.map(item => ({
                ProductId: item.id,
                ProductVariantId: item.variantId,
                Qty: item.quantity,
              })),
              Address: {
                Street: formData.Street.trim(),
                City: formData.City.trim(),
                State: formData.State.trim(),
                Pincode: formData.Pincode.trim(),
                Country: formData.Country.trim() || 'India',
              },
            };

            const response: any = await postData('/Orders/PlaceOrder', payload);
            console.log('response details', payload);

            if (response.status === 200) {
              await setAsyncData('cart_items', [] as any);
              const newOrderId = response?.data?.data?.OrderNumber;
              setOrderId(String(newOrderId));
              setOrderPlaced(true);
            } else {
              const errorMsg =
                response?.message ||
                response?.data?.message ||
                'Failed to place order. Please try again.';

              Alert.alert('Order Failed', errorMsg, [
                { text: 'OK', style: 'default' },
              ]);
            }
          } catch (error: any) {
            console.log('PlaceOrder Error:', error);
            Alert.alert(
              'Something Went Wrong',
              'Unable to place your order. Please try again.',
              [{ text: 'OK', style: 'default' }],
            );
          } finally {
            setPlacing(false);
          }
        },
      },
    ]);
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIconWrapper}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been placed successfully.
          </Text>
          {orderId && (
            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdValue}>#{orderId}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => (navigation as any).navigate('ProductList')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewOrders}
            onPress={() => (navigation as any).navigate('MyOrders')}
          >
            <Text style={styles.viewOrdersText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
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
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Place Order</Text>
          </View>
        </View>

        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
          style={styles.bakcgroundImage}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Order Summary */}
            <SectionCard title="Order Summary">
              {cartItems.map(item => (
                <OrderItemRow key={item.id} item={item} />
              ))}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Score</Text>
                <Text style={[styles.summaryValue, styles.totalPointsText]}>
                  {totalPoints} pts
                </Text>
              </View>
            </SectionCard>

            {/* Delivery Address — all fields driven by Controller */}
            <SectionCard title="Delivery Address">
              <ControlledInput
                label="Street / Address"
                name="Street"
                control={control}
                placeholder="House No., Street, Area"
                rules={{ required: 'Street address is required' }}
              />
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ControlledInput
                    label="City"
                    name="City"
                    control={control}
                    placeholder="City"
                    rules={{ required: 'City is required' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ControlledInput
                    label="State"
                    name="State"
                    control={control}
                    placeholder="State"
                    rules={{ required: 'State is required' }}
                  />
                </View>
              </View>
              <ControlledInput
                label="Pincode"
                name="Pincode"
                control={control}
                placeholder="6-digit pincode"
                keyboardType="number-pad"
                maxLength={6}
                rules={{
                  required: 'Pincode is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Enter a valid 6-digit pincode',
                  },
                }}
              />
              <ControlledInput
                label="Country"
                name="Country"
                control={control}
                placeholder="Country"
                rules={{ required: 'Country is required' }}
              />
            </SectionCard>

            {/* Points Breakdown */}
            <SectionCard title="Points Breakdown">
              <View style={styles.pointsRow}>
                <Text style={styles.pointsRowLabel}>Subtotal</Text>
                <Text style={styles.pointsRowValue}>{totalPoints} pts</Text>
              </View>
            </SectionCard>

            <View style={{ height: 100 }} />
          </ScrollView>
        </ImageBackground>
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerPoints}>{totalPoints} pts</Text>
            <Text style={styles.footerItemCount}>{totalItems} item(s)</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.placeOrderBtn,
              placing && styles.placeOrderBtnDisabled,
            ]}
            onPress={handleSubmit(onSubmit)} // ← react-hook-form validates then calls onSubmit
            disabled={placing}
          >
            {placing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
