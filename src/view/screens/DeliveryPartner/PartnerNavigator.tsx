import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createStackNavigator,
  TransitionSpecs,
  CardStyleInterpolators,
} from '@react-navigation/stack'
import PartnerLanguageSelect, { PARTNER_LANGUAGE_KEY } from './PartnerLanguageSelect'
import PartnerSplash from './PartnerSplash'
import PartnerLogin from './PartnerLogin'
import PartnerOtpVerification from './PartnerOtpVerification'
import PartnerLocationPriming from './PartnerLocationPriming'
import PartnerOnboardingChecklist from './PartnerOnboardingChecklist'
import PartnerPersonalDetails from './PartnerPersonalDetails'
import PartnerDocumentUpload from './PartnerDocumentUpload'
import PartnerVehicleDetails from './PartnerVehicleDetails'
import PartnerBankDetails from './PartnerBankDetails'
import PartnerApplicationReview from './PartnerApplicationReview'
import PartnerTabNavigator from './PartnerTabNavigator'
import PartnerOrderRequest from './PartnerOrderRequest'
import PartnerPickupAtStore from './PartnerPickupAtStore'
import PartnerNavigateToCustomer from './PartnerNavigateToCustomer'
import PartnerDeliverToCustomer from './PartnerDeliverToCustomer'
import PartnerOrderComplete from './PartnerOrderComplete'
import PartnerWallet from './PartnerWallet'
import PartnerGoOnlineGate from './PartnerGoOnlineGate'
import PartnerNetworkLost from './PartnerNetworkLost'
import PartnerUnableToDeliver from './PartnerUnableToDeliver'
import PartnerNotifications from './PartnerNotifications'
import PartnerPickupOtpEntry from './PartnerPickupOtpEntry'
import PartnerCodDeposit from './PartnerCodDeposit'
import PartnerDocumentsKyc from './PartnerDocumentsKyc'
import PartnerVehicleAndBank from './PartnerVehicleAndBank'
import { PartnerOnboardingProvider } from './PartnerOnboardingContext'
import { PartnerEarningsProvider } from './PartnerEarningsContext'
import { PartnerCodProvider } from './PartnerCodContext'
import { PARTNER_COLOR } from './partnerTheme'

const Stack = createStackNavigator()

const screenOptions = {
  headerShown: false,
  transitionSpec: {
    open: TransitionSpecs.FadeInFromBottomAndroidSpec,
    close: TransitionSpecs.FadeOutToBottomAndroidSpec,
  },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
}

const PartnerNavigator = () => {
  const [initialRouteName, setInitialRouteName] = useState<string | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(PARTNER_LANGUAGE_KEY).then(value => {
      setInitialRouteName(value ? 'PartnerSplash' : 'PartnerLanguage')
    })
  }, [])

  if (!initialRouteName) {
    return <View style={{ flex: 1, backgroundColor: PARTNER_COLOR.bg }} />
  }

  return (
    <PartnerOnboardingProvider>
      <PartnerEarningsProvider>
        <PartnerCodProvider>
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={screenOptions}
          >
            <Stack.Screen name="PartnerLanguage" component={PartnerLanguageSelect} />
            <Stack.Screen name="PartnerSplash" component={PartnerSplash} />
            <Stack.Screen name="PartnerLogin" component={PartnerLogin} />
            <Stack.Screen name="PartnerOtp" component={PartnerOtpVerification} />
            <Stack.Screen name="PartnerLocationPriming" component={PartnerLocationPriming} />
            <Stack.Screen name="PartnerOnboarding" component={PartnerOnboardingChecklist} />
            <Stack.Screen name="PartnerPersonalDetails" component={PartnerPersonalDetails} />
            <Stack.Screen name="PartnerDocumentUpload" component={PartnerDocumentUpload} />
            <Stack.Screen name="PartnerVehicleDetails" component={PartnerVehicleDetails} />
            <Stack.Screen name="PartnerBankDetails" component={PartnerBankDetails} />
            <Stack.Screen name="PartnerApplicationReview" component={PartnerApplicationReview} />
            <Stack.Screen name="PartnerHomeTabs" component={PartnerTabNavigator} />
            <Stack.Screen name="PartnerGoOnlineGate" component={PartnerGoOnlineGate} />
            <Stack.Screen name="PartnerOrderRequest" component={PartnerOrderRequest} />
            <Stack.Screen name="PartnerPickup" component={PartnerPickupAtStore} />
            <Stack.Screen name="PartnerPickupOtpEntry" component={PartnerPickupOtpEntry} />
            <Stack.Screen name="PartnerNavigateToCustomer" component={PartnerNavigateToCustomer} />
            <Stack.Screen name="PartnerDeliverToCustomer" component={PartnerDeliverToCustomer} />
            <Stack.Screen name="PartnerUnableToDeliver" component={PartnerUnableToDeliver} />
            <Stack.Screen name="PartnerNetworkLost" component={PartnerNetworkLost} />
            <Stack.Screen name="PartnerOrderComplete" component={PartnerOrderComplete} />
            <Stack.Screen name="PartnerWallet" component={PartnerWallet} />
            <Stack.Screen name="PartnerCodDeposit" component={PartnerCodDeposit} />
            <Stack.Screen name="PartnerNotifications" component={PartnerNotifications} />
            <Stack.Screen name="PartnerDocumentsKyc" component={PartnerDocumentsKyc} />
            <Stack.Screen name="PartnerVehicleAndBank" component={PartnerVehicleAndBank} />
          </Stack.Navigator>
        </PartnerCodProvider>
      </PartnerEarningsProvider>
    </PartnerOnboardingProvider>
  )
}

export default PartnerNavigator
