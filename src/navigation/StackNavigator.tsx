import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LOGIN_SUCCESS } from '../shared/redux/constants/types';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAsyncData } from '../shared/utils/storage';
import {
  TransitionSpecs,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import styles from '../view/assets/styles/styles';
import splashContainer from '../view/screens/splash';
import loginContainer from '../view/screens/login';
import LocationPermissionContainer from '../view/screens/LocationPermission';
import ProductListContainer from '../view/screens/ProductLIst';
import ProfileContainer from '../view/screens/Account';
import HomeBottomTabNavigator from './HomeTabNavigator';
import inviteContainer from '../view/screens/Invite';
import myordersContainer from '../view/screens/Myorders';
import ViewOrderScreen from '../view/screens/Myorders/Vieworders';
import EditProfileScreen from '../view/screens/Account/EditProfile';
import WishListContainer from '../view/screens/WishList';
import CartContainer from '../view/screens/Cart';
import PlaceOrderScreen from '../view/screens/PlaceOrder/PlaceOrder';
import ContactUsContainer from '../view/screens/ContactUs';
import AddressScreen from '../view/screens/Address/AddressScreen';
import CategoryScreen from '../view/screens/Categories/CategoryScreen';
import CategoryProductScreen from '../view/screens/Categories/CategoryProductScreen';


const Stack = createStackNavigator();


const MainStackNavigator = (props: any) => {
  const { dispatch, isLoggedIn } = props;
  const [initialRouteName, setInitialRouteName] = useState('Splash');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    getInitialRouteName();
    setIsLoading(false);
  }, []);
  const getInitialRouteName = async () => {
    const intropage = await AsyncStorage.getItem('intropage');
    const user = await AsyncStorage.getItem('user');
    const parsedUser = await JSON.parse(user || '{}');
    const hasUser = (await Object.keys(parsedUser).length) !== 0;

    let deviceSettings = await getAsyncData('deviceSettings');

    console.log(
      '*********************************************************hasUser================',
      hasUser,
      user,
      intropage,
    );

    if (hasUser) {
      await setInitialRouteName('Home');
      console.log(
        '*********************************************************login================',
        parsedUser,
      );
      AsyncStorage.setItem('user', JSON.stringify(parsedUser));
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: parsedUser, noRedirect: true },
      });
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } else {

      await setInitialRouteName('Splash');
      console.log(
        '*********************************************************logout================',
        parsedUser,
      );
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };
  //}
  if (isLoading) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          hidden={false}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView edges={['left', 'right']} style={styles.container}>
          <ImageBackground
            source={require("../view/assets/images/login-bg.jpg")}
            imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
            style={styles.bakcgroundImage}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color='#fff' />
            </View>
          </ImageBackground>
        </SafeAreaView>
      </>
    );
  }
  return (
    <Stack.Navigator
      //screenOptions={screenOptionStyle}
      //initialRouteName={initialRouteName}
      initialRouteName={'Splash'}
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

        <Stack.Screen
          name="ProductList"
          component={ProductListContainer}
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
          name="Invite"
          component={inviteContainer}
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
        name="CategoryProducts"
        component={CategoryProductScreen}
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
  //console.log('state', state)
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

export const UnAuthrizedStack = (props: any) => {
  return (
    <Stack.Navigator
      initialRouteName={'Splash'}
    >
      {/* {!isLoggedIn ? */}

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
