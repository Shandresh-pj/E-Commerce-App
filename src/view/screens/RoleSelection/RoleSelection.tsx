import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function RoleSelection({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const goCustomer = () => navigation.navigate('Splash')
  const goPartner = () => navigation.navigate('PartnerApp')

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F0" translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.brandBlock}>
          <View style={st.logoBox}>
            <Text style={st.logoEmoji}>⚡</Text>
          </View>
          <Text style={st.brandName}>Future Believe</Text>
          <Text style={st.tagline}>How would you like to continue?</Text>
        </View>

        <Animated.View
          style={[st.cards, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity style={st.customerCard} onPress={goCustomer} activeOpacity={0.85}>
            <View style={[st.iconBox, st.customerIconBox]}>
              <Text style={st.icon}>🛍️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.customerTitle}>I'm a Customer</Text>
              <Text style={st.customerSubtitle}>
                Order groceries & essentials, delivered fast
              </Text>
            </View>
            <Text style={st.customerChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.partnerCard} onPress={goPartner} activeOpacity={0.85}>
            <View style={[st.iconBox, st.partnerIconBox]}>
              <Text style={st.icon}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.partnerTitle}>I'm a Delivery Partner</Text>
              <Text style={st.partnerSubtitle}>
                Deliver orders and earn on your own schedule
              </Text>
            </View>
            <Text style={st.partnerChevron}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={st.footerText}>You can switch anytime by relaunching the app</Text>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F0' },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },

  brandBlock: { alignItems: 'center', marginBottom: 48 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  logoEmoji: { fontSize: 34, lineHeight: 40 },
  brandName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#141414',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8A8A8A',
  },

  cards: { gap: 14 },

  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerIconBox: { backgroundColor: '#FFF4D6' },
  partnerIconBox: { backgroundColor: '#C6FF4D' },
  icon: { fontSize: 22 },

  customerTitle: { fontFamily: 'DMSans-Bold', fontSize: 15.5, color: '#141414', marginBottom: 3 },
  customerSubtitle: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: '#8A8A8A', lineHeight: 18 },
  customerChevron: { fontSize: 22, color: '#C4C4C4' },

  partnerTitle: { fontFamily: 'DMSans-Bold', fontSize: 15.5, color: '#FFFFFF', marginBottom: 3 },
  partnerSubtitle: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: '#9a9a9a', lineHeight: 18 },
  partnerChevron: { fontSize: 22, color: '#6B7076' },

  footerText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11.5,
    color: '#B5B5B0',
    textAlign: 'center',
    marginTop: 36,
  },
})

export default RoleSelection
