import { StyleSheet } from 'react-native'
import { THEME } from '../../assets/styles/theme'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.COLOR.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.background,
  },

  scrollContent: {
    padding: THEME.SPACING.lg,
    paddingBottom: 120,
  },

  // ── Section card ────────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    padding: THEME.SPACING.lg,
    marginBottom: THEME.SPACING.md,
    ...THEME.SHADOW.card,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    marginBottom: THEME.SPACING.md,
    letterSpacing: 0.2,
  },

  // ── Order item ──────────────────────────────────────────────────────────────
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    paddingVertical: THEME.SPACING.md,
  },
  orderItemImage: {
    width: 52,
    height: 52,
    borderRadius: THEME.RADIUS.medium,
    backgroundColor: THEME.COLOR.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: THEME.SPACING.md,
    padding: 5,
  },
  itemEmoji: { fontSize: 22 },
  orderItemInfo: { flex: 1, marginRight: THEME.SPACING.sm },
  orderItemName: {
    fontSize: 13.5,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: THEME.COLOR.textPrimary,
    lineHeight: 18,
  },
  orderItemMeta: {
    fontSize: 12,
    color: THEME.COLOR.textSecondary,
    marginTop: 3,
  },
  orderItemPoints: {
    minWidth: 56,
    borderRadius: THEME.RADIUS.medium,
    backgroundColor: THEME.COLOR.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  orderItemScore: {
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.primaryDark,
  },
  orderItemScoreLabel: {
    fontSize: 10,
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  // ── Summary rows ──────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.SPACING.md,
  },
  summaryLabel: { fontSize: 14, color: THEME.COLOR.textSecondary },
  summaryValue: {
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
  },
  totalPointsText: { color: THEME.COLOR.primaryDark },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputGroup: { marginBottom: THEME.SPACING.md },
  inputLabel: {
    fontSize: 11,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    borderRadius: THEME.RADIUS.medium,
    height: 50,
    width: '100%',
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  textInput: {
    height: 50,
    width: '100%',
    paddingHorizontal: THEME.SPACING.lg,
    fontSize: 14,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  textInputError: { borderColor: THEME.COLOR.danger },
  errorText: {
    fontSize: 12,
    color: THEME.COLOR.danger,
    marginTop: 6,
    marginLeft: 4,
  },
  rowInputs: { flexDirection: 'row' },

  // ── Points breakdown ────────────────────────────────────────────────────────
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  pointsRowLabel: { fontSize: 14, color: THEME.COLOR.textSecondary },
  pointsRowValue: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
  },

  // ── Sticky footer ───────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.COLOR.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.SPACING.lg,
    paddingVertical: THEME.SPACING.md,
    borderTopWidth: 1,
    borderTopColor: THEME.COLOR.border,
    ...THEME.SHADOW.lg,
  },
  footerInfo: { flex: 1, marginRight: THEME.SPACING.md },
  footerPoints: {
    fontSize: 20,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.primaryDark,
  },
  footerItemCount: {
    fontSize: 12,
    color: THEME.COLOR.textSecondary,
    marginTop: 1,
  },
  placeOrderBtn: { minWidth: 160 },

  // ── Success screen ──────────────────────────────────────────────────────────
  successContainer: { flex: 1, backgroundColor: THEME.COLOR.background },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.SPACING.xxxl,
  },
  successIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.COLOR.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.SPACING.xxl,
    shadowColor: THEME.COLOR.success,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  successIconText: { fontSize: 42, color: '#fff', fontFamily: THEME.FONTWEIGHT.Bold },
  successTitle: {
    fontSize: 26,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: THEME.COLOR.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: THEME.SPACING.xxl,
  },
  orderIdBadge: {
    backgroundColor: THEME.COLOR.primarySoft,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: THEME.SPACING.xl,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: THEME.SPACING.xxl,
    borderWidth: 1,
    borderColor: THEME.COLOR.primaryLight,
  },
  orderIdLabel: {
    fontSize: 11,
    color: THEME.COLOR.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  orderIdValue: {
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.primaryDark,
    marginTop: 2,
  },
  successBtn: { width: '100%', marginBottom: THEME.SPACING.md },
})

export default styles
