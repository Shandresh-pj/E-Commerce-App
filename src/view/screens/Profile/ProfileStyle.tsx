import { StyleSheet, Dimensions, Platform } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Header bar */
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
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
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

  /* Avatar banner */
  banner: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 32,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: {
    fontSize: 30,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#252B37',
  },
  fullName: {
    fontSize: 20,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#ffffff',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#2a2c40',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(97,176,87,1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeInactive: {
    backgroundColor: 'rgba(221,79,79,1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: '#ffffff',
  },

  /* Points row */
  pointsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 16,
  },
  pointCard: {
    flex: 1,
    alignItems: 'center',
  },
  pointValue: {
    fontSize: 22,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#fff',
  },
  pointLabel: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#fff',
    marginTop: 3,
  },
  pointDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 4,
  },
  btnPrimary: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.COLOR.btnPurple,
    borderRadius: THEME.RADIUS.large,
    paddingHorizontal: 20,
  },

  /* Info sections */
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: '#fff',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: '#fff',
    maxWidth: width * 0.55,
    textAlign: 'right',
  },
  referralCode: {
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#fff',
    letterSpacing: 1,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  /* Edit Profile button */
  editBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: '#252B37',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: THEME.COLOR.textBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    marginBottom: 40,
  },
  editBtnText: {
    fontSize: 15,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default styles;
