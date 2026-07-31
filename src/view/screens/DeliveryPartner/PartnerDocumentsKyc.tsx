import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { DOCUMENTS_KYC, KycDocument } from './partnerMockData'

function PartnerDocumentsKyc({ navigation }: any) {
  const handleAction = (doc: KycDocument) => {
    if (doc.action === 'licence') navigation.navigate('PartnerDocumentUpload')
    else if (doc.action === 'vehicle') navigation.navigate('PartnerVehicleDetails')
    else Alert.alert(doc.name, `${doc.detail} · ${doc.status}`)
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
          <View style={{ flex: 1 }}>
            <Text style={st.title}>Documents & KYC</Text>
            <Text style={st.subtitle}>All verified · keep them up to date</Text>
          </View>
          <View style={st.activePill}>
            <Text style={st.activePillText}>Active</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {DOCUMENTS_KYC.map(doc => {
            const needsRenewal = doc.status === 'Renew'
            return (
              <View key={doc.id} style={[st.docRow, needsRenewal && st.docRowWarning]}>
                <Text style={st.docEmoji}>{doc.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={st.docName}>{doc.name}</Text>
                  <Text style={[st.docDetail, needsRenewal && st.docDetailWarning]}>{doc.detail}</Text>
                </View>
                {needsRenewal ? (
                  <TouchableOpacity style={st.renewPill} onPress={() => handleAction(doc)}>
                    <Text style={st.renewPillText}>Renew</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleAction(doc)}>
                    <Text style={st.viewLink}>Verified · View</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 17, color: '#FFFFFF' },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 17, color: '#FFFFFF' },
  subtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted, marginTop: 2 },
  activePill: {
    backgroundColor: '#E4F6E6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activePillText: { fontFamily: PARTNER_FONT.bold, fontSize: 11.5, color: '#0C831F' },

  body: { padding: 20, gap: 12 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  docRowWarning: { borderColor: '#D98A1F', backgroundColor: 'rgba(217,138,31,0.08)' },
  docEmoji: { fontSize: 18 },
  docName: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF', marginBottom: 2 },
  docDetail: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted },
  docDetailWarning: { color: '#D98A1F' },
  viewLink: { fontFamily: PARTNER_FONT.bold, fontSize: 12, color: '#0C831F' },
  renewPill: {
    backgroundColor: '#D98A1F',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  renewPillText: { fontFamily: PARTNER_FONT.bold, fontSize: 12, color: '#FFFFFF' },
})

export default PartnerDocumentsKyc
