import React from 'react';
import { Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarProvider, useTabBar } from '../shared/context/TabBarContext';
import PremiumTabBar from './PremiumTabBar';

import homeContainer from '../view/screens/home';
import CategoryScreen from '../view/screens/Categories/CategoryScreen';
import CartContainer from '../view/screens/Cart';
import ProfileContainer from '../view/screens/Account';

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
        component={CategoryScreen}
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
