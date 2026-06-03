import { StyleSheet } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.COLOR.bgHalfWhite,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#2a2c40',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  headerRight: {
    alignItems: 'center',
    width: 36,
  },

  orderCount: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.COLOR.warning,
    lineHeight: 18,
  },

  orderCountLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },

  // ── Filter Pills ──────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#3D1A52',
  },

  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  filterPillActive: {
    backgroundColor: THEME.COLOR.bgWhite,
    borderColor: THEME.COLOR.bgWhite,
  },

  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },

  filterTextActive: {
    color: THEME.COLOR.bgPurple,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    overflow: 'hidden',
    shadowColor: THEME.COLOR.textBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Card Header (date strip)
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  calIconBox: {
    flexDirection: 'row',
    gap: 3,
  },

  calDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.COLOR.bgPurple,
    opacity: 0.5,
  },

  cardDate: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: THEME.COLOR.textBlack,
    letterSpacing: 0.2,
  },

  cardTime: {
    fontSize: 11,
    color: THEME.COLOR.textDarkGrey,
    fontFamily: 'Courier New',
  },

  // Card Body
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontSize: 12,
    color: THEME.COLOR.textDarkGrey,
    letterSpacing: 0.2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.COLOR.textBlack,
    letterSpacing: 0.3,
  },

  infoValueScore: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.COLOR.bgPurple,
    letterSpacing: 0.2,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Divider
  cardDivider: {
    height: 1,
    backgroundColor: THEME.COLOR.border,
    marginHorizontal: 16,
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },

  btnView: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: THEME.COLOR.bgPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.COLOR.bgPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  btnViewText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.COLOR.textWhite,
    letterSpacing: 0.3,
  },

  btnReorder: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderWidth: 1.5,
    borderColor: THEME.COLOR.bgPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnReorderText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.COLOR.bgPurple,
    letterSpacing: 0.3,
  },

  // ───────────────────────  View Order Style  ─────────────────────────

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 48,
    gap: 14,
  },

  // ── Summary Card ──────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    padding: 16,
    shadowColor: THEME.COLOR.textBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: THEME.COLOR.border,
  },

  summaryLabel: {
    fontSize: 12,
    color: THEME.COLOR.textDarkGrey,
    letterSpacing: 0.2,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.COLOR.textBlack,
    maxWidth: '60%',
    textAlign: 'right',
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    overflow: 'hidden',
    shadowColor: THEME.COLOR.textBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },

  sectionAccent: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: THEME.COLOR.bgPurple,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.COLOR.bgPurple,
    letterSpacing: 0.2,
  },

  sectionBody: {
    padding: 16,
  },

  // ── Address ───────────────────────────────────────────────────────────────
  addressCard: {
    flexDirection: 'row',
    gap: 12,
  },

  addressIconCol: {
    alignItems: 'center',
    paddingTop: 2,
  },

  addressIconOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.COLOR.bgPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addressIconInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.COLOR.bgPurple,
  },

  addressLine: {
    flex: 1,
    width: 2,
    backgroundColor: THEME.COLOR.border,
    borderRadius: 1,
    marginTop: 4,
    marginBottom: -8,
  },

  addressText: {
    flex: 1,
    gap: 2,
  },

  addressName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.COLOR.textBlack,
    marginBottom: 2,
  },

  addressDetail: {
    fontSize: 13,
    color: THEME.COLOR.textDarkGrey,
    lineHeight: 20,
  },

  addressPhone: {
    fontSize: 13,
    color: THEME.COLOR.bgPurple,
    fontWeight: '600',
    marginTop: 4,
  },

  // ── Products ──────────────────────────────────────────────────────────────
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  productIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(97,44,126,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productIconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.COLOR.bgPurple,
    opacity: 0.6,
  },

  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.COLOR.textBlack,
  },

  productQty: {
    fontSize: 12,
    color: THEME.COLOR.textDarkGrey,
    marginTop: 1,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.COLOR.bgPurple,
    letterSpacing: 0.1,
  },

  productDivider: {
    height: 1,
    backgroundColor: THEME.COLOR.border,
    marginVertical: 6,
  },

  // ── Bill Summary ──────────────────────────────────────────────────────────
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  billLabel: {
    fontSize: 13,
    color: THEME.COLOR.textDarkGrey,
  },

  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.COLOR.textBlack,
  },

  billTotalDivider: {
    height: 1.5,
    backgroundColor: THEME.COLOR.border,
    marginVertical: 6,
  },

  billTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.COLOR.textBlack,
  },

  billTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.COLOR.bgPurple,
    letterSpacing: 0.2,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  ctaWrapper: {
    paddingTop: 4,
  },

  ctaBtn: {
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.COLOR.bgPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  ctaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.COLOR.textWhite,
    letterSpacing: 0.5,
  },
});

export default styles;
