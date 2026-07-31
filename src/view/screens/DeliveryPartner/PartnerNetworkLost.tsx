import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'

const LIGHT_BG = '#F4F5F0'

function PartnerNetworkLost({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const nextRoute: string = route.params.nextRoute
  const nextParams: object = route.params.nextParams
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1200))
      navigation.replace(nextRoute, nextParams)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" translucent={false} />
      <SafeAreaView style={st.redBanner} edges={['top']}>
        <Text style={st.redBannerText}>📵 No internet — trying to reconnect…</Text>
      </SafeAreaView>

      <View style={st.body}>
        <View style={st.iconCircle}>
          <Text style={st.icon}>📵</Text>
        </View>
        <Text style={st.title}>Connection lost</Text>
        <Text style={st.subtitle}>
          Your current order is saved. We'll sync delivery status as soon as you're back online.
        </Text>

        <View style={st.queuedCard}>
          <Text style={st.queuedIcon}>🕐</Text>
          <Text style={st.queuedText}>
            Order #{order.id}
            {'\n'}
            <Text style={st.queuedSubtext}>Delivery confirmation queued</Text>
          </Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={st.footer}>
        <TouchableOpacity style={st.retryBtn} onPress={handleRetry} disabled={retrying} activeOpacity={0.85}>
          {retrying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={st.retryBtnText}>⟳ Retry now</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },

  redBanner: { backgroundColor: '#C0392B' },
  redBannerText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 10,
  },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(192,57,43,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  icon: { fontSize: 34 },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 20, color: '#141414', marginBottom: 8 },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
  },

  queuedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0D6',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#F0CE85',
  },
  queuedIcon: { fontSize: 18 },
  queuedText: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: '#141414', lineHeight: 20 },
  queuedSubtext: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#B9791A' },

  footer: { paddingHorizontal: 20, paddingBottom: 8 },
  retryBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: '#FFFFFF' },
})

export default PartnerNetworkLost
