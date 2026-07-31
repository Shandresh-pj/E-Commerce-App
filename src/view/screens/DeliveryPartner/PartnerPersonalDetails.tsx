import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { launchImageLibrary } from 'react-native-image-picker'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { usePartnerOnboarding } from './PartnerOnboardingContext'
import { PARTNER_PROFILE } from './partnerMockData'

const GENDERS = ['Male', 'Female', 'Other']
const LIGHT_HEADER_BG = '#FFFFFF'

function PartnerPersonalDetails({ navigation }: any) {
  const { setStepStatus } = usePartnerOnboarding()
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [fullName, setFullName] = useState(PARTNER_PROFILE.name)
  const [dob, setDob] = useState('14 / 08 / 1996')
  const [gender, setGender] = useState('Male')
  const [city, setCity] = useState('Bengaluru')
  const [emergencyContact, setEmergencyContact] = useState('+91 98220 11020')
  const [saving, setSaving] = useState(false)

  const canSave =
    fullName.trim().length > 2 && city.trim().length > 1 && emergencyContact.trim().length >= 10

  const pickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      if (res.didCancel || !res.assets?.[0]?.uri) return
      setAvatarUri(res.assets[0].uri)
    })
  }

  const handleSave = async () => {
    Keyboard.dismiss()
    if (!canSave || saving) return
    setSaving(true)
    try {
      // Profile fields sync to a real partner-profile API once it exists.
      await new Promise<void>(resolve => setTimeout(resolve, 700))
      setStepStatus('personalDetails', 'verified')
      navigation.goBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_HEADER_BG} translucent={false} />
      <SafeAreaView style={st.headerSafe} edges={['top']}>
        <View style={st.headerRow}>
          <TouchableOpacity
            style={st.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={st.title}>Personal details</Text>
            <Text style={st.stepLabel}>Step 1 of 4</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={st.darkBody}>
        <ScrollView contentContainerStyle={st.scrollBody} keyboardShouldPersistTaps="handled">
          <View style={st.avatarWrap}>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85}>
              <View style={st.avatarCircle}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={st.avatarImg} />
                ) : (
                  <Text style={st.avatarInitial}>{fullName[0] || 'R'}</Text>
                )}
                <View style={st.cameraBadge}>
                  <Text style={st.cameraBadgeIcon}>📷</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickPhoto}>
              <Text style={st.addPhotoLink}>Add profile photo</Text>
            </TouchableOpacity>
          </View>

          <View style={st.formCard}>
            <Text style={st.fieldLabel}>FULL NAME (as on licence)</Text>
            <TextInput style={st.fieldInput} value={fullName} onChangeText={setFullName} />
            <View style={st.divider} />

            <View style={st.rowSplit}>
              <View style={{ flex: 1 }}>
                <Text style={st.fieldLabel}>DATE OF BIRTH</Text>
                <TextInput
                  style={st.fieldInput}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD / MM / YYYY"
                />
              </View>
              <View style={st.rowSplitDivider} />
              <View style={{ flex: 1 }}>
                <Text style={st.fieldLabel}>GENDER</Text>
                <View style={st.genderRow}>
                  {GENDERS.map(g => (
                    <TouchableOpacity key={g} onPress={() => setGender(g)}>
                      <Text style={[st.genderOption, gender === g && st.genderOptionActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={st.divider} />

            <Text style={st.fieldLabel}>CITY</Text>
            <TextInput style={st.fieldInput} value={city} onChangeText={setCity} />
            <View style={st.divider} />

            <Text style={st.fieldLabel}>EMERGENCY CONTACT</Text>
            <TextInput
              style={st.fieldInput}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
            />
          </View>

          <View style={st.infoBox}>
            <Text style={st.infoText}>
              ⓘ Your name must match your driving licence for verification.
            </Text>
          </View>
        </ScrollView>

        <View style={st.footer}>
          <TouchableOpacity
            style={[st.saveBtn, !canSave && st.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={st.saveBtnText}>Save & continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  headerSafe: { backgroundColor: LIGHT_HEADER_BG },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, gap: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F4F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 17, color: '#141414' },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: '#141414' },
  stepLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#9a9a9a', marginTop: 1 },

  darkBody: { flex: 1 },
  scrollBody: { padding: 20, paddingBottom: 8 },

  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarImg: { width: 76, height: 76, borderRadius: 38 },
  avatarInitial: { fontFamily: PARTNER_FONT.bold, fontSize: 28, color: '#141414' },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#141414',
    borderWidth: 2,
    borderColor: PARTNER_COLOR.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeIcon: { fontSize: 11 },
  addPhotoLink: { fontFamily: PARTNER_FONT.bold, fontSize: 13, color: '#6699FF' },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldInput: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 15.5,
    color: '#141414',
    paddingVertical: 2,
  },
  divider: { height: 1, backgroundColor: '#ECECEA', marginVertical: 14 },
  rowSplit: { flexDirection: 'row' },
  rowSplitDivider: { width: 16 },
  genderRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  genderOption: {
    fontFamily: PARTNER_FONT.medium,
    fontSize: 13.5,
    color: '#9a9a9a',
    paddingVertical: 3,
  },
  genderOptionActive: { color: '#141414', fontFamily: PARTNER_FONT.bold },

  infoBox: {
    backgroundColor: 'rgba(102,153,255,0.12)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(102,153,255,0.3)',
  },
  infoText: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: '#8FB3FF', lineHeight: 18 },

  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 16, color: '#FFFFFF' },
})

export default PartnerPersonalDetails
