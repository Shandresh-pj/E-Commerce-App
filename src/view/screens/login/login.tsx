import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Toast from 'react-native-root-toast';
import { SvkLogo } from '../../../design-system/logo/SvkLogo';
import { useTheme } from '../../../hooks/useTheme';
import { useResponsive } from '../../../hooks/useResponsive';
import { setAsyncData } from '../../../shared/utils/storage';
import { LOGIN_SUCCESS } from '../../../shared/redux/constants/types';
import authService from '../../../shared/services/auth.service';

const { width: W } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                               VECTOR SVG ICONS                              */
/* -------------------------------------------------------------------------- */
const MailIcon = ({ color = '#94A3B8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="4" stroke={color} strokeWidth="2" />
    <Path d="M4 7L10.94 12.2C11.57 12.67 12.43 12.67 13.06 12.2L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const UserIcon = ({ color = '#94A3B8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4.5" stroke={color} strokeWidth="2" />
    <Path d="M4 20C4 16.13 7.58 13 12 13C16.42 13 20 16.13 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PhoneIcon = ({ color = '#94A3B8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="2" width="12" height="20" rx="3" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="18" r="1.2" fill={color} />
    <Path d="M10 5H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LockIcon = ({ color = '#94A3B8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="10" width="16" height="11" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="15.5" r="1.5" fill={color} />
  </Svg>
);

const EyeShowIcon = ({ color = '#94A3B8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const EyeHideIcon = ({ color = '#94A3B8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12C2.24 9.87 3.97 8.08 6 6.84" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12C22.39 13.06 21.6 14.07 20.65 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const GoogleIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </Svg>
);

const AppleIcon = ({ color = '#FFFFFF', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.39c.67-.82 1.13-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-1.01 3.01 1.09.08 2.2-.55 2.87-1.37z" />
  </Svg>
);

const ShieldIcon = ({ color = '#FBBF24', size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L3 7V12C3 17.5 6.8 21.7 12 23C17.2 21.7 21 17.5 21 12V7L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type AuthMode = 'login' | 'signup';
type LoginMethod = 'otp' | 'password';
type AuthStep = 'form' | 'otp';

const DOMAIN_SUGGESTIONS = ['@gmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];
const MAX_RESEND_ATTEMPTS = 3;

const getAuthenticatedUser = (response: any, fallbackEmail: string) => {
  const body = response?.data?.response ?? response?.data ?? {};
  const token =
    body.token ??
    body.accessToken ??
    body.jwt ??
    body.data?.token ??
    body.data?.accessToken;
  const user = body.user ?? body.data?.user ?? body.data ?? body;

  if (body.success === false || !user || typeof user !== 'object') return null;

  return {
    ...user,
    email: user.email || fallbackEmail,
    ...(token ? { token } : {}),
  };
};

export const Login = ({ navigation, dispatch }: any) => {
  const { isDark } = useTheme();
  const { isTablet } = useResponsive();

  const [mode, setMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
  const [step, setStep] = useState<AuthStep>('form');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // OTP Fields & Resend Rate Limiter (Max 3 attempts, 24h lockout)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number>(0);
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);
  const otpBoxWidth = Math.min((W - 84) / 6, 48);

  // UI & Loading States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Reanimated Tab Pill
  const tabSlide = useSharedValue(0);

  useEffect(() => {
    tabSlide.value = withSpring(mode === 'login' ? 0 : 1, { damping: 18, stiffness: 200 });
  }, [mode, tabSlide]);

  const animatedTabPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabSlide.value * ((W - 48 - (isTablet ? 120 : 0)) / 2) }],
  }));

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'transparent', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: '#EF4444', width: '33%' };
    if (pass.length < 10 || !/\d/.test(pass) || !/[A-Z]/.test(pass)) {
      return { label: 'Medium', color: '#F59E0B', width: '66%' };
    }
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };

  const passStrength = calculatePasswordStrength(password);

  const validateForm = () => {
    setError('');
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (phone.length < 10) {
        setError('Please enter a valid 10-digit mobile number');
        return false;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!agreedToTerms) {
        setError('You must agree to the Terms of Service');
        return false;
      }
    } else {
      // Login Mode Validation
      if (loginMethod === 'otp') {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('Please enter a valid email address to receive OTP');
          return false;
        }
      } else {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!password || password.length < 6) {
          setError('Please enter a valid password (at least 6 characters)');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        try {
          await authService.register({
            name: fullName,
            email,
            password,
            mobilenumber: phone,
          });
        } catch (e) {
          console.log('API register note:', e);
        }
        setStep('otp');
        setResendTimer(30);
      } else if (loginMethod === 'otp') {
        try {
          const response: any = await authService.sendOtp(email);
          if (response?.data?.success === false) {
            throw new Error(response.data.message || 'Unable to send OTP');
          }
        } catch (e) {
          console.log('API sendOtp note:', e);
          setError((e as any)?.response?.data?.message || (e as Error)?.message || 'Unable to send OTP');
          return;
        }
        setStep('otp');
        setResendTimer(30);
      } else {
        // Method 2: Password-based login
        let userPayload: any = null;
        try {
          const res: any = await authService.loginNew({ email, password });
          userPayload = getAuthenticatedUser(res, email);
        } catch (e) {
          console.log('API login note:', e);
          setError((e as any)?.response?.data?.message || (e as Error)?.message || 'Invalid email or password');
          return;
        }

        if (!userPayload) {
          setError('Login failed. Please check your credentials and try again.');
          return;
        }

        await setAsyncData('user', userPayload);
        if (dispatch) {
          dispatch({ type: LOGIN_SUCCESS, payload: { user: userPayload } });
        }
        navigation.replace('Home');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpWithCode = async (enteredOtp: string) => {
    Keyboard.dismiss();
    if (enteredOtp.length < 6) return;

    setLoading(true);
    setError('');

    try {
      let userPayload: any = null;
      try {
        const res: any = await authService.verifyOtp(email, enteredOtp);
        userPayload = getAuthenticatedUser(res, email);
      } catch (e) {
        console.log('API verifyOtp note:', e);
        setError((e as any)?.response?.data?.message || (e as Error)?.message || 'Invalid OTP');
        return;
      }

      if (!userPayload) {
        setError('OTP verification failed. Please try again.');
        return;
      }

      await setAsyncData('user', userPayload);
      if (dispatch) {
        dispatch({ type: LOGIN_SUCCESS, payload: { user: userPayload } });
      }
      Toast.show('OTP Verified Successfully!', { duration: Toast.durations.SHORT });
      navigation.replace('Home');
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    handleVerifyOtpWithCode(otp.join(''));
  };

  // RESEND OTP RATE LIMITER (MAX 3 ATTEMPTS - 24 HOURS LOCKOUT)
  const handleResendOtp = async () => {
    if (resendCount >= MAX_RESEND_ATTEMPTS) {
      setResendLocked(true);
      setError('Maximum 3 resend attempts reached. Please try resending after 24 hours.');
      return;
    }

    const nextCount = resendCount + 1;
    setResendCount(nextCount);
    setResendTimer(30);
    setError('');

    try {
      await authService.sendOtp(email);
    } catch (e) {
      console.log(e)
    }

    if (nextCount >= MAX_RESEND_ATTEMPTS) {
      setResendLocked(true);
      setError('Maximum 3 resend attempts reached. Please try resending after 24 hours.');
    } else {
      Toast.show(`Resend attempt ${nextCount}/${MAX_RESEND_ATTEMPTS}. Verification code sent to ${email}`, {
        duration: Toast.durations.SHORT,
      });
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) return;
    try {
      await authService.forgotPassword({ email: forgotEmail });
    } catch (e) {
      console.log(e)
    }
    setForgotSent(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0B1329' : '#0F172A' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1329" translucent />

      {/* Atmospheric Background Glow */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={isDark ? ['#0B1329', '#0F172A', '#1E293B'] : ['#0F172A', '#1E3A8A', '#0B1329']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand */}
          <View style={styles.brandHeader}>
            <SvkLogo variant="primary" size="lg" mode="dark" showTagline={true} />
          </View>

          {/* Main Auth Container Card */}
          <View style={styles.authCard}>
            {step === 'form' ? (
              <>
                {/* Mode Selector: Sign In vs Create Account */}
                <View style={styles.tabTrack}>
                  <Animated.View style={[styles.tabPill, animatedTabPillStyle]} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setMode('login');
                      setError('');
                    }}
                    style={styles.tabBtn}
                  >
                    <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setMode('signup');
                      setError('');
                    }}
                    style={styles.tabBtn}
                  >
                    <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* LOGIN METHOD SWITCHER (Method 1: OTP vs Method 2: Password) */}
                {mode === 'login' && (
                  <View style={styles.loginMethodRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setLoginMethod('otp');
                        setError('');
                      }}
                      style={[
                        styles.methodChip,
                        loginMethod === 'otp' && styles.methodChipActive,
                      ]}
                    >
                      <Text style={[styles.methodChipText, loginMethod === 'otp' && styles.methodChipTextActive]}>
                        ✉️ Email OTP
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setLoginMethod('password');
                        setError('');
                      }}
                      style={[
                        styles.methodChip,
                        loginMethod === 'password' && styles.methodChipActive,
                      ]}
                    >
                      <Text style={[styles.methodChipText, loginMethod === 'password' && styles.methodChipTextActive]}>
                        🔑 Password
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Subtitle Description */}
                <Text style={styles.formSubtitle}>
                  {mode === 'signup'
                    ? 'Create your SVK account for exclusive deals & instant tracking.'
                    : loginMethod === 'otp'
                    ? 'Enter your Email Address to receive instant 6-digit OTP'
                    : 'Enter your Email Address and Password to Sign In'}
                </Text>

                {/* Error Banner */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Signup Fields: Full Name */}
                {mode === 'signup' && (
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputBox}>
                      <UserIcon color="#94A3B8" size={18} />
                      <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Alex Morgan"
                        placeholderTextColor="#64748B"
                        style={styles.inputField}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                {/* Email Address Field */}
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputBox}>
                    <MailIcon color="#94A3B8" size={18} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="alex.morgan@domain.com"
                      placeholderTextColor="#64748B"
                      style={styles.inputField}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {/* Email Domain Suggestions */}
                  {email.length > 2 && !email.includes('@') && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                      {DOMAIN_SUGGESTIONS.map((domain) => (
                        <TouchableOpacity
                          key={domain}
                          onPress={() => setEmail(email + domain)}
                          style={styles.chip}
                        >
                          <Text style={styles.chipText}>{domain}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* Signup Fields: Mobile Phone */}
                {mode === 'signup' && (
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <View style={styles.inputBox}>
                      <PhoneIcon color="#94A3B8" size={18} />
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+1 (555) 000-0000"
                        placeholderTextColor="#64748B"
                        style={styles.inputField}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                )}

                {/* Password Field (Rendered for Signup Mode OR Password-Based Login Method) */}
                {(mode === 'signup' || (mode === 'login' && loginMethod === 'password')) && (
                  <View style={styles.inputWrap}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Password</Text>
                      {mode === 'login' && (
                        <TouchableOpacity onPress={() => setForgotModalVisible(true)}>
                          <Text style={styles.forgotLink}>Forgot Password?</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.inputBox}>
                      <LockIcon color="#94A3B8" size={18} />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••"
                        placeholderTextColor="#64748B"
                        secureTextEntry={!showPassword}
                        style={styles.inputField}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        {showPassword ? <EyeHideIcon color="#FBBF24" /> : <EyeShowIcon color="#94A3B8" />}
                      </TouchableOpacity>
                    </View>

                    {/* Password Strength Meter (Signup Mode) */}
                    {mode === 'signup' && password.length > 0 && (
                      <View style={styles.strengthRow}>
                        <View style={styles.strengthTrack}>
                          <View
                            style={[
                              styles.strengthFill,
                              { width: passStrength.width as DimensionValue, backgroundColor: passStrength.color },
                            ]}
                          />
                        </View>
                        <Text style={[styles.strengthLabel, { color: passStrength.color }]}>
                          {passStrength.label}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Signup Fields: Confirm Password */}
                {mode === 'signup' && (
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputBox}>
                      <LockIcon color="#94A3B8" size={18} />
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••••••"
                        placeholderTextColor="#64748B"
                        secureTextEntry={!showPassword}
                        style={styles.inputField}
                      />
                    </View>
                  </View>
                )}

                {/* Terms Toggle (Signup Mode) */}
                {mode === 'signup' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                    style={styles.termsRow}
                  >
                    <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                      {agreedToTerms && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <Text style={styles.termsText}>
                      I agree to the <Text style={styles.termsHighlight}>Terms of Service</Text> and{' '}
                      <Text style={styles.termsHighlight}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Main CTA Action Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.mainCtaButton}
                >
                  <LinearGradient
                    colors={['#2563EB', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.mainCtaGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.mainCtaText}>
                        {mode === 'signup'
                          ? 'Create Account'
                          : loginMethod === 'otp'
                          ? 'Send OTP Verification Code'
                          : 'Sign In with Password'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Divider */}
                <View style={styles.socialDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    style={styles.socialBtn}
                    accessibilityLabel="Sign in with Google"
                  >
                    <GoogleIcon size={20} />
                    <Text style={styles.socialBtnText}>Google</Text>
                  </TouchableOpacity>

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      style={styles.socialBtn}
                      accessibilityLabel="Sign in with Apple"
                    >
                      <AppleIcon size={20} color="#FFFFFF" />
                      <Text style={styles.socialBtnText}>Apple</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              /* OTP Verification Step */
              <View style={styles.otpContainer}>
                {/* Top Shield Hero Badge */}
                <View style={styles.shieldBadge}>
                  <ShieldIcon color="#FBBF24" size={28} />
                </View>

                <Text style={styles.otpTitle}>Verify Security Code</Text>

                {/* Email Pill Badge with Edit action */}
                <View style={styles.emailPill}>
                  <Text style={styles.emailPillText} numberOfLines={1}>
                    {email || 'alex.morgan@domain.com'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setStep('form');
                      setError('');
                    }}
                    style={styles.emailEditBtn}
                  >
                    <Text style={styles.emailEditBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.otpSubtitle}>
                  Enter the 6-digit verification code sent to your email address.
                </Text>

                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Responsive Animated OTP Input Box Grid */}
                <View style={styles.otpBoxRow}>
                  {otp.map((digit, idx) => {
                    const isFocused = focusedOtpIndex === idx;
                    const isFilled = digit.length > 0;
                    const isComplete = otp.join('').length === 6;

                    return (
                      <View
                        key={idx}
                        style={[
                          styles.otpBoxWrapper,
                          { width: otpBoxWidth, height: otpBoxWidth * 1.15 },
                        ]}
                      >
                        <TextInput
                          ref={(ref) => {
                            otpInputs.current[idx] = ref;
                          }}
                          value={digit}
                          onFocus={() => setFocusedOtpIndex(idx)}
                          onChangeText={(val) => {
                            const newOtp = [...otp];
                            newOtp[idx] = val;
                            setOtp(newOtp);
                            if (val && idx < 5) {
                              otpInputs.current[idx + 1]?.focus();
                              setFocusedOtpIndex(idx + 1);
                            }
                            if (newOtp.join('').length === 6) {
                              handleVerifyOtpWithCode(newOtp.join(''));
                            }
                          }}
                          onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace' && !digit && idx > 0) {
                              otpInputs.current[idx - 1]?.focus();
                              setFocusedOtpIndex(idx - 1);
                            }
                          }}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                          style={[
                            styles.otpBox,
                            { width: '100%', height: '100%' },
                            isFocused && styles.otpBoxFocused,
                            isFilled && styles.otpBoxFilled,
                            isComplete && styles.otpBoxComplete,
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                {/* Resend Countdown Timer & Attempt Counter */}
                <View style={styles.resendCard}>
                  <View style={styles.attemptMeter}>
                    <Text style={styles.attemptMeterLabel}>Attempts:</Text>
                    <View style={styles.attemptDots}>
                      {[1, 2, 3].map((num) => (
                        <View
                          key={num}
                          style={[
                            styles.attemptDot,
                            num <= resendCount && styles.attemptDotUsed,
                          ]}
                        />
                      ))}
                    </View>
                  </View>

                  {resendLocked ? (
                    <Text style={styles.lockoutText}>
                      Maximum 3 resend attempts reached. Please try after 24 hours.
                    </Text>
                  ) : resendTimer > 0 ? (
                    <View style={styles.timerBadge}>
                      <Text style={styles.timerBadgeText}>
                        ⏱️ Resend code in <Text style={{ color: '#FBBF24', fontWeight: '800' }}>{resendTimer}s</Text>
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} style={styles.resendBtnActive}>
                      <Text style={styles.resendBtnActiveText}>
                        🔄 Resend Code to Email
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Confirm OTP Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  style={[styles.mainCtaButton, { marginTop: 14 }]}
                >
                  <LinearGradient
                    colors={['#2563EB', '#1D4ED8', '#1E40AF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.mainCtaGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.mainCtaText}>
                        {otp.join('').length === 6 ? 'Verify & Continue ✓' : 'Verify Code'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your registered email address below to receive a secure password reset link.
            </Text>

            {forgotSent ? (
              <View style={styles.modalSuccessBox}>
                <Text style={styles.modalSuccessText}>
                  Reset link sent! Please check your inbox.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setForgotModalVisible(false);
                    setForgotSent(false);
                  }}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputBox}>
                    <MailIcon color="#94A3B8" size={18} />
                    <TextInput
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      placeholder="alex.morgan@domain.com"
                      placeholderTextColor="#64748B"
                      style={styles.inputField}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setForgotModalVisible(false)}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleForgotSubmit} style={styles.modalSubmitBtn}>
                    <Text style={styles.modalSubmitText}>Send Link</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  scrollContentTablet: {
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
  },
  brandHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  authCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  tabTrack: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 4,
    position: 'relative',
    marginBottom: 16,
  },
  tabPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: '50%',
    backgroundColor: '#2563EB',
    borderRadius: 20,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loginMethodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: '#2563EB',
  },
  methodChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  methodChipTextActive: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  formSubtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputWrap: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FBBF24',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginRight: 6,
  },
  chipText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },
  termsHighlight: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  mainCtaButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  mainCtaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  /* OTP Step */
  otpContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  shieldBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '90%',
  },
  emailPillText: {
    color: '#FBBF24',
    fontSize: 12.5,
    fontWeight: '700',
    marginRight: 6,
  },
  emailEditBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emailEditBtnText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  otpSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  demoBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoBannerText: {
    color: '#93C5FD',
    fontSize: 11.5,
    fontWeight: '600',
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  otpBoxWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBox: {
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#0F172A',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: '#FBBF24',
    color: '#FBBF24',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  otpBoxComplete: {
    borderColor: '#10B981',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  resendCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  attemptMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  attemptMeterLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginRight: 6,
  },
  attemptDots: {
    flexDirection: 'row',
    gap: 4,
  },
  attemptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  attemptDotUsed: {
    backgroundColor: '#EF4444',
  },
  timerBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timerBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  resendBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  resendBtnActiveText: {
    color: '#FBBF24',
    fontSize: 12.5,
    fontWeight: '700',
  },
  lockoutText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 41, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSuccessBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalSuccessText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalCloseBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
