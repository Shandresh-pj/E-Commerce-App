import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import PartnerTabBar from './PartnerTabBar'
import PartnerHome from './PartnerHome'
import PartnerEarnings from './PartnerEarnings'
import PartnerOrders from './PartnerOrders'
import PartnerStats from './PartnerStats'
import PartnerProfile from './PartnerProfile'

const Tab = createBottomTabNavigator()

const PartnerTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="PartnerHomeTab"
    tabBar={props => <PartnerTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="PartnerHomeTab" component={PartnerHome} />
    <Tab.Screen name="PartnerEarnings" component={PartnerEarnings} />
    <Tab.Screen name="PartnerOrders" component={PartnerOrders} />
    <Tab.Screen name="PartnerStats" component={PartnerStats} />
    <Tab.Screen name="PartnerProfile" component={PartnerProfile} />
  </Tab.Navigator>
)

export default PartnerTabNavigator
