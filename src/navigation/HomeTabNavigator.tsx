import React from 'react';
import { Animated, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarProvider, useTabBar } from '../shared/context/TabBarContext';
import PremiumTabBar from './PremiumTabBar';

import homeContainer from '../view/screens/home';
import ProductListContainer from '../view/screens/ProductLIst';
import CartContainer from '../view/screens/Cart';
import ProfileContainer from '../view/screens/Profile';

const Tab = createBottomTabNavigator();

const HomeBottomTabNavigatorContent = () => {
  const { translateY } = useTabBar();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={props => (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            elevation: 100,
            transform: [{ translateY }],
          }}
        >
          <PremiumTabBar {...props} />
        </Animated.View>
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={homeContainer}
        options={{ tabBarLabel: 'Home' }}
      />

      <Tab.Screen
        name="ProductList"
        component={ProductListContainer}
        options={{ tabBarLabel: 'Categories' }}
      />

      <Tab.Screen
        name="Cart"
        component={CartContainer}
        options={{ tabBarLabel: 'Cart' }}
      />

      <Tab.Screen
        name="AccountTab"
        component={ProfileContainer}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
};

const HomeBottomTabNavigator = () => (
  <TabBarProvider>
    <HomeBottomTabNavigatorContent />
  </TabBarProvider>
);

export default HomeBottomTabNavigator;
