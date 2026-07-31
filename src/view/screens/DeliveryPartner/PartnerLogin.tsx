import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

const LANGUAGES = ['English', 'हिंदी', 'தமிழ்', 'తెలుగు']

const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits

function PartnerLogin({ navigation }: any) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('English')
  const [langModalVisible, setLangModalVisible] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 10)
    setPhone(digits)
    if (error) setError('')
  }

  const handleSendOtp = async () => {
    Keyboard.dismiss()
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    try {
      // Delivery-partner OTP dispatch is a mocked, local-only flow for now —
      // there is no partner auth endpoint on the backend yet.
      await new Promise<void>(resolve => setTimeout(resolve, 900))
      navigation.navigate('PartnerOtp', { phone })
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={st.root}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PARTNER_COLOR.bg}
          translucent={false}
        />
        <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
          <View style={st.brandRow}>
            <View style={st.brandIconBox}>
              <Text style={st.brandEmoji}>⚡</Text>
            </View>
            <Text style={st.brandText}>
              DASH <Text style={st.brandTextAccent}>Partner</Text>
            </Text>
          </View>

          <Animated.View
            style={[
              st.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={st.title}>
              Welcome,{'\n'}partner
            </Text>
            <Text style={st.subtitle}>
              Log in with your registered mobile number to start delivering.
            </Text>

            <Text style={st.label}>MOBILE NUMBER</Text>
            <View style={[st.inputWrap, error ? st.inputWrapErr : null]}>
              <Text style={st.countryCode}>+91</Text>
              <View style={st.inputDivider} />
              <TextInput
                style={st.input}
                placeholder="98765 43210"
                placeholderTextColor={PARTNER_COLOR.textMuted}
                keyboardType="number-pad"
                value={formatPhone(phone)}
                onChangeText={handlePhoneChange}
                maxLength={11}
                selectionColor={PARTNER_COLOR.lime}
                onSubmitEditing={handleSendOtp}
                returnKeyType="done"
              />
            </View>
            {error ? <Text style={st.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[st.cta, (loading || phone.length !== 10) && st.ctaDisabled]}
              onPress={handleSendOtp}
              disabled={loading || phone.length !== 10}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={st.ctaText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={st.footer}>
            <TouchableOpacity
              style={st.langBtn}
              onPress={() => setLangModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={st.langEmoji}>🌐</Text>
              <Text style={st.langText}>{language}</Text>
              <Text style={st.langChevron}>▾</Text>
            </TouchableOpacity>

            <Text style={st.legal}>
              By continuing you agree to DASH's{' '}
              <Text style={st.legalLink}>Partner Terms</Text> &{' '}
              <Text style={st.legalLink}>Privacy Policy</Text>
            </Text>
          </View>
        </SafeAreaView>

        <Modal
          visible={langModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLangModalVisible(false)}
        >
          <Pressable
            style={st.modalOverlay}
            onPress={() => setLangModalVisible(false)}
          >
            <View style={st.langSheet}>
              <Text style={st.langSheetTitle}>Choose language</Text>
              {LANGUAGES.map(l => (
                <TouchableOpacity
                  key={l}
                  style={st.langOption}
                  onPress={() => {
                    setLanguage(l)
                    setLangModalVisible(false)
                  }}
                >
                  <Text
                    style={[
                      st.langOptionText,
                      l === language && st.langOptionTextActive,
                    ]}
                  >
                    {l}
                  </Text>
                  {l === language && <Text style={st.langCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 10,
  },
  brandIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: PARTNER_COLOR.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEmoji: { fontSize: 15 },
  brandText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16,
    color: PARTNER_COLOR.textPrimary,
    letterSpacing: 0.2,
  },
  brandTextAccent: { color: PARTNER_COLOR.lime },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 32,
    color: PARTNER_COLOR.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 14.5,
    color: PARTNER_COLOR.textSecondary,
    lineHeight: 21,
    marginBottom: 32,
  },

  label: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PARTNER_COLOR.surface,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    height: 58,
    paddingHorizontal: 16,
  },
  inputWrapErr: { borderColor: PARTNER_COLOR.danger },
  countryCode: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16,
    color: PARTNER_COLOR.textPrimary,
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: PARTNER_COLOR.border,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: PARTNER_FONT.medium,
    fontSize: 16,
    color: PARTNER_COLOR.textPrimary,
    letterSpacing: 0.5,
    height: '100%',
  },
  errorText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12,
    color: PARTNER_COLOR.danger,
    marginTop: 8,
    marginLeft: 4,
  },

  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 18,
  },
  langEmoji: { fontSize: 14 },
  langText: {
    fontFamily: PARTNER_FONT.medium,
    fontSize: 13,
    color: PARTNER_COLOR.textSecondary,
  },
  langChevron: { fontSize: 12, color: PARTNER_COLOR.textMuted },

  legal: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 11.5,
    color: PARTNER_COLOR.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    fontFamily: PARTNER_FONT.bold,
    color: PARTNER_COLOR.lime,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  langSheet: {
    backgroundColor: PARTNER_COLOR.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  langSheetTitle: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16,
    color: PARTNER_COLOR.textPrimary,
    marginBottom: 12,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: PARTNER_COLOR.border,
  },
  langOptionText: {
    fontFamily: PARTNER_FONT.medium,
    fontSize: 15,
    color: PARTNER_COLOR.textSecondary,
  },
  langOptionTextActive: {
    color: PARTNER_COLOR.textPrimary,
    fontFamily: PARTNER_FONT.bold,
  },
  langCheck: { color: PARTNER_COLOR.lime, fontFamily: PARTNER_FONT.bold },
})

export default PartnerLogin
