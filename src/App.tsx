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
import { StatusBar, View } from 'react-native'
import { LIQUID_GLASS_THEME } from './constants/theme'
import { ThemeProvider, useTheme } from './shared/context/ThemeContext'

/** Inner shell — consumes ThemeContext after it is mounted */
function AppShell() {
  const { colors } = useTheme()
  return (
    <>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.statusBarBg}
        translucent={false}
      />
      <SafeAreaView
        edges={['left', 'right']}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <NavigationContainer ref={navigationRef}>
          <Toast />
          <StackNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </>
  )
}

export default function App() {
  useInAppUpdate()

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
