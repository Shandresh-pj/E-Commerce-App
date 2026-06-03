import { StyleSheet, Dimensions } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
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
    color: '#ffffff',
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

  // Decorative blobs (match the screenshot background)
  blobTopRight: {
    position: 'absolute',
    top: 10,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 200, 220, 0.35)',
  },
  blobMidLeft: {
    position: 'absolute',
    top: 320,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(180, 220, 255, 0.3)',
  },
  blobBottom: {
    position: 'absolute',
    top: 700,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 180, 200, 0.25)',
  },

  // Typography
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 21,
    paddingVertical: 30,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  formgroup: {
    marginBottom: 15,
    width: '100%',
  },

  label: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Regular,
    marginBottom: 10,
  },

  inputContainer: {
    borderRadius: THEME.RADIUS.large,
    height: 50,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },
  inputStyle: {
    height: 50,
    width: '100%',
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#fff',
    fontFamily: THEME.FONTWEIGHT.Regular,
  },

  // Inputs
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputError: {
    borderColor: '#E53935',
    borderRadius: THEME.RADIUS.large,
    borderWidth: 1,
    borderStyle: "solid",
  },
  textArea: {
    borderRadius: 16,
    height: 110,
    paddingTop: 14,
  },

  // Validation
  errorText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 10,
    marginLeft: 6,
  },

  // Send Button
  sendButton: {
    backgroundColor: THEME.COLOR.bgPurple ?? THEME.COLOR.bgPurple,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default styles;
