import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_FONT } from './partnerTheme'

const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

function PartnerGoOnlineGate({ navigation }: any) {
  const [batterySaverOff, setBatterySaverOff] = useState(false)

  const handleGoOnline = () => {
    navigation.navigate('PartnerHomeTabs', {
      screen: 'PartnerHomeTab',
      params: { goOnline: true },
    })
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_BG} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.headerRow}>
          <TouchableOpacity
            style={st.closeBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={st.title}>Before you go online</Text>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <Text style={st.subtitle}>
            We need a few things on to keep you safe and send you orders.
          </Text>

          <View style={st.checkCard}>
            <Text style={st.checkIconBox}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.checkTitle}>Location · Always</Text>
              <Text style={st.checkSubtitle}>Allowed</Text>
            </View>
            <Text style={st.checkGreenTick}>✓</Text>
          </View>

          <View style={st.checkCard}>
            <Text style={st.checkIconBox}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.checkTitle}>Notifications</Text>
              <Text style={st.checkSubtitle}>Allowed</Text>
            </View>
            <Text style={st.checkGreenTick}>✓</Text>
          </View>

          <View style={[st.checkCard, !batterySaverOff && st.checkCardWarning]}>
            <Text style={st.checkIconBox}>🔋</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.checkTitle}>
                {batterySaverOff ? 'Battery saver is OFF' : 'Battery saver is ON'}
              </Text>
              <Text style={st.checkSubtitle}>
                {batterySaverOff ? 'Allowed' : 'Turn off so GPS stays accurate'}
              </Text>
            </View>
            {batterySaverOff ? (
              <Text style={st.checkGreenTick}>✓</Text>
            ) : (
              <TouchableOpacity style={st.fixBtn} onPress={() => setBatterySaverOff(true)}>
                <Text style={st.fixBtnText}>Fix</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={st.checkCard}>
            <Text style={st.checkIconBox}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.checkTitle}>Phone battery</Text>
              <Text style={st.checkSubtitle}>64% · enough for a shift</Text>
            </View>
          </View>
        </ScrollView>

        <View style={st.footer}>
          <TouchableOpacity style={st.ctaBtn} onPress={handleGoOnline} activeOpacity={0.85}>
            <Text style={st.ctaBtnText}>
              {batterySaverOff ? 'Go online' : 'Turn off battery saver & go online'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },
  safe: { flex: 1 },

  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { fontSize: 14, color: TEXT_DARK },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 17, color: TEXT_DARK },

  body: { padding: 20, gap: 12 },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 8,
  },

  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  checkCardWarning: { borderColor: '#F0CE85', backgroundColor: '#FFFBF0' },
  checkIconBox: { fontSize: 20 },
  checkTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: TEXT_DARK },
  checkSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  checkGreenTick: { fontSize: 18, color: '#0C831F', fontFamily: PARTNER_FONT.bold },

  fixBtn: {
    backgroundColor: '#D98A1F',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  fixBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: '#FFFFFF' },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  ctaBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0C831F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: '#FFFFFF', paddingHorizontal: 12, textAlign: 'center' },
})

export default PartnerGoOnlineGate
