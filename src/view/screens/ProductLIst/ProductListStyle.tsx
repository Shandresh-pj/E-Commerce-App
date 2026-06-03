import { StyleSheet } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const styles = StyleSheet.create({
  container: { flex: 1, },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
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
  searchBase: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cartBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    fontSize: 14,
    color: '#111',
    flex: 1,
    fontWeight: '500',
    padding: 0,
  },

  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    height: 70,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterChipText: { fontSize: 13, color: '#212121', fontWeight: '400' },

  productList: { paddingHorizontal: 10, paddingTop: 10 },
  columnWrapper: { justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    paddingBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  heartBtn: {
    top: 15,
    right: 15,
    position: 'absolute',
    zIndex: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 100,
  },
  cardRow: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  imageBox: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e2e2',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 8
  },
  detailsBox: { width: '100%', marginTop: 4 },

  productName: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
    fontWeight: '400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reviewCount: { fontSize: 12, color: '#878787' },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  discount: { fontSize: 16, color: '#008a00', fontWeight: '600' },
  originalPrice: {
    fontSize: 14,
    color: '#878787',
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 14, fontWeight: '500', color: '#e91e63' },

  wowBadge: {
    borderWidth: 1,
    borderColor: '#1A237E',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
  },
  wowText: { fontSize: 10, fontWeight: '900', color: '#1A237E' },

  assuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  assuredIconBg: {
    backgroundColor: '#612C7E',
    borderRadius: 10,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assuredIcon: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  assuredText: {
    fontSize: 12,
    color: THEME.COLOR.bgPurple,
    fontWeight: '600',
    fontStyle: 'italic',
  },

  spoylBadge: {
    backgroundColor: '#00e676',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  spoylText: { fontSize: 11, color: '#111', fontWeight: '600' },

  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  activeChip: { borderColor: THEME.COLOR.bgPurple, backgroundColor: '#e8f0fe' },
  activeChipText: { color: THEME.COLOR.bgPurple },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalRowText: { fontSize: 15, color: '#212121' },
  modalRowTextActive: { color: THEME.COLOR.bgPurple, fontWeight: '600' },

  filterGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
    marginBottom: 10,
  },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterOptionChip: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterOptionChipActive: {
    borderColor: '#612C7E',
    backgroundColor: '#e8f0fe',
  },
  filterOptionText: { fontSize: 13, color: '#555' },
  filterOptionTextActive: { color: THEME.COLOR.bgPurple, fontWeight: '600' },
  clearBtn: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 8,
  },
  clearBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: { fontSize: 16, color: '#fff' },
  addToCartBtn: {
    marginTop: 10,
    marginHorizontal: 12,
    backgroundColor: '#e91e63',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#612C7E',
  },
  tabText: {
    fontSize: 14,
    color: '#878787',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#612C7E',
    fontWeight: '700',
  },

  // ── Product Detail Modal ──

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    backgroundColor: '#f1f3f6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: '#555', fontWeight: '700' },

  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loaderText: { fontSize: 14, color: '#888' },

  scrollContent: { paddingBottom: 20 },

  imageSection: { backgroundColor: '#f8f9fa' },
  productImage: { height: 260 },
  noImageBox: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f6',
  },
  noImageText: { color: '#aaa', fontSize: 16 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  dotActive: { backgroundColor: '#2874f0', width: 18 },

  infoSection: { paddingHorizontal: 16, paddingTop: 14 },

  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 26,
  },
  pricemodal: { fontSize: 22, fontWeight: '800', color: '#2874f0' },
  mrp: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },

  pointsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef9c3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  pointsText: { fontSize: 13, color: '#2874f0', fontWeight: '600' },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  variantSection: { marginBottom: 16 },
  variantRow: { flexDirection: 'row', gap: 10 },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  variantChipSelected: {
    borderColor: '#2874f0',
    backgroundColor: '#e8f0fe',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  variantChipText: { fontSize: 13, color: '#444', fontWeight: '500' },
  variantChipTextSelected: { color: '#2874f0', fontWeight: '700' },
  variantPrice: { fontSize: 12, color: '#888' },
  variantPriceSelected: { color: '#2874f0', fontWeight: '600' },

  attributeSection: { marginBottom: 16 },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attributeKey: { fontSize: 13, color: '#888', flex: 1 },
  attributeVal: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  descSection: { marginBottom: 16 },
  descText: { fontSize: 14, color: '#555', lineHeight: 22 },

  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  cartBtnModal: {
    backgroundColor: '#2874f0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Add these to your existing styles object
  cardDisabled: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  imageBoxDisabled: {
    opacity: 0.6,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  outOfStockOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  textDisabled: {
    color: '#999',
  },
  addToCartBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});

export default styles;
