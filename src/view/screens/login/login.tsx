import React, { useState, useRef, useEffect, useCallback } from 'react'
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
import {
  sendOtpAction,
  verifyOtpAction,
} from '../../../shared/redux/actions/auth.action'

const { width } = Dimensions.get('window')
const OTP_BOX_SIZE = Math.min(56, (width - 80) / 6 - 8)

type AuthStep = 'email' | 'otp' | 'success'

const CTA = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  green = false,
}: {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  green?: boolean
}) => {
  const scale = useRef(new Animated.Value(1)).current
  return (
    <TouchableWithoutFeedback
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.98,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start()
      }
      onPress={!disabled && !loading ? onPress : undefined}
    >
      <Animated.View
        style={[
          st.btn,
          green && st.btnGreen,
          disabled && st.btnDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={green ? '#fff' : '#141414'} size="small" />
        ) : (
          <Text style={[st.btnText, green && st.btnTextGreen]}>{label}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

const EmailScreen = ({
  onContinue,
}: {
  onContinue: (email: string) => Promise<void>
}) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const validate = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleContinue = async () => {
    Keyboard.dismiss()
    if (!validate(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onContinue(email.trim().toLowerCase())
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to send OTP',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Animated.View
      style={[
        st.step,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={st.stepTitle}>Log in or sign up</Text>
      <Text style={st.stepSub}>
        Groceries & rewards, delivered fast. Enter your email to get started.
      </Text>

      <View style={[st.inputWrap, error ? st.inputWrapErr : null]}>
        <Text style={st.inputIcon}>✉️</Text>
        <TextInput
          style={st.input}
          placeholder="you@example.com"
          placeholderTextColor="#9a9a9a"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={v => {
            setEmail(v)
            if (error) setError('')
          }}
          onSubmitEditing={handleContinue}
          returnKeyType="done"
        />
      </View>

      {error ? <Text style={st.errorText}>{error}</Text> : null}

      <CTA
        label="Continue →"
        onPress={handleContinue}
        loading={loading}
        disabled={email.length === 0}
      />

      <Text style={st.legal}>
        By continuing you agree to our{' '}
        <Text style={st.legalLink}>Terms</Text> &{' '}
        <Text style={st.legalLink}>Privacy Policy</Text>.
      </Text>
    </Animated.View>
  )
}

const OTP_LENGTH = 6

const OtpScreen = ({
  email,
  onVerify,
  onResend,
}: {
  email: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
}) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(30)
  const inputs = useRef<TextInput[]>([])
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
    inputs.current[0]?.focus()
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
      setError('Please enter all 6 digits')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onVerify(code)
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Verification failed',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setOtp(Array(OTP_LENGTH).fill(''))
    setError('')
    setCooldown(30)
    inputs.current[0]?.focus()
    try {
      await onResend()
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to resend OTP',
      )
    }
  }

  return (
    <Animated.View
      style={[
        st.step,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={st.stepTitle}>Verify your email</Text>
      <Text style={st.stepSub}>
        Enter the 6-digit code sent to{'\n'}
        <Text style={{ color: '#FFE000', fontFamily: 'DMSans-Bold' }}>
          {email}
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
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
              }
              caretHidden
              selectTextOnFocus
            />
          ))}
      </View>

      {error ? <Text style={st.errorText}>{error}</Text> : null}

      <CTA
        label="Verify & continue ⚡"
        onPress={handleVerify}
        loading={loading}
        disabled={otp.join('').length < OTP_LENGTH}
        green
      />

      <TouchableOpacity
        onPress={handleResend}
        disabled={cooldown > 0}
        style={st.resendWrap}
      >
        <Text style={st.resendText}>
          {cooldown > 0 ? 'Resend code in ' : "Didn't receive it? "}
          {cooldown > 0 ? (
            <Text style={{ color: '#FFE000' }}>
              00:{cooldown.toString().padStart(2, '0')}
            </Text>
          ) : (
            <Text style={st.resendLink}>Resend OTP</Text>
          )}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const SuccessScreen = ({ onGoHome }: { onGoHome: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const checkScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start()
    const timer = setTimeout(onGoHome, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Animated.View
      style={[
        st.step,
        st.successWrap,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View
        style={[st.successCircle, { transform: [{ scale: checkScale }] }]}
      >
        <Text style={st.successCheck}>✓</Text>
      </Animated.View>
      <Text style={st.stepTitle}>Login Successful!</Text>
      <Text style={st.stepSub}>You're all set. Redirecting…</Text>
      <ActivityIndicator color="#FFE000" style={{ marginTop: 24 }} />
    </Animated.View>
  )
}

function Login(props: any) {
  const { navigation, dispatch } = props
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')

  const goHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'LocationPermission' }] })
  }, [navigation])

  const handleEmailContinue = async (val: string) => {
    if (dispatch) await dispatch(sendOtpAction(val))
    setEmail(val)
    setStep('otp')
  }

  const handleOtpVerify = async (otp: string) => {
    if (dispatch) await dispatch(verifyOtpAction(email, otp))
    setStep('success')
  }

  const handleResend = async () => {
    if (dispatch) await dispatch(sendOtpAction(email))
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={st.root}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFE000"
          translucent={false}
        />

        {/* Yellow hero */}
        <View style={st.hero}>
          <View style={st.heroBubble} />
          <View style={st.logoBox}>
            <Text style={st.logoEmoji}>⚡</Text>
          </View>
          <Text style={st.logoName}>FUTURE BELIEVE</Text>
        </View>

        {/* Dark card */}
        <SafeAreaView edges={['bottom']} style={st.card}>
          {step !== 'success' && (
            <View style={st.topRow}>
              {step === 'otp' ? (
                <TouchableOpacity
                  onPress={() => setStep('email')}
                  style={st.backBtn}
                >
                  <Text style={st.backBtnText}>← Change email</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <View style={st.dots}>
                {(['email', 'otp'] as AuthStep[]).map(s => (
                  <View
                    key={s}
                    style={[st.dot, step === s && st.dotActive]}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={st.cardContent}>
            {step === 'email' && (
              <EmailScreen onContinue={handleEmailContinue} />
            )}
            {step === 'otp' && (
              <OtpScreen
                email={email}
                onVerify={handleOtpVerify}
                onResend={handleResend}
              />
            )}
            {step === 'success' && <SuccessScreen onGoHome={goHome} />}
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFE000' },

  hero: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBubble: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 200,
    height: 200,
    backgroundColor: '#FFD500',
    borderRadius: 100,
  },
  logoBox: {
    width: 78,
    height: 78,
    backgroundColor: '#141414',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 14,
  },
  logoEmoji: { fontSize: 42, lineHeight: 52 },
  logoName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    letterSpacing: -1.5,
    color: '#141414',
    marginTop: 14,
  },

  card: {
    flex: 1,
    backgroundColor: '#141414',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 8,
    minHeight: 52,
  },
  backBtn: { flex: 1, paddingVertical: 4 },
  backBtnText: {
    color: '#9a9a9a',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3a3a3a',
  },
  dotActive: { backgroundColor: '#FFE000', width: 22 },

  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  step: { width: '100%', alignItems: 'center' },
  stepTitle: {
    fontSize: 26,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  stepSub: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#9a9a9a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#262626',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#3a3a3a',
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 58,
  },
  inputWrapErr: { borderColor: '#C0392B' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    height: '100%',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FF7F7F',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    marginBottom: 14,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },

  btn: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFE000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnGreen: { backgroundColor: '#0C831F' },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    color: '#141414',
    fontSize: 17,
    fontFamily: 'DMSans-Bold',
    letterSpacing: 0.3,
  },
  btnTextGreen: { color: '#FFFFFF' },

  legal: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
  legalLink: { color: '#FFE000', fontFamily: 'DMSans-Bold' },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  otpBox: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE + 8,
    borderRadius: 12,
    backgroundColor: '#262626',
    borderWidth: 1.5,
    borderColor: '#3a3a3a',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#FFE000',
  },
  otpBoxFilled: {
    borderColor: '#FFE000',
    backgroundColor: 'rgba(255,224,0,0.1)',
  },
  otpBoxErr: { borderColor: '#C0392B' },
  resendWrap: { marginTop: 18, paddingVertical: 8 },
  resendText: {
    color: '#9a9a9a',
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  },
  resendLink: { color: '#FFE000', fontFamily: 'DMSans-Bold' },

  successWrap: { alignItems: 'center', justifyContent: 'center' },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(12,131,31,0.15)',
    borderWidth: 2,
    borderColor: '#0C831F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successCheck: {
    fontSize: 42,
    color: '#0C831F',
    fontFamily: 'DMSans-Bold',
  },
})

export default Login
