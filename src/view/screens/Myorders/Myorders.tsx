import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getData } from '../../../shared/services/main-service'
import { setAsyncData } from '../../../shared/utils/storage'
import Toast from 'react-native-root-toast'
import LinearGradient from 'react-native-linear-gradient'

const STATUS_CONFIG: Record<
  number,
  { label: string; color: string; bg: string; dot: string }
> = {
  27: { label: 'Processing', color: '#D98A1F', bg: 'rgba(255,224,0,0.15)', dot: '#D98A1F' },
  28: { label: 'Delivered', color: '#0C831F', bg: 'rgba(12,131,31,0.12)', dot: '#0C831F' },
  29: { label: 'Cancelled', color: '#dd4f4f', bg: 'rgba(221,79,79,0.12)', dot: '#dd4f4f' },
}

const DEFAULT_STATUS = {
  label: 'Pending',
  color: '#888',
  bg: 'rgba(136,136,136,0.12)',
  dot: '#888',
}

const formatDateTime = (isoString: string) => {
  if (!isoString) return { date: '—', time: '—' }
  const d = new Date(isoString)
  const date = d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const time = d
    .toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase()
  return { date, time }
}

const formatCurrency = (amount: string | number) => {
  const num = parseFloat(String(amount))
  return `${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

const getStatusConfig = (item: any) => {
  if (item.StatusId !== undefined && STATUS_CONFIG[item.StatusId]) {
    return STATUS_CONFIG[item.StatusId]
  }
  const statusStr = String(item.status || item.StatusName || '').toUpperCase()
  if (statusStr === 'DELIVERED' || statusStr === 'SUCCESS') {
    return STATUS_CONFIG[28]
  }
  if (statusStr === 'CANCELLED' || statusStr === 'FAILED') {
    return STATUS_CONFIG[29]
  }
  if (statusStr === 'PROCESSING' || statusStr === 'PENDING') {
    return STATUS_CONFIG[27]
  }
  return DEFAULT_STATUS
}

const OrderCard = ({ item, onView, onReorder }: any) => {
  const cfg = getStatusConfig(item)
  const { date, time } = formatDateTime(item.created_at ?? item.CreatedAt)

  const productNames =
    (item.items ?? item.OrderItems)?.map(
      (oi: any) =>
        oi.product?.name ||
        oi.ProductTranslations?.[0]?.Name ||
        oi.Products?.ProductTranslation?.Name ||
        'Unknown Product',
    ) ?? []
  const productSummary =
    productNames.length > 0
      ? productNames.slice(0, 2).join(', ') +
        (productNames.length > 2 ? ` +${productNames.length - 2} more` : '')
      : 'No items'

  const totalAmount = item.total ?? item.TotalPoints ?? 'N/A'

  return (
    <View style={s.card}>
      {/* Date strip */}
      <View style={s.cardDateRow}>
        <Text style={{ fontSize: 13 }}>📅</Text>
        <Text style={s.cardDate}>{date}</Text>
        <Text style={s.cardTime}>{time}</Text>
      </View>

      <View style={s.cardBody}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Order ID</Text>
          <Text style={s.infoValue}>{item.invoice_no ?? item.OrderNumber}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Items</Text>
          <Text
            style={[s.infoValue, { flex: 1, textAlign: 'right' }]}
            numberOfLines={1}
          >
            {productSummary}
          </Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Scores</Text>
          <Text style={s.infoValueGreen}>
            {totalAmount > 0 || parseFloat(totalAmount) > 0 ? formatCurrency(totalAmount) : 'N/A'}
          </Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Status</Text>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <View style={[s.statusDot, { backgroundColor: cfg.dot }]} />
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
      </View>

      <View style={s.cardDivider} />

      <View style={s.cardActions}>
        <TouchableOpacity
          style={s.btnView}
          onPress={() => onView(item)}
          activeOpacity={0.8}
        >
          <Text style={s.btnViewText}>View Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnReorder}
          onPress={() => onReorder(item)}
          activeOpacity={0.8}
        >
          <Text style={s.btnReorderText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const MyOrdersScreen = ({ navigation }: any) => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const filters = ['All', 'Processing', 'Delivered', 'Cancelled']

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      setLoading(true)
      const response = await getData('/orders')
      if (response && response.status) {
        const data = response.data?.data ?? response.data ?? []
        setMyOrders(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.log('MyOrders Error', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered =
    activeFilter === 'All'
      ? myOrders
      : myOrders.filter(o => {
          const cfg = getStatusConfig(o)
          return cfg?.label === activeFilter
        })

  return (
    <LinearGradient
      colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']}
      locations={[0, 0.4, 1]}
      style={s.root}
    >
      <StatusBar backgroundColor="rgba(255,255,255,0.55)" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Glass Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation?.goBack()}
          >
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Orders</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{myOrders.length}</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={s.filterRow}>
          {filters.map(f => {
            const isActive = f === activeFilter
            const cfg = Object.values(STATUS_CONFIG).find(sc => sc.label === f)
            return (
              <TouchableOpacity
                key={f}
                style={[s.filterPill, isActive && s.filterPillActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.8}
              >
                {cfg && isActive && (
                  <View
                    style={[s.filterDot, { backgroundColor: cfg.dot }]}
                  />
                )}
                <Text
                  style={[s.filterText, isActive && s.filterTextActive]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#0C831F" />
            <Text style={s.loadingText}>Loading orders…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.center}>
            <View style={s.emptyIconBox}>
              <Text style={{ fontSize: 42 }}>📦</Text>
            </View>
            <Text style={s.emptyTitle}>No orders found</Text>
            <Text style={s.emptySub}>
              {activeFilter !== 'All'
                ? 'Try a different filter'
                : 'Place your first order!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id ?? item.Id)}
            renderItem={({ item }) => (
              <OrderCard
                item={item}
                onView={(o: any) =>
                  navigation?.navigate('ViewOrder', { order: o })
                }
                onReorder={async (o: any) => {
                  try {
                    const orderItems = o.items ?? o.OrderItems
                    if (!orderItems || orderItems.length === 0) {
                      Toast.show('No items found in this order', {
                        duration: Toast.durations.SHORT,
                      })
                      return
                    }
                    const reorderItems = orderItems.map((oi: any) => {
                      const pName =
                        oi.product?.name ||
                        oi.ProductTranslations?.[0]?.Name ||
                        oi.Products?.ProductTranslation?.Name ||
                        'Unknown Product'
                      const pImage =
                        oi.product?.image ||
                        oi.ProductImage?.ImageName ||
                        oi.Products?.ProductImages?.[0]?.ImagePath
                      return {
                        id: oi.product_id || oi.ProductId,
                        variantId: oi.ProductVariantId,
                        name: pName,
                        variantCode: oi.ProductVariants?.VariantCode ?? '',
                        points: oi.price || oi.UnitPrice || 0,
                        // quantity: oi.quantity || oi.Qty ?? 1,
                        images: pImage ? [pImage] : [],
                      }
                    })
                    await setAsyncData('cart_items', reorderItems)
                    navigation?.navigate('PlaceOrder')
                  } catch (error) {
                    console.log('Reorder Error', error)
                    Toast.show('Failed to reorder', {
                      duration: Toast.durations.SHORT,
                    })
                  }
                }}
              />
            )}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

export default MyOrdersScreen

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEA',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 17, color: '#141414' },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontFamily: 'DMSans-Bold',
    color: '#141414',
  },
  countBadge: {
    backgroundColor: '#FFE000',
    borderRadius: 12,
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { fontSize: 13, fontFamily: 'DMSans-Bold', color: '#141414' },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  filterPillActive: { backgroundColor: '#FFE000', borderColor: '#FFE000' },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 12.5, fontFamily: 'DMSans-Medium', color: '#9a9a9a' },
  filterTextActive: { color: '#141414' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 32,
  },
  loadingText: { fontSize: 14, color: '#8a8a8a', fontFamily: 'DMSans-Regular' },
  emptyIconBox: {
    width: 84,
    height: 84,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontFamily: 'DMSans-Bold', color: '#141414' },
  emptySub: {
    fontSize: 13,
    color: '#8a8a8a',
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  },

  listContent: { padding: 14, gap: 12, paddingBottom: 40 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 4,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141414',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardDate: {
    fontSize: 12.5,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: 'rgba(255,255,255,0.55)',
  },

  cardBody: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, gap: 10 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12.5,
    fontFamily: 'DMSans-Regular',
    color: '#9a9a9a',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: '#141414',
    maxWidth: '65%',
  },
  infoValueGreen: { fontSize: 14, fontFamily: 'DMSans-Bold', color: '#0C831F' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: 'DMSans-Bold' },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 16,
  },

  cardActions: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  btnView: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#141414',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  btnViewText: { fontSize: 13, fontFamily: 'DMSans-Bold', color: '#141414' },
  btnReorder: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#0C831F',
  },
  btnReorderText: { fontSize: 13, fontFamily: 'DMSans-Bold', color: '#FFFFFF' },
})
