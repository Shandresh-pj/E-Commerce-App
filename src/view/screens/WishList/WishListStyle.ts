import { StyleSheet } from 'react-native'
import { THEME } from '../../assets/styles/theme'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.COLOR.background },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.background,
  },

  listContent: {
    padding: THEME.SPACING.md,
    paddingBottom: THEME.SPACING.xl,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    padding: THEME.SPACING.md,
    marginBottom: THEME.SPACING.md,
    ...THEME.SHADOW.card,
  },
  imageBox: {
    width: 76,
    height: 76,
    borderRadius: THEME.RADIUS.medium,
    backgroundColor: THEME.COLOR.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: THEME.SPACING.sm,
  },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  imageFallback: {
    fontSize: 15,
    color: THEME.COLOR.textTertiary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },

  infoCol: {
    flex: 1,
    marginLeft: THEME.SPACING.md,
    marginRight: THEME.SPACING.sm,
  },
  productName: {
    fontSize: 14,
    lineHeight: 19,
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Medium,
    marginRight: 28,
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
  moveBtn: {
    alignSelf: 'flex-start',
    marginTop: THEME.SPACING.md,
  },

  removeBtn: {
    position: 'absolute',
    top: THEME.SPACING.md,
    right: THEME.SPACING.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.COLOR.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default styles
