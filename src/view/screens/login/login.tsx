import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOtpAction, verifyOtpAction } from '../../../shared/redux/actions/auth.action';

const { width } = Dimensions.get('window');

// ─── Design tokens ───────────────────────────────────────────────────────────
const ACCENT = '#6C63FF';
const ACCENT_DARK = '#4B44CC';
const BG = '#0F0E1A';
const SURFACE = '#1A1830';
const BORDER = '#2E2B50';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9B99B8';
const SUCCESS = '#43D98C';
const OTP_BOX_SIZE = Math.min(52, (width - 80) / 6 - 8);

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthStep = 'email' | 'otp' | 'success';

// ─── Reusable animated button ─────────────────────────────────────────────────
const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableWithoutFeedback
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={!disabled && !loading ? onPress : undefined}
    >
      <Animated.View
        style={[
          authStyles.btn,
          disabled && authStyles.btnDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={authStyles.btnText}>{label}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// ─── Email screen ─────────────────────────────────────────────────────────────
const EmailScreen = ({
  onContinue,
}: {
  onContinue: (email: string) => Promise<void>;
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validate = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleContinue = async () => {
    Keyboard.dismiss();
    if (!validate(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onContinue(email.trim().toLowerCase());
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View
      style={[
        authStyles.stepContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Icon */}
      <View style={authStyles.iconCircle}>
        <Text style={authStyles.iconEmoji}>🛍️</Text>
      </View>

      <Text style={authStyles.stepTitle}>Welcome back</Text>
      <Text style={authStyles.stepSubtitle}>
        Enter your email to receive a one-time passcode
      </Text>

      {/* Input */}
      <View style={[authStyles.inputWrap, error ? authStyles.inputWrapError : null]}>
        <Text style={authStyles.inputIcon}>✉️</Text>
        <TextInput
          style={authStyles.input}
          placeholder="you@example.com"
          placeholderTextColor={TEXT_SECONDARY}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={v => {
            setEmail(v);
            if (error) setError('');
          }}
          onSubmitEditing={handleContinue}
          returnKeyType="done"
        />
      </View>

      {error ? <Text style={authStyles.errorText}>{error}</Text> : null}

      <PrimaryButton
        label="Continue"
        onPress={handleContinue}
        loading={loading}
        disabled={email.length === 0}
      />

      <Text style={authStyles.legalText}>
        By continuing, you agree to our{' '}
        <Text style={authStyles.legalLink}>Terms</Text> &{' '}
        <Text style={authStyles.legalLink}>Privacy Policy</Text>
      </Text>
    </Animated.View>
  );
};

// ─── OTP screen ───────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;

const OtpScreen = ({
  email,
  onVerify,
  onResend,
}: {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputs = useRef<TextInput[]>([]);
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    inputs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (error) setError('');
    if (digit && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const next = [...otp];
      next[idx - 1] = '';
      setOtp(next);
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendCooldown(30);
    inputs.current[0]?.focus();
    try {
      await onResend();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP';
      setError(msg);
    }
  };

  const filled = otp.join('').length;

  return (
    <Animated.View
      style={[
        authStyles.stepContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={authStyles.iconCircle}>
        <Text style={authStyles.iconEmoji}>🔐</Text>
      </View>

      <Text style={authStyles.stepTitle}>Verify your email</Text>
      <Text style={authStyles.stepSubtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={{ color: ACCENT, fontWeight: '700' }}>{email}</Text>
      </Text>

      {/* OTP boxes */}
      <View style={authStyles.otpRow}>
        {Array(OTP_LENGTH)
          .fill(0)
          .map((_, i) => (
            <TextInput
              key={i}
              ref={el => {
                if (el) inputs.current[i] = el;
              }}
              style={[
                authStyles.otpBox,
                otp[i] ? authStyles.otpBoxFilled : null,
                error ? authStyles.otpBoxError : null,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={otp[i]}
              onChangeText={v => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              caretHidden
              selectTextOnFocus
            />
          ))}
      </View>

      {error ? <Text style={authStyles.errorText}>{error}</Text> : null}

      <PrimaryButton
        label="Verify"
        onPress={handleVerify}
        loading={loading}
        disabled={filled < OTP_LENGTH}
      />

      {/* Resend */}
      <TouchableOpacity
        onPress={handleResend}
        disabled={resendCooldown > 0}
        style={authStyles.resendWrap}
      >
        <Text style={authStyles.resendText}>
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Didn't receive it? "}
          {resendCooldown === 0 && (
            <Text style={authStyles.resendLink}>Resend OTP</Text>
          )}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Success screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ onGoHome }: { onGoHome: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onGoHome, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        authStyles.stepContainer,
        authStyles.successContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View
        style={[authStyles.successCircle, { transform: [{ scale: checkScale }] }]}
      >
        <Text style={authStyles.successCheck}>✓</Text>
      </Animated.View>

      <Text style={authStyles.successTitle}>Login Successful!</Text>
      <Text style={authStyles.successSubtitle}>
        You're all set. Redirecting to your home screen…
      </Text>

      <ActivityIndicator color={ACCENT} style={{ marginTop: 24 }} />
    </Animated.View>
  );
};

// ─── Root Login component ─────────────────────────────────────────────────────
function Login(props: any) {
  const { navigation, dispatch } = props;
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');

  const goHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'LocationPermission' }] });
  }, [navigation]);

  const handleEmailContinue = async (val: string) => {
    if (dispatch) {
      await dispatch(sendOtpAction(val));
    }
    setEmail(val);
    setStep('otp');
  };

  const handleOtpVerify = async (otp: string) => {
    if (dispatch) {
      await dispatch(verifyOtpAction(email, otp));
    }
    setStep('success');
  };

  const handleResend = async () => {
    if (dispatch) {
      await dispatch(sendOtpAction(email));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={authStyles.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} translucent={false} />

        {/* Decorative blobs */}
        <View style={[authStyles.blob, authStyles.blob1]} />
        <View style={[authStyles.blob, authStyles.blob2]} />

        <SafeAreaView edges={['top', 'bottom']} style={authStyles.safeArea}>

          {/* Step indicator + back button */}
          {step !== 'success' && (
            <View style={authStyles.topBar}>
              {step === 'otp' && (
                <TouchableOpacity
                  style={authStyles.backBtn}
                  onPress={() => setStep('email')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={authStyles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              )}
              <View style={authStyles.stepDots}>
                {(['email', 'otp'] as AuthStep[]).map(s => (
                  <View
                    key={s}
                    style={[
                      authStyles.dot,
                      step === s
                        ? authStyles.dotActive
                        : null,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Step content */}
          <View style={authStyles.content}>
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
            {step === 'success' && (
              <SuccessScreen onGoHome={goHome} />
            )}
          </View>

        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const authStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  safeArea: {
    flex: 1,
  },
  // Decorative blobs
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: ACCENT,
    top: -100,
    right: -80,
  },
  blob2: {
    width: 220,
    height: 220,
    backgroundColor: '#FF6B9D',
    bottom: 60,
    left: -70,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 52,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backBtnText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER,
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 22,
  },
  // Main content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // Icon
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconEmoji: {
    fontSize: 36,
  },
  // Typography
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  // Email input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 56,
  },
  inputWrapError: {
    borderColor: '#FF5C7D',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  errorText: {
    color: '#FF5C7D',
    fontSize: 12,
    marginBottom: 14,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  // Button
  btn: {
    width: '100%',
    height: 56,
    backgroundColor: ACCENT,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: ACCENT,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Legal text
  legalText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  legalLink: {
    color: ACCENT,
    fontWeight: '600',
  },
  // OTP
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  otpBox: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE + 6,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BORDER,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  otpBoxFilled: {
    borderColor: ACCENT,
    backgroundColor: `${ACCENT}18`,
  },
  otpBoxError: {
    borderColor: '#FF5C7D',
  },
  resendWrap: {
    marginTop: 20,
    paddingVertical: 8,
  },
  resendText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    textAlign: 'center',
  },
  resendLink: {
    color: ACCENT,
    fontWeight: '700',
  },
  // Success
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${SUCCESS}22`,
    borderWidth: 2,
    borderColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successCheck: {
    fontSize: 42,
    color: SUCCESS,
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default Login;
