import React, { useEffect, useState } from 'react';
import {
  createDrawerNavigator,
  useDrawerStatus,
} from '@react-navigation/drawer';
import {
  CommonActions,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import StackNavigator from './StackNavigator';
import {
  Alert,
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from '../view/assets/styles/styles';
import { THEME } from '../view/assets/styles/theme';
import { connect } from 'react-redux';
import RightArrow from '../view/assets/images/svg/menuRightArrow.svg';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { logout } from '../shared/redux/actions/auth.action';
import { getData } from '../shared/services/main-service';

const Drawer = createDrawerNavigator();
const DRAWER_DISABLED_ROUTES = ['Splash', 'Login', 'SignUp'];

const CustomDrawerContent = (props: any) => {
  const { navigation, dispatch } = props;
  const drawerStatus = useDrawerStatus();
  const insets = useSafeAreaInsets();
  const [points, setPoints] = useState({
    available: 0,
    totalCredit: 0,
    totalDebit: 0,
  });
  const [profileName, setProfileName] = useState({
    firstName: '',
    lastName: '',
    Email: '',
  });

  useEffect(() => {
    if (drawerStatus === 'open') {
      console.log('Drawer opened, refreshing profile...');
      loadData();
    }
  }, [drawerStatus]);

  const loadData = async () => {
    try {
      let res = await getData(`/User/MyProfile`);
      console.log('Fetched customer data:', res);
      const customerData = res?.data?.data || res?.data?.object?.data || null;
      console.log('Fetched customer data:', customerData);
      if (customerData) {
        setPoints({
          available: Number(customerData.AvailablePoints) || 0,
          totalCredit: Number(customerData.TotalCreditPoints) || 0,
          totalDebit: Number(customerData.TotalDebitPoints) || 0,
        });
        setProfileName({
          firstName: customerData.FirstName || '',
          lastName: customerData.LastName || '',
          Email: customerData.Email || '',
        });
      }
    } catch (error) {
      console.log('Error in loadData:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../view/assets/images/drawer.jpg')}
        imageStyle={{
          resizeMode: 'cover',
          alignSelf: 'center',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            navigation.closeDrawer();
            navigation.navigate('HomeDrawer', { screen: 'Profile' });
          }}
        >
          <View style={[styles.menuHeader]}>
            <View style={[styles.profileNameBox]}>
              <Text style={styles.nameLetterText}>
                {profileName.firstName
                  ? profileName.firstName.slice(0, 1).toUpperCase()
                  : ''}
                {profileName.lastName
                  ? profileName.lastName.slice(0, 1).toUpperCase()
                  : ''}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.nameText}>
                {'Hi, '}
                {profileName.firstName}
                {profileName.lastName ? ' ' + profileName.lastName : ''}
              </Text>
              <Text style={styles.emailText}>
                {profileName.Email ? profileName.Email : 'N/A'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <ScrollView
          {...props}
          contentContainerStyle={[
            { padding: 0, margin: 0 },
            { paddingBottom: insets.bottom + 8, height: '100%' },
          ]}
        >
          <>
            {/* ── Points Cards Row ── */}
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 15,
                marginTop: 12,
                marginBottom: 20,
                gap: 8,
              }}
            >
              {/* Available */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontFamily: 'DMSans-Bold',
                  }}
                >
                  {points.available}
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 11,
                    fontFamily: 'DMSans-Regular',
                    marginTop: 3,
                    textAlign: 'center',
                  }}
                >
                  Available
                </Text>
              </View>

              {/* Credit */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontFamily: 'DMSans-Bold',
                  }}
                >
                  {points.totalCredit}
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 11,
                    fontFamily: 'DMSans-Regular',
                    marginTop: 3,
                    textAlign: 'center',
                  }}
                >
                  Credit
                </Text>
              </View>

              {/* Debit */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontFamily: 'DMSans-Bold',
                  }}
                >
                  {points.totalDebit}
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 11,
                    fontFamily: 'DMSans-Regular',
                    marginTop: 3,
                    textAlign: 'center',
                  }}
                >
                  Debit
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('HomeDrawer', { screen: 'Home' });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>Home</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('HomeDrawer', { screen: 'ScoreHistory' });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>Score History</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('HomeDrawer', { screen: 'Profile' });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>My Profile</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('HomeDrawer', { screen: 'MyOrders' });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>My Orders</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('HomeDrawer', { screen: 'ChangePassword' });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate('HomeDrawer', { screen: 'ContactUs' });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>Support</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuList,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                },
              ]}
              onPress={() => {
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                      navigation.closeDrawer();
                      dispatch(logout());
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [
                            {
                              name: 'HomeDrawer',
                              state: { routes: [{ name: 'Login' }] },
                            },
                          ],
                        }),
                      );
                    },
                  },
                ]);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <RightArrow style={styles.menuLeftIcon} />
                <Text style={styles.menuItemText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const DrawerNavigator = (props: any) => {
  const { dispatch, isLoggedIn, user } = props;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor={THEME.COLOR.bgPurple}
        translucent={false}
      />
      <SafeAreaView edges={['left', 'right', 'top']} style={styles.container}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerType: 'slide',
            drawerHideStatusBarOnOpen: false,
            drawerStyle: {
              padding: 0,
              marginVertical: 0,
            },
          }}
          drawerContent={(props: any) => (
            <CustomDrawerContent {...props} dispatch={dispatch} />
          )}
        >
          <Drawer.Screen
            name="HomeDrawer"
            component={StackNavigator}
            options={({ route }) => {
              const focusedRouteName =
                getFocusedRouteNameFromRoute(route) ?? 'Splash';
              const disableDrawerSwipe =
                DRAWER_DISABLED_ROUTES.includes(focusedRouteName);

              return {
                swipeEnabled: !disableDrawerSwipe,
                drawerStyle: {},
                drawerItemStyle: { backgroundColor: '#fff' },
                drawerLabelStyle: { color: '#282828' },
                // drawerIcon: config => <Icon
                //   style={{ color: "#587f08", marginRight: -10, }}
                //   size={18}
                //   name={Platform.OS === 'android' ? 'home' : 'home'}></Icon>
              };
            }}
          />
        </Drawer.Navigator>
      </SafeAreaView>
    </>
  );
};

const mapStateToProps = (state: any) => {
  console.log('state', state);
  const { isLoggedIn } = state.auth;
  const { user } = state?.auth;
  const { messages, otherData } = state;
  return {
    isLoggedIn,
    messages,
    otherData,
    user,
  };
};

const mapDispatchToProps = (dispatch: any) => ({});
export default connect(mapStateToProps)(DrawerNavigator);
