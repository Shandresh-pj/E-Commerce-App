import { TextStyle, ViewStyle, StyleSheet, Dimensions, Platform, } from 'react-native';
import { THEME } from './theme';
const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = 250

const styles = StyleSheet.create({
  /*common*/
  container: {
    flex: 1,
    display: 'flex',
  },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  w100: {
    width: "100%"
  },
  header: {
    paddingVertical: 15,
    elevation: 0,
    flexDirection: "row",
    justifyContent: 'space-between',
    backgroundColor: '#2a2c40',
    paddingHorizontal: 15
  },
  btnPrimary: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.COLOR.btnPurple,
    borderRadius: THEME.RADIUS.large,
    paddingHorizontal: 20,
  },
  btnSecondary: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.COLOR.btnGrey,
    borderRadius: THEME.RADIUS.large,
    paddingHorizontal: 20,
  },
  btnTextWhite: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.medium,
    alignSelf: 'center',
    fontFamily: THEME.FONTWEIGHT.Bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },

  btnTextBlack: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    alignSelf: 'center',
    fontFamily: THEME.FONTWEIGHT.Bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },

  fixedBottomBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    width: "100%",
    bottom: 0,
    alignSelf: "center",
    backgroundColor: THEME.COLOR.bgWhite,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 4,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: THEME.COLOR.border,
    borderRightColor: THEME.COLOR.border,
    borderLeftColor: THEME.COLOR.border,
    zIndex: 100
  },
  normalBottomBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignSelf: "center",
    backgroundColor: THEME.COLOR.bgWhite,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 4,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: THEME.COLOR.border,
    borderRightColor: THEME.COLOR.border,
    borderLeftColor: THEME.COLOR.border,
  },

  contentBlock: {
    padding: 15,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarTitle: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.large,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  backBtn: {
    marginRight: 15,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100
  },

  errorMsg: {
    color: THEME.COLOR.textWhite,
    fontSize: 12,
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  bottom: {
    justifyContent: "flex-end",
    alignItems: "center"
  },
  top: {
    justifyContent: "flex-start",
    alignItems: "center"
  },

  /**Splash* */
  splahScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  SpalsTitle: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.large,
    alignSelf: 'center',
    fontFamily: THEME.FONTWEIGHT.Bold,
    marginTop: 20,
  } as TextStyle,

  formlabel: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  /**end */

  /**Form **/

  row1: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  box: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  boxChecked: {
    backgroundColor: THEME.COLOR.bgPurple,
    borderColor: THEME.COLOR.bgPurple,
  },
  check: { color: 'white', fontSize: 16 },
  label: { marginLeft: 10, fontSize: 16 },
  result: { marginTop: 20, fontSize: 16, fontStyle: 'italic' },


  keyboardView: {
    flex: 1,
  },

  formgroup: {
    marginBottom: 15,
    width: '100%',
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
    fontSize:14,
    color: '#fff',
    fontFamily: THEME.FONTWEIGHT.Regular,
  },

  textAreaContainer: {
    borderRadius: 10,
    height: 150,
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DFDFDF',
  },

  textAreaStyle: {
    height: 150,
    width: '100%',
    paddingHorizontal: 25,
    fontSize: 15,
    color: '#564f75',
    fontFamily: THEME.FONTWEIGHT.Regular,
    textAlignVertical: 'top',
  },
  loginWidth: {
    width: width < 767 ? '100%' : '70%',
    alignSelf: 'center',
  },

  LoginTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: THEME.FONTWEIGHT.Bold,
    marginBottom: width < 767 ? 5 : 5,
    textAlign: "center"
  },

  LoginSubTitle: {
    color: '#fff',
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Regular,
    textAlign: "center"
  },

  /**Home */

  TableGridEmpty: {
    backgroundColor: THEME.COLOR.bgHalfWhite,
    width: '100%',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    //borderWidth: 1,
    //borderStyle: 'dashed',
    //borderColor: '#d1d7de',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  TableNumber: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.small,
    alignSelf: 'center',
    fontFamily: THEME.FONTWEIGHT.Medium,
    textTransform: 'uppercase',
  },

  homeSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height,
    backgroundColor: THEME.COLOR.bgWhite,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: THEME.COLOR.border,
    borderRightColor: THEME.COLOR.border,
    borderLeftColor: THEME.COLOR.border,
    overflow: "hidden",
  },
  // sheet: {
  //   position: "absolute",
  //   bottom: 0,
  //   width: "100%",
  //   backgroundColor: THEME.COLOR.bgWhite,
  //   borderTopLeftRadius: 24,
  //   borderTopRightRadius: 24,
  //   padding: 15,
  // },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  sheetInner: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: THEME.COLOR.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 50
  },
  sheetOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    height: '100%',
  },

  sheetpadding: {
    padding: 15
  },
  sheetInnerRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: THEME.COLOR.bgWhite,
  },
  handleSet: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    width: "100%"
  },

  handle: {
    width: 50,
    height: 5,
    backgroundColor: THEME.COLOR.bgGrey,
    borderRadius: 4,
    alignSelf: "center",
  },

  fullSheet: {
    height: height,
    backgroundColor: THEME.COLOR.bgWhite,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: THEME.COLOR.border,
    borderRightColor: THEME.COLOR.border,
    borderLeftColor: THEME.COLOR.border
  },
  infoTitle: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.large,
    alignSelf: "center",
    textAlign: "center",
    paddingVertical: 20,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  /** Drawer**/
  menuHeader: {
    flexDirection: "row",
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
    marginBottom: 0,
    //borderRadius: THEME.RADIUS.large,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c40',
    overflow: "hidden"
  },
  profileNameBox: {
    width: 65,
    height: 65,
    borderRadius: THEME.RADIUS.large,
    backgroundColor: THEME.COLOR.bgPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  nameLetterText: {
    color: '#fff',
    fontSize: THEME.FONTSIZE.Exlarge,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  nameText: {
    color: '#fff',
    fontSize: THEME.FONTSIZE.large,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },

  drawertitle: {
    color: '#fff',
    fontSize: THEME.FONTSIZE.large,
    fontFamily: THEME.FONTWEIGHT.Medium,
    marginTop: 10,
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  emailText: {
    color: '#fff',
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Regular,
    marginTop: 5,
  },
  menuList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    marginBottom: 35,
  },
  menuLeftIcon: {
    marginRight: 10,
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  versionTxt: {
    color: THEME.COLOR.textDarkGrey,
    fontSize: THEME.FONTSIZE.small,
    fontFamily: THEME.FONTWEIGHT.Regular,
    alignSelf: 'center',
  },

  menuFooter: {
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 40,
  },

  /**menu */
  menuTopBtnBase: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTopBtn: {
    backgroundColor: THEME.COLOR.bgHalfWhite,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    fontFamily: THEME.FONTWEIGHT.Medium,
    borderRadius: 100,
    marginLeft: 8,
    height: 45,
    width: 45,
    paddingHorizontal: 15
  },
  menuTopBtnText: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    marginLeft: 5,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.COLOR.textRed,
    borderRadius: 10,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.COLOR.bgPurple,
  },
  notificationBadgeText: {
    color: THEME.COLOR.textWhite,
    fontSize: 8,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  headerNotificationBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 15,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNotificationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  addPerson: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    borderRadius: 100,
    backgroundColor: THEME.COLOR.bgHalfWhite,
  },
  addPersonText: {
    fontFamily: THEME.FONTWEIGHT.Bold,
    fontSize: THEME.FONTSIZE.large,
  },
  menuTabContainer: {
    backgroundColor: THEME.COLOR.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  TabText: {
    fontSize: THEME.FONTSIZE.small,
    color: THEME.COLOR.textDarkGrey,
    fontFamily: THEME.FONTWEIGHT.Regular,
    backgroundColor: THEME.COLOR.bgWhite,
  },
  TabButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginRight: 15,
    borderBottomWidth: 2,
    borderBottomColor: THEME.COLOR.borderWhite,
  },
  TabButtonActive: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginRight: 15,
    borderBottomWidth: 2,
    borderBottomColor: THEME.COLOR.bgPurple,
  },

  TabTextActive: {
    fontSize: THEME.FONTSIZE.small,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  search: {
    width: "80%",
    alignSelf: "center",
    flexDirection: 'row',
    justifyContent: "space-between",
    backgroundColor: THEME.COLOR.bgWhite,
    opacity: 1,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    borderTopColor: THEME.COLOR.border,
    borderRadius: THEME.RADIUS.large
  },

  searchField: {
    fontSize: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlignVertical: 'center',
    height: 40,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: THEME.COLOR.textBlack,
  },

  searchClose: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2.5
  },

  menuTab: {
    backgroundColor: THEME.COLOR.bgWhite,
    marginTop: width < 767 ? 0 : 0,
    width: width < 767 ? '100%' : '100%',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    borderRadius: width < 767 ? 0 : 0,
    overflow: 'hidden',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15
  } as ViewStyle,

  menuBox: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 5,
    borderRadius: THEME.RADIUS.large,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgWhite,
    // borderWidth: 1,
    // borderColor: THEME.COLOR.bgWhite,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.COLOR.borderWhite,
  },
  menuBoxMandatory: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 5,
    borderRadius: THEME.RADIUS.large,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgWhite,
    // borderWidth: 1,
    // borderColor: '#e0e0e0',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    justifyContent: 'center',
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.COLOR.borderWhite,
  },
  menuBoxImage: {
    borderRadius: 100,
    height: width < 767 ? 80 : 100,
    width: width < 767 ? 80 : 100,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    overflow: "hidden",
    backgroundColor: THEME.COLOR.bgWhite
  },
  menuImage: {
    height: width < 767 ? 80 : 100,
    width: width < 767 ? 80 : 100,
  },
  menuName: {
    fontSize: THEME.FONTSIZE.small,
    alignContent: "center",
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Medium,
    marginVertical: 10
  },
  menupagePrice: {
    fontSize: THEME.FONTSIZE.small,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  menuTag: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: 25,
    height: 25
  },
  menuTagWhite: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgWhite,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: 25,
    height: 25
  },
  menuTagText: {
    fontSize: THEME.FONTSIZE.medium,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  nodata: {
    fontSize: THEME.FONTSIZE.small,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Regular,
    marginTop: 10,
  },
  menuSepetator: {
    justifyContent: 'center',
    flexDirection: "row",
    backgroundColor: THEME.COLOR.bgWhite,
    marginBottom: 20,
    borderRadius: 0,
    textAlign: "center",
    paddingVertical: 15,
  },
  menuSepetatorText: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  popUpheader: {
    backgroundColor: THEME.COLOR.bgWhite,
    paddingVertical: 5,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
  },
  popUpheaderTxt: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  popUpClose: {
    width: 40,
    height: 40,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  accessoryContainer: {
    backgroundColor: THEME.COLOR.bgHalfWhite,
    width: "100%",
    paddingHorizontal: 15,
  },
  accessoryListBox: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: THEME.RADIUS.medium,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10
  },
  accessoryList: {
    paddingVertical: 0,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  accessoryName: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  accessoryCountBox: {
    position: 'absolute',
    right: -2,
    top: 8,
  },
  accessoryCount: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: THEME.COLOR.bgHalfWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  accessoryCountTxt: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.small,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  accessoryCountActive: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: THEME.COLOR.bgPurple,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  checkInnerCircle: {
    width: 15,
    height: 15,
    borderRadius: 100,
    backgroundColor: THEME.COLOR.bgWhite,
  },

  accessoryCountActiveTxt: {
    color: THEME.COLOR.textWhite,
    fontSize: THEME.FONTSIZE.small,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  accessoryNameSm: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },
  noteField: {
    minHeight: 100,
    width: '100%',
    paddingHorizontal: 15,
    fontSize: THEME.FONTSIZE.medium,
    color: '#564f75',
    fontFamily: THEME.FONTWEIGHT.Regular,
  },

  /**Cart */
  cartlist: {
    marginBottom: 15,
    width: "100%",
    overflow: "hidden",
    padding: 10,
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: THEME.RADIUS.medium,
    borderWidth: 1,
    borderColor: THEME.COLOR.bgWhite,
  },
  cartleft: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "75%",
  },

  cartimage: {
    height: 60,
    width: 60,
    borderRadius: THEME.RADIUS.medium,
    backgroundColor: THEME.COLOR.bgWhite,
    borderColor: THEME.COLOR.border,
    borderWidth: 1,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: "hidden"
  },

  cartright: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "25%",
  },

  cartAccessory: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.small,
    fontFamily: THEME.FONTWEIGHT.Regular,
  },

  cartTotalTxt: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.small,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  cartTotalPrice: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.large,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },

  /**Order details */
  orderdetailBox: {
    width: "100%",
    overflow: "hidden",
    padding: 10,
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: THEME.RADIUS.medium,

  },

  orderdetailLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderdetailRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderdetailBottom: {
    marginTop: 15,
    overflow: "hidden",
    backgroundColor: THEME.COLOR.bgWhite,
    borderRadius: THEME.RADIUS.medium,
  },
  ordertotallist: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    overflow: "hidden",
    backgroundColor: THEME.COLOR.bgWhite,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "100%",
  },
  orderSuccessIcon: {
    height: 35,
    width: 35,
    backgroundColor: THEME.COLOR.textSuccess,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: 'center',
    marginRight: 15
  },
  orderSuccessTxt: {
    color: THEME.COLOR.textBlack,
    fontSize: THEME.FONTSIZE.medium,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },





});

export default styles;
