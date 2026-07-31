import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'
import { INITIAL_NOTIFICATIONS, PartnerNotification } from './partnerMockData'

function PartnerNotifications({ navigation }: any) {
  const [notifications, setNotifications] = useState<PartnerNotification[]>(INITIAL_NOTIFICATIONS)

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

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
          <Text style={st.title}>Updates</Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={st.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {notifications.map(n => (
            <View key={n.id} style={st.notifCard}>
              {n.unread && <View style={st.unreadDot} />}
              <View style={[st.notifIconBox, { backgroundColor: n.iconBg }]}>
                <Text style={st.notifEmoji}>{n.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.notifTitle}>{n.title}</Text>
                <Text style={st.notifBody}>{n.body}</Text>
                <Text style={st.notifTime}>{n.timeLabel}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
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
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 17, color: '#FFFFFF' },
  title: { flex: 1, fontFamily: PARTNER_FONT.bold, fontSize: 19, color: '#FFFFFF' },
  markAllRead: { fontFamily: PARTNER_FONT.bold, fontSize: 12.5, color: PARTNER_COLOR.lime },

  body: { padding: 20, gap: 12, paddingBottom: 40 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PARTNER_COLOR.lime,
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  notifEmoji: { fontSize: 18 },
  notifTitle: { fontFamily: PARTNER_FONT.bold, fontSize: 14, color: '#FFFFFF', marginBottom: 3 },
  notifBody: { fontFamily: PARTNER_FONT.regular, fontSize: 12.5, color: PARTNER_COLOR.textSecondary, lineHeight: 18, marginBottom: 6 },
  notifTime: { fontFamily: PARTNER_FONT.regular, fontSize: 11, color: PARTNER_COLOR.textMuted },
})

export default PartnerNotifications
