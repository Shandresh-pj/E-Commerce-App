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
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PARTNER_COLOR, PARTNER_FONT } from './partnerTheme'

const { width } = Dimensions.get('window')
const OTP_LENGTH = 4
const OTP_BOX_SIZE = Math.min(64, (width - 48 - (OTP_LENGTH - 1) * 14) / OTP_LENGTH)
const RESEND_SECONDS = 30

const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits

function PartnerOtpVerification({ navigation, route }: any) {
  const phone: string = route?.params?.phone || ''
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const inputs = useRef<TextInput[]>([])

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
    const focusTimer = setTimeout(() => inputs.current[0]?.focus(), 250)
    return () => clearTimeout(focusTimer)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (error) setError('')
    if (digit && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()
  }

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
      const next = [...otp]
      next[idx - 1] = ''
      setOtp(next)
    }
  }

  const handleVerify = async () => {
    Keyboard.dismiss()
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 4 digits')
      return
    }
    setError('')
    setLoading(true)
    try {
      // Mocked verification pending a real partner-auth endpoint.
      await new Promise<void>(resolve => setTimeout(resolve, 900))
      navigation.reset({ index: 0, routes: [{ name: 'PartnerLocationPriming' }] })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setOtp(Array(OTP_LENGTH).fill(''))
    setError('')
    setCooldown(RESEND_SECONDS)
    inputs.current[0]?.focus()
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
          <TouchableOpacity
            style={st.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>

          <Animated.View
            style={[
              st.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={st.title}>Verify your number</Text>
            <Text style={st.subtitle}>
              Enter the 4-digit code sent to{'\n'}
              <Text style={st.phoneText}>+91 {formatPhone(phone)}</Text>{' '}
              <Text style={st.editLink} onPress={() => navigation.goBack()}>
                Edit
              </Text>
            </Text>

            <View style={st.otpRow}>
              {Array(OTP_LENGTH)
                .fill(0)
                .map((_, i) => (
                  <TextInput
                    key={i}
                    ref={el => {
                      if (el) inputs.current[i] = el
                    }}
                    style={[
                      st.otpBox,
                      otp[i] ? st.otpBoxFilled : null,
                      error ? st.otpBoxErr : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[i]}
                    onChangeText={v => handleChange(v, i)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                    selectionColor={PARTNER_COLOR.lime}
                    caretHidden={false}
                    selectTextOnFocus
                  />
                ))}
            </View>
            {error ? <Text style={st.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                st.cta,
                (loading || otp.join('').length < OTP_LENGTH) && st.ctaDisabled,
              ]}
              onPress={handleVerify}
              disabled={loading || otp.join('').length < OTP_LENGTH}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={st.ctaText}>Verify & continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResend}
              disabled={cooldown > 0}
              style={st.resendWrap}
              activeOpacity={0.7}
            >
              <Text style={st.resendText}>
                {cooldown > 0 ? (
                  <>
                    <Text style={st.clockIcon}>⏱ </Text>
                    Resend code in{' '}
                    <Text style={st.resendTimer}>
                      0:{cooldown.toString().padStart(2, '0')}
                    </Text>
                  </>
                ) : (
                  <Text style={st.resendLink}>Resend OTP</Text>
                )}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARTNER_COLOR.bg },
  safe: { flex: 1 },

  backBtn: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PARTNER_COLOR.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: PARTNER_COLOR.textPrimary, fontSize: 18 },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 26,
    color: PARTNER_COLOR.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 14.5,
    color: PARTNER_COLOR.textSecondary,
    lineHeight: 22,
    marginBottom: 30,
  },
  phoneText: {
    fontFamily: PARTNER_FONT.bold,
    color: PARTNER_COLOR.textPrimary,
  },
  editLink: {
    fontFamily: PARTNER_FONT.bold,
    color: PARTNER_COLOR.lime,
  },

  otpRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  otpBox: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.surface,
    borderWidth: 1.5,
    borderColor: PARTNER_COLOR.border,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: PARTNER_FONT.bold,
    color: PARTNER_COLOR.textPrimary,
  },
  otpBoxFilled: {
    borderColor: PARTNER_COLOR.lime,
    backgroundColor: PARTNER_COLOR.limeSoft,
  },
  otpBoxErr: { borderColor: PARTNER_COLOR.danger },
  errorText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 12,
    color: PARTNER_COLOR.danger,
    marginBottom: 10,
  },

  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PARTNER_COLOR.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    fontFamily: PARTNER_FONT.bold,
    fontSize: 16.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  resendWrap: { marginTop: 20, alignSelf: 'center', paddingVertical: 6 },
  resendText: {
    fontFamily: PARTNER_FONT.regular,
    fontSize: 13,
    color: PARTNER_COLOR.textSecondary,
  },
  clockIcon: { fontSize: 12 },
  resendTimer: {
    fontFamily: PARTNER_FONT.bold,
    color: PARTNER_COLOR.textPrimary,
  },
  resendLink: {
    fontFamily: PARTNER_FONT.bold,
    color: PARTNER_COLOR.lime,
  },
})

export default PartnerOtpVerification
