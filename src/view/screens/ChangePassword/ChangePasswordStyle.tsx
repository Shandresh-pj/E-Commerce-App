import { StyleSheet, Dimensions } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // ── Containers ────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    overflow: 'hidden',
  },

  keyboardView: {
    flex: 1,
  },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 48,
    flexGrow: 1,
  },

  // ── Background Orbs ───────────────────────────────────────────────────────
  orb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(97, 44, 126, 0.05)',
  },

  orb2: {
    position: 'absolute',
    bottom: 60,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(97, 176, 87, 0.05)',
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
  backButton: {
    marginRight: 15,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  backArrow: {
    width: 9,
    height: 9,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: THEME.COLOR.textWhite,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  backArrowTail: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: THEME.COLOR.textWhite,
    borderRadius: 1,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    color: THEME.COLOR.bgPurple,
    fontFamily: 'Courier New',
    marginBottom: 2,
  },

  // ── Lock Visual ───────────────────────────────────────────────────────────
  lockVisual: {
    alignItems: 'center',
    paddingVertical: 28,
  },

  lockBody: {
    alignItems: 'center',
    marginBottom: 12,
  },

  lockShackleOuter: {
    width: 36,
    height: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: THEME.COLOR.bgPurple,
    marginBottom: -3,
    zIndex: 1,
  },

  lockShackleInner: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },

  lockBodyInner: {
    width: 56,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.COLOR.btnGrey,
    borderWidth: 1.5,
    borderColor: THEME.COLOR.bgPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockKeyhole: {
    width: 12,
    height: 16,
    borderRadius: 6,
    backgroundColor: THEME.COLOR.bgPurple,
    opacity: 0.85,
  },

  lockCaption: {
    fontSize: 13,
    color: THEME.COLOR.textDarkGrey,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },

  divider: {
    height: 1,
    backgroundColor: THEME.COLOR.border,
    marginBottom: 20,
  },

  // ── Field ─────────────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
    paddingVertical: 0,
    fontFamily: THEME.FONTWEIGHT.Regular,
    
  },

  // ── Eye Toggle ────────────────────────────────────────────────────────────
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },

  // ── Match Row ─────────────────────────────────────────────────────────────
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
    marginBottom: 20,
  },

  matchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  matchText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Submit Button ─────────────────────────────────────────────────────────
  btnWrapper: {
    marginTop: 4,
    marginBottom: 16,
  },

  submitButton: {
    backgroundColor: THEME.COLOR.bgPurple,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.COLOR.bgPurple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },

  submitButtonSuccess: {
    backgroundColor: THEME.COLOR.textSuccess,
    shadowColor: THEME.COLOR.textSuccess,
  },

  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.COLOR.textWhite,
    letterSpacing: 0.5,
  },

});

export default styles;
