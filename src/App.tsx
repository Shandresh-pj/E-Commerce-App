import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import 'react-native-gesture-handler'
import StackNavigator from './navigation/StackNavigator'
import { Provider } from 'react-redux'
import store from './shared/redux/store'
import Toast from 'react-native-root-toast'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { navigationRef } from './navigation/RootNavigation'
import useInAppUpdate from './shared/services/useInAppUpdate'
import { StatusBar } from 'react-native'

export default function App() {
  useInAppUpdate()

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#F4F5F0"
            translucent={false}
          />
          <SafeAreaView edges={['left', 'right', 'top']} style={{ flex: 1, backgroundColor: '#F4F5F0' }}>
            <NavigationContainer ref={navigationRef}>
              <Toast />
              <StackNavigator />
            </NavigationContainer>
          </SafeAreaView>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
