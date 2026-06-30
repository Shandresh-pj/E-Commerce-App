import { StyleSheet } from 'react-native'
import { THEME } from '../../assets/styles/theme'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.COLOR.background },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.background,
  },

  listContent: {
    padding: THEME.SPACING.md,
    paddingBottom: 120,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    padding: THEME.SPACING.md,
    marginBottom: THEME.SPACING.md,
    ...THEME.SHADOW.card,
  },
  imageBox: {
    width: 84,
    height: 84,
    borderRadius: THEME.RADIUS.medium,
    backgroundColor: THEME.COLOR.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: THEME.SPACING.sm,
  },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  imageFallback: {
    fontSize: 16,
    color: THEME.COLOR.textTertiary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },

  info: { flex: 1, marginLeft: THEME.SPACING.md },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  productName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Medium,
    marginRight: THEME.SPACING.sm,
  },

  scorePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: THEME.COLOR.primaryLight,
    borderRadius: THEME.RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  scoreValue: {
    fontSize: 14,
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  scoreLabel: {
    fontSize: 10,
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  variantChip: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: THEME.RADIUS.small,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  variantText: {
    fontSize: 11,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: THEME.SPACING.md,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.COLOR.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'space-between',
    paddingHorizontal: THEME.SPACING.lg,
    paddingVertical: THEME.SPACING.md,
    borderTopWidth: 1,
    borderTopColor: THEME.COLOR.border,
    ...THEME.SHADOW.lg,
  },
  totalInfo: { flex: 1 },
  totalLabel: {
    fontSize: 12,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  totalScore: {
    fontSize: 22,
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  totalUnit: {
    fontSize: 12,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  checkoutBtn: { minWidth: 160 },
})

export default styles
