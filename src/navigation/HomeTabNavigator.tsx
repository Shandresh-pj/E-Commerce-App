import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Animatable from 'react-native-animatable';
import homeContainer from '../view/screens/home';
import HomeIcon from '../view/assets/images/tabbar/Home.svg';
import HomeActive from '../view/assets/images/tabbar/HomeActive.svg';
import ShopIcon from '../view/assets/images/tabbar/Shop.svg';
import ShopActive from '../view/assets/images/tabbar/ShopActive.svg';
import CartIcon from '../view/assets/images/tabbar/Cart.svg';
import CartActive from '../view/assets/images/tabbar/CartActive.svg';
import {
  Animated,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { TabBarProvider, useTabBar } from '../shared/context/TabBarContext';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CartContainer from '../view/screens/Cart';
import ProductListContainer from '../view/screens/ProductLIst';

const Tab = createBottomTabNavigator();

const HomeBottomTabNavigatorContent = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { translateY } = useTabBar();

  useEffect(() => {
    // Fade animation with delay
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 500); // ⏱ starts after 500ms

    // Scale animation with delay
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 1000); // ⏱ starts after 1s
  }, []);

  return (
    <Tab.Navigator
      initialRouteName={'HomeTab'}
      tabBar={props => (
        <Animated.View
          style={[styles.tabBarContainer, { transform: [{ translateY }] }]}
        >
          <BottomTabBar {...props} />
        </Animated.View>
      )}
      screenOptions={({ route }) => ({
        unmountOnBlur: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#818181',

        tabBarBackground: () => (
          <>
          </>
        ),

        tabBarStyle: {
          backgroundColor: '#2a2c40',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height: (isLandscape ? 60 : 70) + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: isLandscape ? 5 : 10,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          borderWidth: 1,
          borderColor: '#2a2c40',
          //overflow: "hidden"
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={homeContainer}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Animatable.View
                animation="fadeInUp"
                useNativeDriver={true}
                style={{
                  marginBottom: isLandscape ? 5 : 10,
                }}
              >
                <HomeActive />
              </Animatable.View>
            ) : (
              <HomeIcon />
            ),
        }}
      />


      <Tab.Screen
        name="ProductList"
        component={ProductListContainer}
        options={{
          tabBarLabel: 'Shop',
          headerShown: false,
          // tabBarStyle:{
          //   display:"none"
          // },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Animatable.View
                animation="fadeInUp"
                delay={5000}
                useNativeDriver={true}
                style={{
                  marginBottom: isLandscape ? 5 : 15,
                }}
              >
                <ShopActive />
              </Animatable.View>
            ) : (
              <ShopIcon />
            ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartContainer}
        options={{
          tabBarLabel: 'Cart',
          headerShown: false,
          tabBarStyle: {
            display: 'none',
          },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Animatable.View
                animation="fadeInUp"
                delay={5000}
                useNativeDriver={true}
                style={{
                  marginBottom: isLandscape ? 5 : 15,
                }}
              >
                <CartActive />
              </Animatable.View>
            ) : (
              <CartIcon />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

const HomeBottomTabNavigator = () => (
  <TabBarProvider>
    <HomeBottomTabNavigatorContent />
  </TabBarProvider>
);

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
});

export default HomeBottomTabNavigator;
