import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import styles from './OrdersStyle';
import { getData } from '../../../shared/services/main-service';
import Defaults from '../../../config/index';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import { THEME } from '../../assets/styles/theme';

// ── Status config keyed by StatusId ──────────────────────────────────────────
const STATUS_CONFIG: Record<
  number,
  { label: string; color: string; bg: string; dot: string }
> = {
  27: {
    label: 'Processing',
    color: THEME.COLOR.bgPurple,
    bg: 'rgba(97,44,126,0.1)',
    dot: THEME.COLOR.bgPurple,
  },
  28: {
    label: 'Delivered',
    color: THEME.COLOR.textSuccess,
    bg: 'rgba(97,176,87,0.1)',
    dot: THEME.COLOR.textSuccess,
  },
  29: {
    label: 'Cancelled',
    color: '#dd4f4f',
    bg: 'rgba(221,79,79,0.1)',
    dot: '#dd4f4f',
  },
};
const DEFAULT_STATUS = {
  label: 'Pending',
  color: '#888',
  bg: 'rgba(136,136,136,0.1)',
  dot: '#888',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDateTime = (isoString: string) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const date = d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = d
    .toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase();
  return `${date}  ${time}`;
};

const formatCurrency = (amount: string | number) => {
  const num = parseFloat(String(amount ?? '0'));
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

// ── Section Block ─────────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  children: React.ReactNode;
  delay: number;
}

