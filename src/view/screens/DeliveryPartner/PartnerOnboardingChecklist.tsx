import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import {
  usePartnerOnboarding,
  OnboardingSteps,
  StepStatus,
} from './PartnerOnboardingContext'

const LIGHT_BG = '#F4F5F0'
const CARD_BG = '#FFFFFF'
const TEXT_DARK = '#141414'

type StepKey = keyof OnboardingSteps

interface StepConfig {
  key: StepKey
  emoji: string
  label: string
  iconBg: string
  onPress?: () => void
}

function PartnerOnboardingChecklist({ navigation }: any) {
  const { steps, verifiedCount, totalSteps, isReadyToSubmit } = usePartnerOnboarding()
  const [submitting, setSubmitting] = useState(false)

  const progressPct = (verifiedCount / totalSteps) * 100

  const STEP_CONFIG: StepConfig[] = [
    {
      key: 'personalDetails',
      emoji: '👤',
      label: 'Personal details',
      iconBg: '#E4F6E6',
      onPress: () => navigation.navigate('PartnerPersonalDetails'),
    },
    {
      key: 'drivingLicence',
      emoji: '🪪',
      label: 'Driving licence',
      iconBg: '#E4F6E6',
      onPress: () => navigation.navigate('PartnerDocumentUpload'),
    },
    {
      key: 'vehicleRc',
      emoji: '🛵',
      label: 'Vehicle & RC',
      iconBg: '#FFF0D6',
      onPress: () => navigation.navigate('PartnerVehicleDetails'),
    },
    {
      key: 'bankAccount',
      emoji: '💳',
      label: 'Bank account',
      iconBg: '#FFE4E0',
      onPress: () => navigation.navigate('PartnerBankDetails'),
    },
  ]

  const statusMeta = (status: StepStatus) => {
    if (status === 'verified') {
      return { text: 'Verified', color: '#0C831F' }
    }
    if (status === 'review') {
      return { text: 'Under review · ~2hrs', color: '#D98A1F' }
    }
    return { text: 'Action needed', color: '#C0392B' }
  }

  const handleSubmit = async () => {
    if (!isReadyToSubmit || submitting) return
    setSubmitting(true)
    try {
      // Activation review is handled server-side once a real partner-ops
      // backend exists; for now we just simulate the round trip.
      await new Promise<void>(resolve => setTimeout(resolve, 1000))
      navigation.replace('PartnerApplicationReview')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={st.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PARTNER_COLOR.bg}
        translucent={false}
      />
      <SafeAreaView style={st.headerSafe} edges={['top']}>
        <View style={st.header}>
          <Text style={st.headerLabel}>GET ACTIVATED</Text>
          <Text style={st.headerTitle}>Complete your profile</Text>
          <View style={st.progressRow}>
            <View style={st.progressTrack}>
              <View style={[st.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={st.progressFraction}>
              {verifiedCount}/{totalSteps}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={st.body}
        contentContainerStyle={st.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {STEP_CONFIG.map(cfg => {
          const status = steps[cfg.key]
          const meta = statusMeta(status)
          const tappable = status === 'todo' && !!cfg.onPress
          return (
            <TouchableOpacity
              key={cfg.key}
              style={[st.card, status === 'review' && st.cardReview]}
              onPress={tappable ? cfg.onPress : undefined}
              activeOpacity={tappable ? 0.75 : 1}
              disabled={!tappable}
            >
              <View style={[st.cardIconBox, { backgroundColor: cfg.iconBg }]}>
                <Text style={st.cardEmoji}>{cfg.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.cardLabel}>{cfg.label}</Text>
                <Text style={[st.cardStatus, { color: meta.color }]}>{meta.text}</Text>
              </View>
              {status === 'verified' && <Text style={st.checkIcon}>✓</Text>}
              {status === 'review' && (
                <View style={st.pendingPill}>
                  <Text style={st.pendingPillText}>Pending</Text>
                </View>
              )}
              {status === 'todo' && <Text style={st.chevron}>›</Text>}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={st.footer}>
        <TouchableOpacity
          style={[st.submitBtn, !isReadyToSubmit && st.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isReadyToSubmit || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={st.submitBtnText}>Submit for activation</Text>
          )}
        </TouchableOpacity>
        {!isReadyToSubmit && (
          <Text style={st.helperText}>Finish all 4 steps to activate your account</Text>
        )}
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },

  headerSafe: { backgroundColor: PARTNER_COLOR.bg },
  header: {
    backgroundColor: PARTNER_COLOR.bg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 26,
  },
  headerLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11.5,
    color: PARTNER_COLOR.lime,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 24,
    color: PARTNER_COLOR.textPrimary,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: PARTNER_COLOR.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: PARTNER_COLOR.lime,
  },
  progressFraction: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 13,
    color: PARTNER_COLOR.lime,
  },

  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 12 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#ECECEA',
  },
  cardReview: { borderColor: '#F5D48A', backgroundColor: '#FFFBF0' },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 21 },
  cardLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  cardStatus: {
    fontFamily: PARTNER_FONT.medium,
    fontSize: 12.5,
  },
  checkIcon: {
    fontSize: 18,
    color: '#0C831F',
    fontFamily: PARTNER_FONT.bold,
  },
  pendingPill: {
    backgroundColor: '#FFF0D6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingPillText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11,
    color: '#D98A1F',
  },
  chevron: { fontSize: 22, color: '#C4C4C4' },

  footer: {
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#D5D7DA' },
  submitBtnText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  helperText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12,
    color: '#C0392B',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
})

export default PartnerOnboardingChecklist
