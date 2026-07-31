import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

function PartnerVehicleAndBank({ navigation }: any) {
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
            <Text style={st.title}>Vehicle & bank</Text>
            <Text style={st.subtitle}>Your ride and payout details</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <Text style={st.sectionLabel}>VEHICLE</Text>
          <View style={st.card}>
            <View style={st.cardTopRow}>
              <View style={st.vehicleIconBox}>
                <Text style={st.vehicleEmoji}>🏍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.cardTitle}>Honda Activa 6G</Text>
                <Text style={st.cardSubtitle}>2-wheeler · petrol</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('PartnerVehicleDetails')}>
                <Text style={st.link}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={st.divider} />
            <View style={st.detailRow}>
              <View style={{ flex: 1 }}>
                <Text style={st.detailLabel}>NUMBER PLATE</Text>
                <Text style={st.detailValue}>KA 05 MJ 4821</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.detailLabel}>INSURANCE</Text>
                <Text style={st.detailValue}>Valid · 03/27</Text>
              </View>
            </View>
          </View>

          <Text style={st.sectionLabel}>PAYOUT ACCOUNT</Text>
          <View style={st.card}>
            <View style={st.cardTopRow}>
              <View style={st.bankIconBox}>
                <Text style={st.bankEmoji}>🏦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.cardTitle}>HDFC Bank</Text>
                <Text style={st.cardSubtitle}>A/C ••1190 · default</Text>
              </View>
              <View style={st.verifiedPill}>
                <Text style={st.verifiedPillText}>Verified</Text>
              </View>
            </View>
            <View style={st.divider} />
            <View style={st.cardTopRow}>
              <Text style={st.upiText}>UPI · rahul@oksbi</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => navigation.navigate('PartnerBankDetails')}>
                <Text style={st.link}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={st.addAccountBtn}
            onPress={() => Alert.alert('Add account', 'Adding a second payout account is coming soon.')}
            activeOpacity={0.8}
          >
            <Text style={st.addAccountText}>+ Add another account</Text>
          </TouchableOpacity>
        </ScrollView>
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
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: '#FFFFFF' },
  subtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted, marginTop: 1 },

  body: { padding: 20, gap: 10 },
  sectionLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },

  card: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    marginBottom: 8,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: PARTNER_COLOR.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: { fontSize: 19 },
  bankIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EBE4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankEmoji: { fontSize: 19 },
  cardTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#FFFFFF' },
  cardSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted, marginTop: 2 },
  link: { fontFamily: PARTNER_FONT.bold, fontSize: 13, color: PARTNER_COLOR.lime },

  divider: { height: 1, backgroundColor: PARTNER_COLOR.border, marginVertical: 14 },
  detailRow: { flexDirection: 'row' },
  detailLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailValue: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF' },

  verifiedPill: { backgroundColor: '#E4F6E6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  verifiedPillText: { fontFamily: PARTNER_FONT.bold, fontSize: 11.5, color: '#0C831F' },
  upiText: { fontFamily: PARTNER_FONT.medium, fontSize: 13.5, color: '#FFFFFF' },

  addAccountBtn: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addAccountText: { fontFamily: PARTNER_FONT.bold, fontSize: 13.5, color: PARTNER_COLOR.textSecondary },
})

export default PartnerVehicleAndBank
