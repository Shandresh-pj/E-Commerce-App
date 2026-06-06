import React, { useState } from 'react';
import { NavigationContainer, } from '@react-navigation/native';
import 'react-native-gesture-handler'
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from "./constants/screen"
import DrawerNavigator from "./navigation/DrawerNavigator"
import { Provider } from 'react-redux'
import store from "./shared/redux/store"
import Toast from 'react-native-root-toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './navigation/RootNavigation';
import useInAppUpdate from './shared/services/useInAppUpdate';



export default function App(props: any) {

  useInAppUpdate();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <NavigationContainer ref={navigationRef}>
            <Toast />
            <DrawerNavigator />
          </NavigationContainer>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>

  );
}
