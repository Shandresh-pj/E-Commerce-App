import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LOGIN_SUCCESS } from '../shared/redux/constants/types';
import { connect } from 'react-redux';
import {
  ActivityIndicator,
  StatusBar,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAsyncData } from '../shared/utils/storage';
import {
  TransitionSpecs,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import splashContainer from '../view/screens/splash';
import OnboardingScreen from '../view/screens/onboarding/OnboardingScreen';
import loginContainer from '../view/screens/login';
import LocationPermissionContainer from '../view/screens/LocationPermission';
import ProfileContainer from '../view/screens/Account';
import HomeBottomTabNavigator from './HomeTabNavigator';
import myordersContainer from '../view/screens/Myorders';
import ViewOrderScreen from '../view/screens/Myorders/Vieworders';
import EditProfileScreen from '../view/screens/Account/EditProfile';
import WishListContainer from '../view/screens/WishList';
import CartContainer from '../view/screens/Cart';
import PlaceOrderScreen from '../view/screens/PlaceOrder/PlaceOrder';
import ContactUsContainer from '../view/screens/ContactUs';
import AddressScreen from '../view/screens/Address/AddressScreen';
import CategoryScreen from '../view/screens/Categories/CategoryScreen';
import SearchScreen from '../view/screens/Search/SearchScreen';
import OrderTrackingScreen from '../view/screens/OrderTracking/OrderTracking';
import PaymentMethodsScreen from '../view/screens/Payment/PaymentMethods';
import CouponsScreen from '../view/screens/Coupons/Coupons';
import NotificationsScreen from '../view/screens/Notifications/Notifications';
import LanguageScreen from '../view/screens/Language/Language';
import MapViewScreen from '../view/screens/Map';
import WalletScreen from '../view/screens/Wallet/WalletScreen';
import LegalScreen from '../view/screens/Legal/LegalScreen';
import AppLogo from '../view/elements/AppLogo';

const Stack = createStackNavigator();



const MainStackNavigator = (props: any) => {
  const { dispatch, isLoggedIn } = props;
  const [initialRouteName, setInitialRouteName] = useState('Splash');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    getInitialRouteName();
  }, []);
  const getInitialRouteName = async () => {
    try {
      let parsedUser = await getAsyncData('user');
      // Fallback in case raw key 'user' was used in previous sessions
      if (!parsedUser || (typeof parsedUser === 'object' && Object.keys(parsedUser).length === 0)) {
        const rawUser = await AsyncStorage.getItem('user');
        if (rawUser) {
          try {
            parsedUser = JSON.parse(rawUser);
          } catch (_) {}
        }
      }

      const hasUser = parsedUser && typeof parsedUser === 'object' && Object.keys(parsedUser).length > 0;

      console.log(
        '*********************************************************hasUser================',
        hasUser,
        parsedUser,
      );

      if (hasUser) {
        setInitialRouteName('Home');
        dispatch({
          type: LOGIN_SUCCESS,
          payload: { user: parsedUser, noRedirect: true },
        });
      } else {
        setInitialRouteName('Splash');
      }
    } catch (e) {
      console.log('Auth check error:', e);
      setInitialRouteName('Splash');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1200);
    }
  };
  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0B1329" translucent={false} />
        <View style={loadingStyles.container}>
          <AppLogo size="lg" showText={true} theme="yellow" animated={true} />
          <ActivityIndicator size="large" color="#FBBF24" style={{ marginTop: 24 }} />
        </View>
      </>
    );
  }
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
    >
      <>
        <Stack.Screen
          name="Splash"
          component={splashContainer}
          options={{
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.FadeInFromBottomAndroidSpec,
              close: TransitionSpecs.FadeOutToBottomAndroidSpec,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.FadeInFromBottomAndroidSpec,
              close: TransitionSpecs.FadeOutToBottomAndroidSpec,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="Login"
          component={loginContainer}
          options={{
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.FadeInFromBottomAndroidSpec,
              close: TransitionSpecs.FadeOutToBottomAndroidSpec,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen
          name="LocationPermission"
          component={LocationPermissionContainer}
          options={{
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.FadeInFromBottomAndroidSpec,
              close: TransitionSpecs.FadeOutToBottomAndroidSpec,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />


        <Stack.Screen
          name="Home"
          component={HomeBottomTabNavigator}
          options={({ navigation }) => ({
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.FadeInFromBottomAndroidSpec,
              close: TransitionSpecs.FadeOutToBottomAndroidSpec,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          })}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileContainer}
          options={({ navigation }) => ({
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.FadeInFromBottomAndroidSpec,
              close: TransitionSpecs.FadeOutToBottomAndroidSpec,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          })}
        />

      </>

      <Stack.Screen
        name="MyOrders"
        component={myordersContainer}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="ViewOrder"
        component={ViewOrderScreen}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="WishList"
        component={WishListContainer}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="Cart"
        component={CartContainer}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="PlaceOrder"
        component={PlaceOrderScreen}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="ContactUs"
        component={ContactUsContainer}
        options={({ navigation }) => ({
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="Addresses"
        component={AddressScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="Categories"
        component={CategoryScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />


      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="Coupons"
        component={CouponsScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="MapView"
        component={MapViewScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

    </Stack.Navigator>
  );
};

const mapStateToProps = (state: any) => {
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

const mapDispatchToProps = (dispatch: any) => ({
  dispatch,
});
export default connect(mapStateToProps, mapDispatchToProps)(MainStackNavigator);

const loadingStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1329', justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 52 },
})

export const UnAuthrizedStack = (props: any) => {
  return (
    <Stack.Navigator
      initialRouteName={'Splash'}
    >

      <Stack.Screen
        name="Splash"
        component={splashContainer}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Login"
        component={loginContainer}
        options={{
          headerShown: false,
          transitionSpec: {
            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
            close: TransitionSpecs.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};
