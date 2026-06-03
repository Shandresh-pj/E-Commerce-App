import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { THEME } from '../../assets/styles/theme';
import styles from './OrdersStyle';
import { getData } from '../../../shared/services/main-service';
import { setAsyncData } from '../../../shared/utils/storage';
import Toast from 'react-native-root-toast';
import UserIcon from '../../assets/images/svg/user-bar.svg';

const STATUS_CONFIG: Record<
  number,
  { label: string; color: string; bg: string; dot: string }
> = {
  27: {
    label: 'Processing',
    color: THEME.COLOR.bgPurple,
    bg: 'rgba(97,44,126,0.12)',
    dot: THEME.COLOR.bgPurple,
  },
  28: {
    label: 'Delivered',
    color: THEME.COLOR.textSuccess,
    bg: 'rgba(97,176,87,0.12)',
    dot: THEME.COLOR.textSuccess,
  },
  29: {
    label: 'Cancelled',
    color: '#dd4f4f',
    bg: 'rgba(221,79,79,0.12)',
    dot: '#dd4f4f',
  },
};

const DEFAULT_STATUS = {
  label: 'Pending',
  color: '#888',
  bg: 'rgba(136,136,136,0.12)',
  dot: '#888',
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return { date: '—', time: '—' };
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
  return { date, time };
};

const formatCurrency = (amount: string | number) => {
  const num = parseFloat(String(amount));
  return `${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ item, index, onView, onReorder }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 360,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 360,
        delay: index * 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cfg = STATUS_CONFIG[item.StatusId] ?? DEFAULT_STATUS;
  const { date, time } = formatDateTime(item.CreatedAt);

  // Derive product summary from OrderItems
  const productNames =
    item.OrderItems?.map(
      (oi: any) =>
        oi.ProductTranslations?.[0]?.Name ||
        oi.Products?.ProductTranslation?.Name ||
        'Unknown Product',
    ) ?? [];
  const productSummary =
    productNames.length > 0
      ? productNames.slice(0, 2).join(', ') +
        (productNames.length > 2 ? ` +${productNames.length - 2} more` : '')
      : 'No items';

  const totalAmount = item.TotalPoints ?? 'N/A';

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Top strip – date row */}
      <View style={styles.cardHeader}>
        <View style={styles.calIconBox}>
          <View style={styles.calDot} />
          <View style={styles.calDot} />
        </View>
        <Text style={styles.cardDate}>{date}</Text>
        <Text style={styles.cardTime}>{time}</Text>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Order ID */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order ID</Text>
          <Text style={styles.infoValue}>{item.OrderNumber}</Text>
        </View>

        {/* Products */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items</Text>
          <Text
            style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}
            numberOfLines={1}
          >
            {productSummary}
          </Text>
        </View>

        {/* Amount */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scores</Text>
          <Text style={styles.infoValueScore}>
            {totalAmount > 0 ? formatCurrency(item.TotalPoints) : 'N/A'}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
            <Text style={[styles.statusText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.btnView}
          onPress={() => onView(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnViewText}>View Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnReorder}
          onPress={() => onReorder(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnReorderText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
const MyOrdersScreen = ({ navigation }: any) => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [activeFilter, setActiveFilter] = useState('All');
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Processing', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await getData(`/Orders/MyOrders`);
      if (response && response.status) {
        const data = response.data?.data ?? response.data ?? [];
        setMyOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log('MyOrders Error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter by StatusId label
  const filtered =
    activeFilter === 'All'
      ? myOrders
      : myOrders.filter(o => {
          const cfg = STATUS_CONFIG[o.StatusId];
          return cfg?.label === activeFilter;
        });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.COLOR.bgPurple}
        translucent={false}
      />

      {/* ── Header ── */}
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
            onPress={() => navigation?.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.7}
          >
            <UserIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.orderCount}>{myOrders.length}</Text>
          <Text style={styles.orderCountLabel}>orders</Text>
        </View>
      </Animated.View>

      {/* ── Filter Pills ── */}
      <Animated.View style={[styles.filterRow, { opacity: headerAnim }]}>
        {filters.map(f => {
          const isActive = f === activeFilter;
          const cfg = Object.values(STATUS_CONFIG).find(s => s.label === f);
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              {cfg && isActive && (
                <View
                  style={[styles.filterDot, { backgroundColor: cfg.dot }]}
                />
              )}
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* ── Loading / Empty / List ── */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color='#fff' />
          <Text style={{ marginTop: 12, color: '#888' }}>
            Loading orders...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: '#888', fontSize: 16 }}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.Id)}
          renderItem={({ item, index }) => (
            <OrderCard
              item={item}
              index={index}
              onView={(o: any) =>
                navigation?.navigate('ViewOrder', { order: o })
              }
              onReorder={async (o: any) => {
                try {
                  if (!o.OrderItems || o.OrderItems.length === 0) {
                    Toast.show('No items found in this order', {
                      duration: Toast.durations.SHORT,
                    });
                    return;
                  }

                  const reorderItems = o.OrderItems.map((oi: any) => {
                    const pName =
                      oi.ProductTranslations?.[0]?.Name ||
                      oi.Products?.ProductTranslation?.Name ||
                      'Unknown Product';
                    const pImage =
                      oi.ProductImage?.ImageName ||
                      oi.Products?.ProductImages?.[0]?.ImagePath;
                    return {
                      id: oi.ProductId,
                      variantId: oi.ProductVariantId,
                      name: pName,
                      variantCode: oi.ProductVariants?.VariantCode ?? '',
                      points: oi.UnitPrice ?? 0,
                      quantity: oi.Qty ?? 1,
                      images: pImage ? [pImage] : [],
                    };
                  });

                  await setAsyncData('cart_items', reorderItems);
                  navigation?.navigate('PlaceOrder');
                } catch (error) {
                  console.log('Reorder Error', error);
                  Toast.show('Failed to reorder', {
                    duration: Toast.durations.SHORT,
                  });
                }
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default MyOrdersScreen;
