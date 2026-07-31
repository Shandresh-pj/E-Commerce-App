import React from 'react'
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { PERFORMANCE } from './partnerMockData'

const Stars = ({ rating }: { rating: number }) => (
  <Text style={st.stars}>
    {'★'.repeat(Math.round(rating))}
    {'☆'.repeat(5 - Math.round(rating))}
  </Text>
)

const StatCard = ({
  label,
  value,
  sub,
  progress,
  barColor,
}: {
  label: string
  value: string
  sub: string
  progress?: number
  barColor?: string
}) => (
  <View style={st.statCard}>
    <Text style={st.statLabel}>{label}</Text>
    <Text style={st.statValue}>{value}</Text>
    {progress !== undefined && (
      <View style={st.statBarTrack}>
        <View style={[st.statBarFill, { width: `${progress}%`, backgroundColor: barColor }]} />
      </View>
    )}
    <Text style={st.statSub}>{sub}</Text>
  </View>
)

function PartnerStats() {
  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={PARTNER_COLOR.bg} translucent={false} />
      <SafeAreaView style={st.safe} edges={['top']}>
        <Text style={st.headerTitle}>Performance</Text>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          <View style={st.ratingCard}>
            <View style={st.ratingCircle}>
              <Text style={st.ratingValue}>{PERFORMANCE.rating}</Text>
              <Stars rating={PERFORMANCE.rating} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={st.tierPill}>
                <Text style={st.tierPillText}>{PERFORMANCE.tier.toUpperCase()}</Text>
              </View>
              <Text style={st.ratingSummary}>{PERFORMANCE.summary}</Text>
            </View>
          </View>

          <View style={st.statsGrid}>
            <StatCard
              label="ACCEPTANCE"
              value={`${PERFORMANCE.acceptancePct}%`}
              sub="Nice work staying high"
              progress={PERFORMANCE.acceptancePct}
              barColor="#0C831F"
            />
            <StatCard
              label="ON-TIME"
              value={`${PERFORMANCE.onTimePct}%`}
              sub="Deliveries on schedule"
              progress={PERFORMANCE.onTimePct}
              barColor="#0C831F"
            />
            <StatCard label="LOGIN HOURS" value={PERFORMANCE.loginHours} sub="this week" />
            <StatCard
              label="CANCELLATION"
              value={`${PERFORMANCE.cancellationPct}%`}
              sub="keep under 5%"
              progress={PERFORMANCE.cancellationPct * 4}
              barColor="#D98A1F"
            />
          </View>

          <Text style={st.sectionTitle}>Recent customer feedback</Text>
          <View style={{ gap: 10 }}>
            {PERFORMANCE.feedback.map((quote, i) => (
              <View key={i} style={st.feedbackCard}>
                <Text style={st.feedbackStars}>★★★★★</Text>
                <Text style={st.feedbackText}>"{quote}"</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },

  headerTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 16 },
  body: { padding: 20, paddingTop: 0, gap: 20, paddingBottom: 40 },

  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 20,
    padding: 18,
    gap: 16,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  ratingCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingValue: { fontFamily: PARTNER_FONT.bold, fontSize: 24, color: '#FFFFFF' },
  stars: { color: PARTNER_COLOR.lime, fontSize: 11, marginTop: 2 },
  tierPill: {
    alignSelf: 'flex-start',
    backgroundColor: PARTNER_COLOR.lime,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  tierPillText: { fontFamily: PARTNER_FONT.bold, fontSize: 10.5, color: '#141414', letterSpacing: 0.4 },
  ratingSummary: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: PARTNER_COLOR.textSecondary, lineHeight: 18 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  statLabel: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 10.5,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  statValue: { fontFamily: PARTNER_FONT.bold, fontSize: 20, color: '#FFFFFF', marginBottom: 8 },
  statBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: PARTNER_COLOR.border,
    overflow: 'hidden',
    marginBottom: 8,
  },
  statBarFill: { height: '100%', borderRadius: 3 },
  statSub: { fontFamily: PARTNER_FONT.regular, fontSize: 11, color: PARTNER_COLOR.textMuted },

  sectionTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 15, color: '#FFFFFF' },
  feedbackCard: {
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  feedbackStars: { color: PARTNER_COLOR.lime, fontSize: 12, marginBottom: 6 },
  feedbackText: { fontFamily: PARTNER_FONT.regular, fontSize: 13, color: '#FFFFFF', lineHeight: 19, fontStyle: 'italic' },
})

export default PartnerStats
