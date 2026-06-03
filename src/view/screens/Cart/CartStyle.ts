import { StyleSheet } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const styles = StyleSheet.create({
  container: { flex: 1, },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingVertical: 15,
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#2a2c40',
    paddingHorizontal: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarTitle: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.large,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },

  backBtn: {
    marginRight: 15,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  cartCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  listContent: { padding: 12 },

  // Card — full-width row layout
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    padding: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  imageBox: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e2e2',
    borderRadius: 10,
    overflow: 'hidden',
  },

  productName: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priceLabel: { fontSize: 13, color: '#878787' },
  points: { fontSize: 15, fontWeight: '700', color: THEME.COLOR.bgPurple },

  // Quantity controls
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: THEME.COLOR.bgPurple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.COLOR.bgPurple,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    minWidth: 28,
    textAlign: 'center',
  },

  // Remove button
  removeBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderRadius: 100,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#fff',
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

  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalInfo: {
    flex: 1,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  totalLabel: {
    fontSize: 12,
    color: '#878787',
  },
  checkoutBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.COLOR.btnPurple,
    borderRadius: THEME.RADIUS.large,
    paddingHorizontal: 20,
  },
  checkoutText: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.medium,
    alignSelf: 'center',
    fontFamily: THEME.FONTWEIGHT.Bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
});

export default styles;
