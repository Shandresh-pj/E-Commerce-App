import { StyleSheet, Dimensions } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const { width } = Dimensions.get('window');

const editStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Header ── */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAEC',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  backArrow: {
    fontSize: 22,
    color: '#252B37',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#252B37',
  },

  /* ── Banner ── */
  banner: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: {
    fontSize: 26,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#252B37',
  },
  bannerHint: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: 'rgba(255,255,255,0.65)',
  },

  /* ── Scroll ── */
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Card ── */
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 28,
  },

  /* ── Floating input ── */
  fieldWrap: {
    marginBottom: 25,
  },
  inputBox: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  inputBoxFocused: {
    borderColor: '#252B37',
    backgroundColor: '#ffffff',
  },
  inputBoxError: {
    borderColor: '#E04F4F',
    backgroundColor: '#FFF8F8',
  },
  floatLabel: {
    position: 'absolute',
    left: 5,
    fontFamily: THEME.FONTWEIGHT.Regular,
    backgroundColor: 'transparent',
  },
  textInput: {
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: '#252B37',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginTop: 4,
  },
  errorText: {
    fontFamily: THEME.FONTWEIGHT.Regular,
    fontSize: 12,
    color: '#fff',
    marginTop: 10,
    marginLeft: 6,
  },

  /* digit counter */
  digitCounter: {
    textAlign: 'right',
    fontSize: 11,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: '#A4A7AE',
    marginTop: -12,
    marginBottom: 6,
  },
  digitCounterValid: {
    color: '#61b057',
  },
  digitCounterError: {
    color: '#E04F4F',
  },

  /* ── Save button ── */
  saveBtn: {
    marginHorizontal: 16,
    backgroundColor: '#252B37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: THEME.COLOR.textBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default editStyles;
