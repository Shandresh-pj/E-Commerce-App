import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { LocationIcon } from './LocationIcon'
import { THEME } from '../assets/styles/theme'

interface BackgroundLocationDisclosureModalProps {
  visible: boolean;
  onAgree: () => void;
  onDeny: () => void;
}

export const BackgroundLocationDisclosureModal: React.FC<BackgroundLocationDisclosureModalProps> = ({
  visible,
  onAgree,
  onDeny,
}) => {
  if (!visible) return null

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDeny}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.dialogCard}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <LocationIcon width={36} height={36} color="#0052CC" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Location Access Disclosure</Text>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollInner}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.description}>
                This app collects <Text style={styles.boldText}>Location Data</Text> to enable features such as live employee tracking, field visit route calculation, and automated attendance logging <Text style={styles.highlightText}>even when the app is closed or not in use</Text>.
              </Text>

              <View style={styles.bulletList}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Live Field Tracking:</Text> Tracks your position while on duty to calculate real-time distance and routes.
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Background Updates:</Text> Collects location updates in the background during active work tracking.
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Data Privacy:</Text> Your location data is securely transmitted to company servers and is never sold or shared with unauthorized third parties.
                  </Text>
                </View>
              </View>

              <Text style={styles.footnote}>
                You can change location permissions at any time in your device settings. Select "Allow all the time" on the next screen to enable background tracking.
              </Text>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.denyButton}
                onPress={onDeny}
                activeOpacity={0.8}
              >
                <Text style={styles.denyButtonText}>No Thanks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.agreeButton}
                onPress={onAgree}
                activeOpacity={0.8}
              >
                <Text style={styles.agreeButtonText}>Agree & Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  dialogCard: {
    backgroundColor: THEME.COLOR.surface,
    borderRadius: THEME.RADIUS.large,
    padding: 24,
    ...THEME.SHADOW.card,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    maxHeight: 280,
    marginBottom: 20,
  },
  scrollInner: {
    paddingVertical: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Regular,
    marginBottom: 14,
  },
  highlightText: {
    fontWeight: '700',
    color: THEME.COLOR.danger,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  boldText: {
    fontWeight: '700',
    color: THEME.COLOR.textPrimary,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  bulletList: {
    marginBottom: 14,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 16,
    color: '#0052CC',
    marginRight: 8,
    marginTop: -2,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
    color: THEME.COLOR.textMuted,
    fontFamily: THEME.FONTWEIGHT.Regular,
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  denyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.RADIUS.xs,
    borderWidth: 1.5,
    borderColor: THEME.COLOR.border,
    backgroundColor: THEME.COLOR.surfaceAlt,
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  agreeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.RADIUS.xs,
    backgroundColor: '#0052CC',
    alignItems: 'center',
  },
  agreeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
})
