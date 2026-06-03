import { StyleSheet, Dimensions, Platform } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  /* ── Header ── */
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  /* ── Screen ── */
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* ── Envelope illustration ── */
  envelopeWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:0,
  },
  envBody: {
    width: 100,
    height: 70,
    backgroundColor: '#CBD5E1',
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  envFlap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: '#B8C4D4',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    // trapezoid via border trick
    borderBottomWidth: 18,
    borderBottomColor: '#CBD5E1',
    borderLeftWidth: 50,
    borderLeftColor: 'transparent',
    borderRightWidth: 50,
    borderRightColor: 'transparent',
    width: 100,
    overflow: 'hidden',
  },
  envLeftFold: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderBottomWidth: 30,
    borderLeftColor: '#A8B6CA',
    borderBottomColor: 'transparent',
  },
  envRightFold: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 50,
    borderBottomWidth: 30,
    borderRightColor: '#A8B6CA',
    borderBottomColor: 'transparent',
  },

  /* Heart card */
  heartCard: {
    position: 'absolute',
    top: -36,
    width: 64,
    height: 72,
    backgroundColor: '#F43F6A',
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 12,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#F43F6A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heartContainer: {
    position: 'relative',
    bottom: 10,
  },
  heartPart: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    top: 0,
  },
  /* ── Ref ID ── */
  refId: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F43F6A',
    letterSpacing: 2,
    marginBottom: 18,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  /* ── Description ── */
  description: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  bonusText: {
    fontWeight: '800',
    color: '#fff',
  },

  /* ── Share buttons ── */
  shareBtnRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },

  /* Facebook */
  fbText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 50,
    marginTop: 4,
  },

  /* WhatsApp */
  waCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waText: {
    fontSize: 22,
    color: '#fff',
  },

  /* SMS */
  smsText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
});

export default styles;
