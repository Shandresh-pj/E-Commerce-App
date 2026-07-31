import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { usePartnerOnboarding, OnboardingSteps, StepStatus } from './PartnerOnboardingContext'

const ROWS: { key: keyof OnboardingSteps; label: string }[] = [
  { key: 'personalDetails', label: 'Personal details' },
  { key: 'drivingLicence', label: 'Driving licence' },
  { key: 'vehicleRc', label: 'Vehicle & RC' },
  { key: 'bankAccount', label: 'Bank account' },
]

const statusMeta = (status: StepStatus) => {
  if (status === 'verified') return { icon: '✓', text: 'Done', color: PARTNER_COLOR.lime }
  if (status === 'review') return { icon: '🟡', text: 'Reviewing', color: '#D98A1F' }
  return { icon: '○', text: 'Pending', color: PARTNER_COLOR.textMuted }
}

function PartnerApplicationReview({ navigation }: any) {
  const { steps, setStepStatus } = usePartnerOnboarding()
  const navigatedRef = useRef(false)

  useEffect(() => {
    // Real activation happens async on the backend; this simulates the
    // manual-review step ("Vehicle & RC") clearing after a short wait.
    const reviewTimer = setTimeout(() => {
      if (steps.vehicleRc === 'review') setStepStatus('vehicleRc', 'verified')
    }, 3500)

    const homeTimer = setTimeout(() => {
      if (!navigatedRef.current) {
        navigatedRef.current = true
        navigation.reset({ index: 0, routes: [{ name: 'PartnerHomeTabs' }] })
      }
    }, 5000)

    return () => {
      clearTimeout(reviewTimer)
      clearTimeout(homeTimer)
    }
  }, [])

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={st.iconCircle}>
            <Text style={st.iconEmoji}>⏱</Text>
          </View>
          <Text style={st.title}>Almost there!</Text>
          <Text style={st.subtitle}>
            We're verifying your documents. This usually takes{' '}
            <Text style={st.subtitleBold}>under 24 hours</Text>. We'll notify you the moment
            you're activated.
          </Text>

          <View style={st.card}>
            {ROWS.map(row => {
              const meta = statusMeta(steps[row.key])
              return (
                <View key={row.key} style={st.row}>
                  <Text style={st.rowLabel}>{row.label}</Text>
                  <Text style={[st.rowStatus, { color: meta.color }]}>
                    {meta.icon} {meta.text}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <TouchableOpacity
          style={st.supportBtn}
          onPress={() => Alert.alert('Support', 'Reach us at partners@dash.app · 24x7')}
          activeOpacity={0.85}
        >
          <Text style={st.supportBtnText}>💬 Chat with support</Text>
        </TouchableOpacity>
        <Text style={st.hintText}>Watch the 2-min safety & app guide while you wait.</Text>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1, paddingHorizontal: 24 },

  iconCircle: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: { fontSize: 36, color: PARTNER_COLOR.lime },
  title: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13.5,
    color: PARTNER_COLOR.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  subtitleBold: { fontFamily: PARTNER_FONT.bold, color: '#FFFFFF' },

  card: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowLabel: { fontFamily: PARTNER_FONT.medium, fontSize: 14, color: '#FFFFFF' },
  rowStatus: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5 },

  supportBtn: {
    height: 54,
    borderRadius: 15,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    marginBottom: 10,
  },
  supportBtnText: { fontFamily: PARTNER_FONT.bold, fontSize: 14.5, color: '#FFFFFF' },
  hintText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
})

export default PartnerApplicationReview
