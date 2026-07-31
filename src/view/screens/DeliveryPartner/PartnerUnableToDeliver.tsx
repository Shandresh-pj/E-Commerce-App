import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PartnerOrder } from './mockOrder'

const REASONS = [
  'Customer not reachable',
  'Wrong / incomplete address',
  'Customer refused order',
  "Can't reach location safely",
]

function PartnerUnableToDeliver({ navigation, route }: any) {
  const order: PartnerOrder = route.params.order
  const [reason, setReason] = useState(REASONS[0])

  const maskedPhone = order.drops[route.params.dropIndex || 0]?.customerPhone.replace(/\d(?=\d{2})/g, '•')

  const handleCall = () => Linking.openURL(`tel:${order.drops[route.params.dropIndex || 0]?.customerPhone}`)

  const handleReportAndReturn = () => {
    Alert.alert(
      'Report & return',
      `This will cancel order #${order.id} and mark it for return. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            const stackNav = navigation.getParent()
            stackNav?.reset({ index: 0, routes: [{ name: 'PartnerHomeTabs' }] })
          },
        },
      ],
    )
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.headerRow}>
          <TouchableOpacity
            style={st.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={st.stepLabel}>Order #{order.id} · handover</Text>
            <Text style={st.title}>Can't complete delivery?</Text>
          </View>
        </View>

        <View style={st.body}>
          <TouchableOpacity style={st.callCard} onPress={handleCall} activeOpacity={0.8}>
            <View style={st.callIconBox}>
              <Text style={st.callIcon}>📞</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.callTitle}>Call customer</Text>
              <Text style={st.callSubtitle}>2 attempts made · {maskedPhone}</Text>
            </View>
          </TouchableOpacity>

          <Text style={st.sectionLabel}>WHAT HAPPENED?</Text>
          <View style={st.reasonsCard}>
            {REASONS.map((r, i) => (
              <TouchableOpacity
                key={r}
                style={[st.reasonRow, i === REASONS.length - 1 && st.reasonRowLast]}
                onPress={() => setReason(r)}
                activeOpacity={0.8}
              >
                <View style={[st.radio, reason === r && st.radioActive]}>
                  {reason === r && <View style={st.radioDot} />}
                </View>
                <Text style={st.reasonText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {order.paymentType === 'COD' && (
            <View style={st.warningBox}>
              <Text style={st.warningText}>
                ⓘ You may be asked to return COD items to the store. Support will confirm next steps.
              </Text>
            </View>
          )}
        </View>

        <View style={st.footer}>
          <TouchableOpacity style={st.waitBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={st.waitBtnText}>Wait 5 min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.reportBtn} onPress={handleReportAndReturn} activeOpacity={0.85}>
            <Text style={st.reportBtnText}>Report & return</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },

  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 17, color: '#FFFFFF' },
  stepLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: '#FFFFFF', marginTop: 1 },

  body: { padding: 20, gap: 16, flex: 1 },

  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  callIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PARTNER_COLOR.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 17 },
  callTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#FFFFFF' },
  callSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted, marginTop: 2 },

  sectionLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 0.8,
  },
  reasonsCard: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: PARTNER_COLOR.border,
  },
  reasonRowLast: { borderBottomWidth: 0 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PARTNER_COLOR.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#0C831F' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0C831F' },
  reasonText: { fontFamily: PARTNER_FONT.medium, fontSize: 14, color: '#FFFFFF' },

  warningBox: {
    backgroundColor: 'rgba(192,57,43,0.12)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.35)',
  },
  warningText: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#FF9B9B', lineHeight: 18 },

  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  waitBtn: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  waitBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },
  reportBtn: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },
})

export default PartnerUnableToDeliver
