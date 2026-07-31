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

const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

const VEHICLE_TYPES = [
  { key: 'bike', emoji: '🏍', label: 'Bike' },
  { key: 'scooter', emoji: '🛴', label: 'Scooter' },
  { key: 'ev', emoji: '🚲', label: 'EV' },
]

const DocBox = ({
  label,
  doneLabel,
  uri,
  onPress,
}: {
  label: string
  doneLabel?: string
  uri: string | null
  onPress: () => void
}) => {
  const isDone = !!uri
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={[st.docBox, isDone && st.docBoxFilled]} onPress={onPress} activeOpacity={0.8}>
        {uri && uri !== 'done' ? (
          <Image source={{ uri }} style={st.docImg} />
        ) : isDone ? (
          <View style={st.docDoneFill} />
        ) : (
          <>
            <Text style={st.docIcon}>📷</Text>
            <Text style={st.docCta}>Add {label.toLowerCase()}</Text>
          </>
        )}
        {isDone && (
          <View style={st.docBadge}>
            <Text style={st.docBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={st.docLabel}>{isDone ? doneLabel || label : `${label} · req`}</Text>
    </View>
  )
}

function PartnerVehicleDetails({ navigation }: any) {
  const { setStepStatus } = usePartnerOnboarding()
  const [vehicleType, setVehicleType] = useState('bike')
  const [vehicleNumber, setVehicleNumber] = useState('KA 05 MJ 4821')
  const [makeModel, setMakeModel] = useState('Honda Activa 6G')
  const [rcUri, setRcUri] = useState<string | null>('done')
  const [insuranceUri, setInsuranceUri] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canSave = vehicleNumber.trim().length > 3 && makeModel.trim().length > 2 && !!rcUri && !!insuranceUri

  const pickDoc = (side: 'rc' | 'insurance') => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      if (res.didCancel || !res.assets?.[0]?.uri) return
      if (side === 'rc') setRcUri(res.assets[0].uri)
      else setInsuranceUri(res.assets[0].uri)
    })
  }

  const handleSave = async () => {
    Keyboard.dismiss()
    if (!canSave || saving) return
    setSaving(true)
    try {
      // Vehicle/RC verification happens server-side once a real docs API exists.
      await new Promise<void>(resolve => setTimeout(resolve, 900))
      setStepStatus('vehicleRc', 'review')
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
            <Text style={st.title}>Vehicle & RC</Text>
            <Text style={st.stepLabel}>Step 3 of 4</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={st.fieldLabel}>VEHICLE TYPE</Text>
          <View style={st.typeRow}>
            {VEHICLE_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[st.typeCard, vehicleType === t.key && st.typeCardActive]}
                onPress={() => setVehicleType(t.key)}
                activeOpacity={0.85}
              >
                <Text style={st.typeEmoji}>{t.emoji}</Text>
                <Text style={[st.typeLabel, vehicleType === t.key && st.typeLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={st.card}>
            <Text style={st.fieldLabel}>VEHICLE NUMBER</Text>
            <TextInput
              style={st.fieldInput}
              value={vehicleNumber}
              onChangeText={v => setVehicleNumber(v.toUpperCase())}
              autoCapitalize="characters"
            />
            <View style={st.divider} />
            <Text style={st.fieldLabel}>MAKE & MODEL</Text>
            <TextInput style={st.fieldInput} value={makeModel} onChangeText={setMakeModel} />
          </View>

          <Text style={st.sectionLabel}>DOCUMENTS</Text>
          <View style={st.docRow}>
            <DocBox label="RC certificate" doneLabel="RC uploaded" uri={rcUri} onPress={() => pickDoc('rc')} />
            <DocBox label="Insurance" uri={insuranceUri} onPress={() => pickDoc('insurance')} />
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

  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 14 },
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
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 18, color: TEXT_DARK },
  stepLabel: { fontFamily: PARTNER_FONT.regular, fontSize: 12, color: '#9a9a9a', marginTop: 1 },

  body: { padding: 20, paddingBottom: 8, gap: 16 },
  fieldLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 1,
    marginBottom: 8,
  },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1,
    aspectRatio: 1.1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECECEA',
    gap: 8,
  },
  typeCardActive: { backgroundColor: '#141414', borderColor: '#141414' },
  typeEmoji: { fontSize: 24 },
  typeLabel: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: TEXT_DARK },
  typeLabelActive: { color: '#FFFFFF' },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  fieldInput: { fontFamily: PARTNER_FONT.bold, fontSize: 15.5, color: TEXT_DARK, paddingVertical: 2 },
  divider: { height: 1, backgroundColor: '#ECECEA', marginVertical: 14 },

  sectionLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: '#9a9a9a',
    letterSpacing: 1,
  },
  docRow: { flexDirection: 'row', gap: 12 },
  docBox: {
    aspectRatio: 1.3,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: '#D7D7D4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  docBoxFilled: { borderStyle: 'solid', borderColor: '#141414' },
  docImg: { width: '100%', height: '100%' },
  docDoneFill: { width: '100%', height: '100%', backgroundColor: '#141414' },
  docBadge: {
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
  docBadgeText: { color: '#FFFFFF', fontSize: 12, fontFamily: PARTNER_FONT.bold },
  docIcon: { fontSize: 20, marginBottom: 6 },
  docCta: { fontFamily: PARTNER_FONT.bold, fontSize: 12, color: PARTNER_COLOR.green, textAlign: 'center' },
  docLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 12.5,
    color: TEXT_DARK,
    marginTop: 8,
    textAlign: 'center',
  },

  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
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

export default PartnerVehicleDetails