const Section = ({ title, children, delay }: SectionProps) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </Animated.View>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
const ViewOrderScreen = ({ navigation, route }: any) => {
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Accept either a full order object or just the ID from navigation params
  const paramOrder = route?.params?.order ?? null;
  const orderId = route?.params?.orderId ?? paramOrder?.Id ?? null;

  const [order, setOrder] = useState<any>(paramOrder);
  const [loading, setLoading] = useState(!paramOrder);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch by ID ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(orderId);
    }
  }, [orderId]);

  const fetchOrderDetail = async (id: number | string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getData(`/Orders/MyOrders/View/${id}`);
      if (response && response.status) {
        const data = response.data?.data ?? response.data ?? null;
        if (data) setOrder(data);
        else setError('Order not found.');
      } else {
        setError('Failed to load order details.');
      }
    } catch (err) {
      console.log('ViewOrderScreen Error', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Derived values (safe-guarded with fallbacks) ─────────────────────────
  const cfg = order
    ? STATUS_CONFIG[order.StatusId] ?? DEFAULT_STATUS
    : DEFAULT_STATUS;

  const address = order?.Address
    ? order.Address
    : order?.Users?.Address ?? null;

  const customerName = order
    ? `${order.Users?.FirstName ?? ''} ${order.Users?.LastName ?? ''}`.trim()
    : '—';

  // ── Calculate totals from OrderItems ────────────────────────────────────
  const calculatedGrandTotal = (order?.OrderItems ?? []).reduce(
    (sum: number, oi: any) => {
      const qty = parseFloat(String(oi.Qty ?? '0'));
      const unitPrice = parseFloat(String(oi.UnitPrice ?? '0'));
      return sum + qty * unitPrice;
    },
    0,
  );

  const taxAmount = parseFloat(String(order?.TaxAmount ?? '0'));
  const discAmount = parseFloat(String(order?.DiscAmount ?? '0'));
  const paidAmount = parseFloat(String(order?.PaidAmount ?? '0'));
  const balanceAmount = parseFloat(String(order?.BalanceAmount ?? '0'));
  // Use calculated total; fall back to API TotalAmount if items have no price
  const grandTotal =
    calculatedGrandTotal > 0
      ? calculatedGrandTotal
      : parseFloat(String(order?.TotalAmount ?? '0'));

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor={THEME.COLOR.bgPurple}
        />
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
          </View>
        </Animated.View>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color='#fff' />
          <Text style={{ marginTop: 12, color: '#888' }}>
            Loading order details...
          </Text>
        </View>
      </>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.COLOR.bgPurple}
        translucent={false}
      />
      <>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
          </View>
        </Animated.View>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Order Summary Card ── */}
            <Animated.View
              style={[styles.summaryCard, { opacity: headerAnim }]}
            >
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order ID</Text>
                <Text style={styles.summaryValue}>{order.OrderNumber}</Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ordered On</Text>
                <Text style={styles.summaryValue}>
                  {formatDateTime(order.CreatedAt)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method</Text>
                <Text style={styles.summaryValue}>{'Score'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={styles.summaryValue}>{'Processing'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Type</Text>
                <Text style={styles.summaryValue}>{'Standard'}</Text>
              </View>
              {order.OrderType && (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Order Type</Text>
                    <Text style={styles.summaryValue}>{order.OrderType}</Text>
                  </View>
                </>
              )}
            </Animated.View>

            {/* ── Delivery Address ── */}
            {address && (
              <Section title="Delivery Address" delay={120}>
                <View style={styles.addressCard}>
                  <View style={styles.addressIconCol}>
                    <View style={styles.addressIconOuter}>
                      <View style={styles.addressIconInner} />
                    </View>
                    <View style={styles.addressLine} />
                  </View>
                  <View style={styles.addressText}>
                    <Text style={styles.addressName}>{customerName}</Text>
                    {address.Street && (
                      <Text style={styles.addressDetail}>
                        {address.Street},
                      </Text>
                    )}
                    {address.City && (
                      <Text style={styles.addressDetail}>
                        {address.City}, {address.State} – {address.Pincode}.
                      </Text>
                    )}
                    {address.Country && (
                      <Text style={styles.addressDetail}>
                        {address.Country}
                      </Text>
                    )}
                    {order.Users?.MobileNumber && (
                      <TouchableOpacity activeOpacity={0.7}>
                        <Text style={styles.addressPhone}>
                          +91 {order.Users.MobileNumber}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Section>
            )}

            {/* ── Product Details ── */}
            <Section title="Product Details" delay={200}>
              {(order.OrderItems ?? []).length > 0 ? (
                order.OrderItems.map((oi: any, i: number) => {
                  const productName =
                    oi.ProductTranslations?.[0]?.Name ||
                    oi.Products?.ProductTranslation?.Name ||
                    oi.Products?.Name ||
                    oi.ProductName ||
                    oi.Name ||
                    `Product #${oi.ProductId}`;

                  let imageUrl = null;
                  const img =
                    oi.ProductImage?.ImageName ||
                    oi.Products?.ProductImages?.[0]?.ImagePath;
                  if (img) {
                    let imgPath = img.replace(/\\/g, '/');
                    imageUrl = imgPath.startsWith('http')
                      ? imgPath
                      : `${Defaults.apis.baseUrl}/api/v1/${imgPath.replace(
                          /^\/+/,
                          '',
                        )}`;
                  }

                  return (
                    <View key={oi.Id ?? i}>
                      {i > 0 && <View style={styles.productDivider} />}
                      <View style={styles.productRow}>
                        <View style={styles.productLeft}>
                          <View style={styles.productIconBox}>
                            {imageUrl ? (
                              <Image
                                source={{ uri: imageUrl }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 8,
                                  resizeMode: 'contain',
                                }}
                              />
                            ) : (
                              <View style={styles.productIconDot} />
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.productName}>
                              {productName}
                            </Text>
                            <Text style={styles.productQty}>Qty: {oi.Qty}</Text>
                            {(oi.Products?.Code || oi.ProductCode) && (
                              <Text
                                style={[styles.productQty, { color: '#aaa' }]}
                              >
                                Code: {oi.Products?.Code || oi.ProductCode}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={styles.productPrice}>
                          {parseFloat(oi.UnitPrice ?? '0') > 0
                            ? formatCurrency(oi.UnitPrice)
                            : '₹ 0.00'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text
                  style={{
                    color: '#aaa',
                    textAlign: 'center',
                    paddingVertical: 12,
                  }}
                >
                  No items found
                </Text>
              )}
            </Section>

            {/* ── Bill Summary ── */}
            <Section title="Bill Summary" delay={280}>
              {/* Per-item subtotals */}
              {(order.OrderItems ?? []).map((oi: any, i: number) => {
                const qty = parseFloat(String(oi.Qty ?? '0'));
                const unitPrice = parseFloat(String(oi.UnitPrice ?? '0'));
                const lineTotal = qty * unitPrice;
                const name =
                  oi.ProductTranslations?.[0]?.Name ||
                  oi.Products?.ProductTranslation?.Name ||
                  oi.Products?.Name ||
                  oi.ProductName ||
                  oi.Name ||
                  `Product #${oi.ProductId}`;
                return (
                  <View key={oi.Id ?? i} style={styles.billRow}>
                    <Text style={styles.billLabel} numberOfLines={1}>
                      {name} × {qty}
                    </Text>
                    <Text style={styles.billValue}>
                      {formatCurrency(lineTotal)}
                    </Text>
                  </View>
                );
              })}

              {discAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Discount</Text>
                  <Text
                    style={[
                      styles.billValue,
                      { color: THEME.COLOR.textSuccess },
                    ]}
                  >
                    - {formatCurrency(discAmount)}
                  </Text>
                </View>
              )}
              {taxAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Tax ({order.TaxPer}%)</Text>
                  <Text style={styles.billValue}>
                    {formatCurrency(taxAmount)}
                  </Text>
                </View>
              )}
              {paidAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Paid Amount</Text>
                  <Text
                    style={[
                      styles.billValue,
                      { color: THEME.COLOR.textSuccess },
                    ]}
                  >
                    {formatCurrency(paidAmount)}
                  </Text>
                </View>
              )}
              {balanceAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Balance Due</Text>
                  <Text style={[styles.billValue, { color: '#dd4f4f' }]}>
                    {formatCurrency(balanceAmount)}
                  </Text>
                </View>
              )}
              <View style={styles.billTotalDivider} />
              <View style={styles.billRow}>
                <Text style={styles.billTotalLabel}>Grand Total</Text>
                <Text style={styles.billTotalValue}>
                  {formatCurrency(grandTotal)}
                </Text>
              </View>
            </Section>

            {/* ── Additional Notes ── */}
            {order.AdditionalNotes && (
              <Section title="Additional Notes" delay={340}>
                <Text style={{ color: '#555', fontSize: 14, lineHeight: 20 }}>
                  {order.AdditionalNotes}
                </Text>
              </Section>
            )}
          </ScrollView>
        </SafeAreaView>
      </>
    </>
  );
};

export default ViewOrderScreen;
