import { StyleSheet } from 'react-native'
import { THEME } from '../../assets/styles/theme'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.COLOR.background },

  // ── Search + filter area ──────────────────────────────────────────────────
  searchSection: {
    paddingHorizontal: THEME.SPACING.lg,
    paddingTop: THEME.SPACING.md,
    backgroundColor: THEME.COLOR.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    paddingBottom: THEME.SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surfaceAlt,
    borderRadius: THEME.RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    paddingHorizontal: THEME.SPACING.lg,
    height: 46,
    gap: THEME.SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Regular,
    padding: 0,
  },
  clearBtnInline: { padding: 2 },
  clearBtnText: {
    fontSize: 15,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Bold,
    lineHeight: 18,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.SPACING.sm,
    marginTop: THEME.SPACING.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: THEME.SPACING.lg,
    paddingVertical: 8,
    borderRadius: THEME.RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    backgroundColor: THEME.COLOR.surface,
  },
  chipActive: {
    borderColor: THEME.COLOR.primary,
    backgroundColor: THEME.COLOR.primarySoft,
  },
  chipText: {
    fontSize: 13,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  chipTextActive: { color: THEME.COLOR.primary },
  resultCount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: THEME.COLOR.textTertiary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  // ── Product grid ──────────────────────────────────────────────────────────
  productList: {
    paddingHorizontal: THEME.SPACING.md,
    paddingTop: THEME.SPACING.md,
    paddingBottom: THEME.SPACING.xl,
  },
  columnWrapper: { justifyContent: 'space-between' },

  card: {
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    marginBottom: THEME.SPACING.md,
    padding: THEME.SPACING.sm,
    ...THEME.SHADOW.card,
  },
  imageWrap: {
    width: '100%',
    height: 130,
    borderRadius: THEME.RADIUS.medium,
    backgroundColor: THEME.COLOR.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: THEME.SPACING.sm,
  },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  noImageText: {
    color: THEME.COLOR.textTertiary,
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.SHADOW.sm,
  },

  info: { paddingHorizontal: THEME.SPACING.xs, paddingTop: THEME.SPACING.sm },
  productName: {
    fontSize: 13.5,
    lineHeight: 18,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Medium,
    minHeight: 36,
  },
  scorePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: THEME.COLOR.primaryLight,
    borderRadius: THEME.RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: THEME.SPACING.sm,
  },
  scoreValue: {
    fontSize: 15,
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  scoreLabel: {
    fontSize: 10,
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  stockText: {
    fontSize: 11,
    marginTop: 6,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  stockLow: { color: THEME.COLOR.danger },
  stockIn: { color: THEME.COLOR.success },
  stockOut: { color: THEME.COLOR.textTertiary },
  ctaWrap: { marginTop: THEME.SPACING.md },

  // ── Loading / footer ──────────────────────────────────────────────────────
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.SPACING.md,
    paddingTop: THEME.SPACING.md,
  },
  footer: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: THEME.COLOR.textTertiary,
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  // ── Modals (sort / filter) ────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: THEME.COLOR.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: THEME.COLOR.surface,
    borderTopLeftRadius: THEME.RADIUS.xlarge,
    borderTopRightRadius: THEME.RADIUS.xlarge,
    paddingHorizontal: THEME.SPACING.xl,
    paddingBottom: THEME.SPACING.xxxl,
    paddingTop: THEME.SPACING.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.COLOR.border,
    alignSelf: 'center',
    marginBottom: THEME.SPACING.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textPrimary,
    marginBottom: THEME.SPACING.md,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  modalRowText: {
    fontSize: 15,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  modalRowTextActive: {
    color: THEME.COLOR.primary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  filterGroupLabel: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: THEME.SPACING.xl,
    marginBottom: THEME.SPACING.md,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.SPACING.sm,
  },
  filterOptionChip: {
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    borderRadius: THEME.RADIUS.pill,
    paddingHorizontal: THEME.SPACING.lg,
    paddingVertical: 8,
    backgroundColor: THEME.COLOR.surface,
  },
  filterOptionChipActive: {
    borderColor: THEME.COLOR.primary,
    backgroundColor: THEME.COLOR.primarySoft,
  },
  filterOptionText: {
    fontSize: 13,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  filterOptionTextActive: {
    color: THEME.COLOR.primary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: THEME.SPACING.md,
    marginTop: THEME.SPACING.xxl,
  },
})

export default styles
