import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

export const PARTNER_LANGUAGE_KEY = 'partner_language_selected'

const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
]

function PartnerLanguageSelect({ navigation }: any) {
  const [selected, setSelected] = useState('en')

  const handleContinue = async () => {
    await AsyncStorage.setItem(PARTNER_LANGUAGE_KEY, selected)
    navigation.replace('PartnerSplash')
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.iconBox}>
          <Text style={st.iconEmoji}>🌐</Text>
        </View>
        <Text style={st.title}>Choose your language</Text>
        <Text style={st.subtitle}>ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ · ನಿಮ್ಮೊಂದಿಗೆ ಕೆಲಸ ಮಾಡಲು ಸಿದ್ಧ</Text>

        <View style={st.list}>
          {LANGUAGES.map(lang => {
            const isSelected = selected === lang.code
            return (
              <TouchableOpacity
                key={lang.code}
                style={[st.row, isSelected && st.rowSelected]}
                onPress={() => setSelected(lang.code)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={[st.rowNative, isSelected && st.rowNativeSelected]}>{lang.native}</Text>
                  <Text style={st.rowEnglish}>{lang.english}</Text>
                </View>
                {isSelected && (
                  <View style={st.checkBadge}>
                    <Text style={st.checkBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={st.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={st.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: { fontSize: 20 },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 26, color: '#FFFFFF', marginBottom: 8 },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: PARTNER_COLOR.textSecondary,
    lineHeight: 20,
    marginBottom: 28,
  },

  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  rowSelected: { borderColor: PARTNER_COLOR.lime, backgroundColor: PARTNER_COLOR.limeSoft },
  rowNative: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF', marginBottom: 2 },
  rowNativeSelected: { color: PARTNER_COLOR.lime },
  rowEnglish: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: PARTNER_COLOR.textMuted },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: { fontFamily: PARTNER_FONT.bold, fontSize: 13, color: '#141414' },

  continueBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  continueBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerLanguageSelect
