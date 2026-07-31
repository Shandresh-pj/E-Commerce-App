import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PARTNER_PROFILE } from './partnerMockData'

const LANGUAGES = ['English', 'हिंदी', 'தமிழ்', 'తెలుగు']

const MENU_ITEMS = [
  { emoji: '📄', label: 'Documents & KYC', action: 'kyc' },
  { emoji: '🏍', label: 'Vehicle & bank', action: 'vehicleBank' },
  { emoji: '🌐', label: 'Language', action: 'language', trailing: true },
  { emoji: '💬', label: 'Help centre & FAQs', action: 'help' },
] as const

function PartnerProfile({ navigation }: any) {
  const [language, setLanguage] = useState('English')
  const [langModalVisible, setLangModalVisible] = useState(false)

  const handleMenuPress = (action: string) => {
    if (action === 'kyc') navigation.navigate('PartnerDocumentsKyc')
    else if (action === 'vehicleBank') navigation.navigate('PartnerVehicleAndBank')
    else if (action === 'language') setLangModalVisible(true)
    else Alert.alert('Help centre', 'FAQs and guides will show up here.')
  }

  const handleChatSupport = () => Alert.alert('Support', 'Reach us at partners@dash.app · 24x7')

  const handleSos = () => {
    Alert.alert(
      'Emergency SOS',
      'This will alert DASH safety and share your live location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Alert safety team',
          style: 'destructive',
          onPress: () => Alert.alert('Help is on the way', 'DASH safety has been notified.'),
        },
      ],
    )
  }

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          const rootNavigation = navigation.getParent()?.getParent()
          rootNavigation?.reset({ index: 0, routes: [{ name: 'RoleSelection' }] })
        },
      },
    ])
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe}>
        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <View style={st.header}>
            <View style={st.avatarCircle}>
              <Text style={st.avatarText}>{PARTNER_PROFILE.name[0]}</Text>
            </View>
            <Text style={st.name}>{PARTNER_PROFILE.name}</Text>
            <Text style={st.subLabel}>
              Partner ID {PARTNER_PROFILE.partnerId} · {PARTNER_PROFILE.vehicle}
            </Text>
            <View style={st.ratingPill}>
              <Text style={st.ratingPillText}>
                ★ {PARTNER_PROFILE.rating} · {PARTNER_PROFILE.tier}
              </Text>
            </View>
          </View>

          <View style={st.menuList}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[st.menuItem, i === MENU_ITEMS.length - 1 && st.menuItemLast]}
                onPress={() => handleMenuPress(item.action)}
                activeOpacity={0.75}
              >
                <Text style={st.menuEmoji}>{item.emoji}</Text>
                <Text style={st.menuLabel}>{item.label}</Text>
                {'trailing' in item && item.trailing ? (
                  <Text style={st.menuTrailingValue}>{language}</Text>
                ) : null}
                <Text style={st.menuChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={st.supportRow} onPress={handleChatSupport} activeOpacity={0.8}>
            <Text style={st.supportEmoji}>💬</Text>
            <Text style={st.supportLabel}>Chat with support 24x7</Text>
            <Text style={st.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.sosCard} onPress={handleSos} activeOpacity={0.85}>
            <Text style={st.sosIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.sosTitle}>Emergency SOS</Text>
              <Text style={st.sosSubtitle}>Alert DASH safety & share live location</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={st.logoutWrap} onPress={handleLogout}>
            <Text style={st.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={st.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={st.langSheet}>
            <Text style={st.langSheetTitle}>Choose language</Text>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l}
                style={st.langOption}
                onPress={() => {
                  setLanguage(l)
                  setLangModalVisible(false)
                }}
              >
                <Text style={[st.langOptionText, l === language && st.langOptionTextActive]}>{l}</Text>
                {l === language && <Text style={st.langCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },
  body: { padding: 20, paddingBottom: 40 },

  header: { alignItems: 'center', paddingVertical: 20, marginBottom: 8 },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontFamily: PARTNER_FONT.bold, fontSize: 28, color: '#141414' },
  name: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: PARTNER_COLOR.textPrimary },
  subLabel: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12.5,
    color: PARTNER_COLOR.textSecondary,
    marginTop: 3,
  },
  ratingPill: {
    marginTop: 10,
    backgroundColor: PARTNER_COLOR.limeSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  ratingPillText: { fontFamily: PARTNER_FONT.bold, fontSize: 12, color: PARTNER_COLOR.lime },

  menuList: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: PARTNER_COLOR.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontFamily: PARTNER_FONT.medium, fontSize: 14.5, color: PARTNER_COLOR.textPrimary },
  menuTrailingValue: { fontFamily: PARTNER_FONT.regular, fontSize: 13, color: PARTNER_COLOR.textMuted },
  menuChevron: { fontSize: 20, color: PARTNER_COLOR.textMuted },

  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#2E5FD1',
    marginBottom: 14,
  },
  supportEmoji: { fontSize: 18 },
  supportLabel: { flex: 1, fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#6699FF' },

  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192,57,43,0.12)',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.35)',
    marginBottom: 20,
  },
  sosIcon: { fontSize: 20 },
  sosTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#FF7F7F' },
  sosSubtitle: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: 'rgba(255,127,127,0.8)', marginTop: 2 },

  logoutWrap: { alignItems: 'center', paddingVertical: 8 },
  logoutText: { fontFamily: PARTNER_FONT.medium, fontSize: 14, color: PARTNER_COLOR.textSecondary },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  langSheet: {
    backgroundColor: PARTNER_COLOR.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  langSheetTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: PARTNER_COLOR.textPrimary, marginBottom: 12 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: PARTNER_COLOR.border,
  },
  langOptionText: { fontFamily: PARTNER_FONT.medium, fontSize: 15, color: PARTNER_COLOR.textSecondary },
  langOptionTextActive: { color: PARTNER_COLOR.textPrimary, fontFamily: PARTNER_FONT.bold },
  langCheck: { color: PARTNER_COLOR.lime, fontFamily: PARTNER_FONT.bold },
})

export default PartnerProfile
