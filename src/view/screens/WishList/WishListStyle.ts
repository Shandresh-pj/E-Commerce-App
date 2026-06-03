import { StyleSheet } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f6' },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Header ── */
  header: {
    backgroundColor: '#2a2c40',
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 0,
    shadowOpacity: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: THEME.COLOR.textWhite,
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
  },
  backBtn: {
    marginRight: 15,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  cartCountBadge: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    flexDirection: "row",
    paddingHorizontal: 15

  },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  /* ── List ── */
  listContent: { padding: 12 },

  /* ── Card ── */
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    padding: 10
  },
  imageFallback: {
    fontSize: 16,
    color: '#aaa',
    fontWeight: 'bold',
  },

  infoCol: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 13,
    color: '#fff',
  },
  points: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  /* ── Quantity ── */
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    minWidth: 20,
    textAlign: 'center',
  },

  /* ── Remove button ── */
  removeBtn: {
    width: 36,
    height: 36,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },

  /* ── Empty state ── */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  shopNowBtn: {
    marginTop: 24,
    backgroundColor: THEME.COLOR.bgPurple,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default styles;
