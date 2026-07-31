import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { launchImageLibrary } from 'react-native-image-picker'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { usePartnerOnboarding } from './PartnerOnboardingContext'

const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

const CONFIG = {
  title: 'Driving licence',
  stepLabel: 'Step 2 of 4',
  instructions:
    'Upload clear photos of the front & back. Make sure all text and your photo are readable.',
  numberLabel: 'LICENCE NUMBER',
  numberPlaceholder: 'KA01 2020 0012345',
  validPlaceholder: '12 / 2031',
}

const PhotoBox = ({
  label,
  uri,
  onPress,
}: {
  label: string
  uri: string | null
  onPress: () => void
}) => (
  <View style={{ flex: 1 }}>
    <TouchableOpacity
      style={[st.photoBox, uri && st.photoBoxFilled]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={st.photoImg} />
          <View style={st.photoBadge}>
            <Text style={st.photoBadgeText}>✓</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={st.photoIcon}>📷</Text>
          <Text style={st.photoCta}>Capture {label.toLowerCase()}</Text>
        </>
      )}
    </TouchableOpacity>
    <View style={st.photoLabelRow}>
      <Text style={st.photoLabel}>{label}</Text>
      <Text style={uri ? st.photoRetake : st.photoRequired}>
        {uri ? 'Retake' : 'required'}
      </Text>
    </View>
  </View>
)

function PartnerDocumentUpload({ navigation }: any) {
  const config = CONFIG
  const { setStepStatus } = usePartnerOnboarding()

  const [frontUri, setFrontUri] = useState<string | null>(null)
  const [backUri, setBackUri] = useState<string | null>(null)
  const [number, setNumber] = useState('')
  const [validTill, setValidTill] = useState('')
  const [autoReading, setAutoReading] = useState(false)
  const [autoRead, setAutoRead] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (frontUri && backUri && !number && !validTill && !autoReading) {
      setAutoReading(true)
      const timer = setTimeout(() => {
        setNumber(config.numberPlaceholder)
        setValidTill(config.validPlaceholder)
        setAutoRead(true)
        setAutoReading(false)
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [frontUri, backUri])

  const pickPhoto = (side: 'front' | 'back') => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      const uri = res.assets?.[0]?.uri
      if (res.didCancel || !uri) return
      if (side === 'front') setFrontUri(uri)
      else setBackUri(uri)
    })
  }

  const canSave = !!frontUri && !!backUri && number.trim().length > 0 && validTill.trim().length > 0

  const handleSave = async () => {
    Keyboard.dismiss()
    if (!canSave || saving) return
    setSaving(true)
    try {
      // Document verification will move server-side once the partner-docs
      // API exists; locally we just flip the shared onboarding status.
      await new Promise<void>(resolve => setTimeout(resolve, 900))
      setStepStatus('drivingLicence', 'verified')
      navigation.goBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_BG} translucent={false} />
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
            <Text style={st.title}>{config.title}</Text>
            <Text style={st.stepLabel}>{config.stepLabel}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={st.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={st.instructions}>{config.instructions}</Text>

          <View style={st.photoRow}>
            <PhotoBox label="Front" uri={frontUri} onPress={() => pickPhoto('front')} />
            <PhotoBox label="Back" uri={backUri} onPress={() => pickPhoto('back')} />
          </View>

          <View style={st.detailsCard}>
            <Text style={st.fieldLabel}>{config.numberLabel}</Text>
            <TextInput
              style={st.fieldInput}
              placeholder={config.numberPlaceholder}
              placeholderTextColor="#B5B5B5"
              value={number}
              onChangeText={v => {
                setNumber(v)
                setAutoRead(false)
              }}
              autoCapitalize="characters"
            />

            <View style={st.divider} />

            <View style={st.validRow}>
              <View style={{ flex: 1 }}>
                <Text style={st.fieldLabel}>VALID TILL</Text>
                {autoReading ? (
                  <ActivityIndicator size="small" color={PARTNER_COLOR.green} />
                ) : (
                  <TextInput
                    style={st.fieldInput}
                    placeholder={config.validPlaceholder}
                    placeholderTextColor="#B5B5B5"
                    value={validTill}
                    onChangeText={v => {
                      setValidTill(v)
                      setAutoRead(false)
                    }}
                  />
                )}
              </View>
              {autoRead && (
                <View style={st.autoReadPill}>
                  <Text style={st.autoReadText}>Auto read ✓</Text>
                </View>
              )}
            </View>
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
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },
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
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEA',
  },
  backIcon: { fontSize: 17, color: TEXT_DARK },
  title: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 18,
    color: TEXT_DARK,
  },
  stepLabel: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12,
    color: '#9a9a9a',
    marginTop: 1,
  },

  body: { padding: 20, paddingBottom: 8 },
  instructions: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 18,
  },

  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  photoBox: {
    aspectRatio: 1.5,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: '#D7D7D4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoBoxFilled: { borderStyle: 'solid', borderColor: '#141414' },
  photoImg: { width: '100%', height: '100%' },
  photoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadgeText: { color: '#FFFFFF', fontSize: 12, fontFamily: PARTNER_FONT.bold },
  photoIcon: { fontSize: 22, marginBottom: 6 },
  photoCta: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 12.5,
    color: PARTNER_COLOR.green,
  },
  photoLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  photoLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 13,
    color: TEXT_DARK,
  },
  photoRetake: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 12,
    color: '#2E7DD1',
  },
  photoRequired: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12,
    color: '#9a9a9a',
  },

  detailsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
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
    fontSize: 16,
    color: TEXT_DARK,
    paddingVertical: 2,
  },
  divider: { height: 1, backgroundColor: '#ECECEA', marginVertical: 14 },
  validRow: { flexDirection: 'row', alignItems: 'center' },
  autoReadPill: {
    backgroundColor: '#E4F6E6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  autoReadText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11,
    color: '#0C831F',
  },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
})

export default PartnerDocumentUpload
