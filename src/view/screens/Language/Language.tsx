import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Toast from 'react-native-root-toast'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'

const LANGUAGES = [
  { code: 'en', native: 'English', name: 'English' },
  { code: 'hi', native: 'हिन्दी', name: 'Hindi' },
  { code: 'te', native: 'తెలుగు', name: 'Telugu' },
  { code: 'ta', native: 'தமிழ்', name: 'Tamil' },
  { code: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ml', native: 'മലയാളം', name: 'Malayalam' },
  { code: 'mr', native: 'मराठी', name: 'Marathi' },
  { code: 'bn', native: 'বাংলা', name: 'Bengali' },
]

const LanguageScreen = () => {
  const navigation = useNavigation<any>()
  const [selected, setSelected] = useState('en')

  useEffect(() => {
    getAsyncData('app_language').then(v => {
      if (v && typeof v === 'string') setSelected(v)
    })
  }, [])

  const save = () => {
    setAsyncData('app_language', selected as any)
    const label = LANGUAGES.find(l => l.code === selected)?.name || 'English'
    Toast.show(`Language set to ${label}`, { duration: Toast.durations.SHORT })
    navigation.goBack()
  }

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.22, 1]} style={s.root}>
      <StatusBar backgroundColor="#FFF4C2" barStyle="dark-content" />
      <SafeAreaView style={s.safe} edges={[]}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Language</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.sectionLabel}>CHOOSE YOUR LANGUAGE</Text>
          <View style={s.card}>
            {LANGUAGES.map((l, i) => {
              const active = selected === l.code
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[s.row, i < LANGUAGES.length - 1 && s.divider]}
                  activeOpacity={0.8}
                  onPress={() => setSelected(l.code)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.native}>{l.native}</Text>
                    <Text style={s.name}>{l.name}</Text>
                  </View>
                  <View style={[s.radio, active && s.radioActive]}>
                    {active && <Text style={s.radioTick}>✓</Text>}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={s.note}>You can change your language anytime from settings.</Text>
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={s.saveBar}>
          <TouchableOpacity style={s.saveBtn} onPress={save} activeOpacity={0.9}>
            <Text style={s.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  backArrow: { fontSize: 18, color: '#141414' },
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 24, color: '#141414', letterSpacing: -0.4 },

  scroll: { paddingHorizontal: 16, paddingTop: 6 },
  sectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    letterSpacing: 0.7,
    color: '#8a8a8a',
    marginTop: 12,
    marginBottom: 10,
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0EC', overflow: 'hidden' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F4F4F2' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  native: { fontFamily: 'DMSans-Bold', fontSize: 16, color: '#141414' },
  name: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: '#8a8a8a', marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D9D9D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: '#0C831F', borderColor: '#0C831F' },
  radioTick: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 13 },
  note: { fontFamily: 'DMSans-Medium', fontSize: 12, color: '#9a9a9a', textAlign: 'center', marginTop: 16 },

  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,240,236,0.9)',
    padding: 14,
    paddingBottom: 22,
  },
  saveBtn: {
    height: 56,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnText: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 17 },
})

export default LanguageScreen
