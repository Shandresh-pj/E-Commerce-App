import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import styles from './ChangePasswordStyle';
import { THEME } from '../../assets/styles/theme';
import { postData } from '../../../shared/services/main-service';
import { DrawerActions } from '@react-navigation/native';
import EyeHide from '../../assets/images/svg/Icon_eye_hide.svg';
import EyeShow from '../../assets/images/svg/Icon_eye_view.svg';
import UserIcon from '../../assets/images/svg/user-bar.svg';
import { SafeAreaView } from 'react-native-safe-area-context';

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EyeIcon = ({ visible }: { visible: boolean }) =>
  visible ? (
    <EyeShow width={20} height={20} color={THEME.COLOR.bgPurple} />
  ) : (
    <EyeHide width={20} height={20} color={THEME.COLOR.bgPurple} />
  );

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureEntry,
  showToggle,
  onToggle,
  isFocused,
  onFocus,
  onBlur,
  errorMessage,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureEntry: boolean;
  showToggle: boolean;
  onToggle: () => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  errorMessage?: string;
}) => {
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.COLOR.border, THEME.COLOR.bgPurple],
  });

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.COLOR.bgWhite, 'rgba(97,44,126,0.07)'],
  });

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[styles.inputWrapper,]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={THEME.COLOR.textDarkGrey}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
        />
        {showToggle && (
          <TouchableOpacity
            onPress={onToggle}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <EyeIcon visible={!secureEntry} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {errorMessage && (
        <Text style={{ color: '#dd4f4f', fontSize: 12, marginTop: 6 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

const ChangePasswordScreen = ({ navigation }: any) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSubmit = async (values: FormValues) => {
    // Extra client-side safety (already validated by form)
    if (values.newPassword !== values.confirmPassword) return;

    setApiLoading(true);

    try {
      const requestBody = {
        OldPassword: values.currentPassword,
        Password: values.newPassword,
        ConfirmPassword: values.confirmPassword,
      };

      const res = await postData('/Auth/Change/Password', requestBody);

      if (res?.status === 200) {
        // Success animation + feedback
        Animated.sequence([
          Animated.timing(btnScale, {
            toValue: 0.95,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(btnScale, {
            toValue: 1,
            tension: 200,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setSubmitted(true);
          setTimeout(() => {
            Alert.alert(
              'Success',
              'Your password has been changed successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                    reset();
                  },
                },
              ],
            );
          }, 800);
        });
      } else {
        const msg = res?.data?.message || 'Failed to update password';
        if (
          msg.toLowerCase().includes('not matched') ||
          msg.includes('incorrect')
        ) {
          setError('currentPassword', {
            type: 'manual',
            message: 'Current password is incorrect',
          });
        } else {
          setError('currentPassword', { type: 'manual', message: msg });
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError('currentPassword', { type: 'manual', message: msg });
    } finally {
      setApiLoading(false);
    }
  };

  const passwordsMatch = newPassword === watch('confirmPassword');

  return (
    <>
      <StatusBar barStyle="light-content" hidden={false} backgroundColor="#2a2c40" translucent />
      <SafeAreaView edges={["left", "right",]} style={styles.container}>

        {/* Purple header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation?.dispatch(DrawerActions.openDrawer())}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <UserIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
          </View>
        </View>

        <View style={styles.container}>

          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ImageBackground
              source={require("../../assets/images/login-bg.jpg")}
              imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
              style={styles.bakcgroundImage}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Lock visual — unchanged */}
                <Animated.View
                  style={[
                    styles.lockVisual,
                    {
                      opacity: cardAnim,
                      transform: [
                        {
                          scale: cardAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.lockBody}>
                    <View style={styles.lockShackleOuter}>
                      <View style={styles.lockShackleInner} />
                    </View>
                    <View style={styles.lockBodyInner}>
                      <View style={styles.lockKeyhole} />
                    </View>
                  </View>
                  <Text style={styles.lockCaption}>
                    Update your account credentials
                  </Text>
                </Animated.View>

                {/* ── Form Card ──────────────────────────────────────── */}
                <Animated.View
                  style={[
                    styles.card,
                    {
                      opacity: cardAnim,
                      transform: [
                        {
                          translateY: cardAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Current Password */}
                  <Controller
                    control={control}
                    name="currentPassword"
                    rules={{ required: 'Current password is required' }}
                    render={({ field: { onChange, value } }) => (
                      <InputField
                        label="Current Password"
                        placeholder="Enter your current password"
                        value={value}
                        onChangeText={text => {
                          onChange(text);
                          clearErrors('currentPassword');
                        }}
                        secureEntry={!showOld}
                        showToggle
                        onToggle={() => setShowOld(p => !p)}
                        isFocused={focusedField === 'old'}
                        onFocus={() => setFocusedField('old')}
                        onBlur={() => setFocusedField(null)}
                        errorMessage={errors.currentPassword?.message}
                      />
                    )}
                  />

                  <View style={styles.divider} />

                  {/* New Password */}
                  <Controller
                    control={control}
                    name="newPassword"
                    rules={{
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <InputField
                        label="New Password"
                        placeholder="Create a strong password"
                        value={value}
                        onChangeText={text => {
                          onChange(text);
                          clearErrors('newPassword');
                        }}
                        secureEntry={!showNew}
                        showToggle
                        onToggle={() => setShowNew(p => !p)}
                        isFocused={focusedField === 'new'}
                        onFocus={() => setFocusedField('new')}
                        onBlur={() => setFocusedField(null)}
                        errorMessage={errors.newPassword?.message}
                      />
                    )}
                  />

                  {/* Confirm Password */}
                  <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{
                      required: 'Please confirm your new password',
                      validate: val =>
                        val === newPassword || 'Passwords do not match',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <InputField
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        value={value}
                        onChangeText={text => {
                          onChange(text);
                          clearErrors('confirmPassword');
                        }}
                        secureEntry={!showConfirm}
                        showToggle
                        onToggle={() => setShowConfirm(p => !p)}
                        isFocused={focusedField === 'confirm'}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                        errorMessage={errors.confirmPassword?.message}
                      />
                    )}
                  />

                  {/* Visual match indicator (only when user started typing confirmation) */}
                  {watch('confirmPassword')?.length > 0 && (
                    <View style={styles.matchRow}>
                      <View
                        style={[
                          styles.matchDot,
                          {
                            backgroundColor: passwordsMatch
                              ? THEME.COLOR.textSuccess
                              : THEME.COLOR.textRed,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.matchText,
                          {
                            color: passwordsMatch
                              ? THEME.COLOR.textSuccess
                              : THEME.COLOR.textRed,
                          },
                        ]}
                      >
                        {passwordsMatch
                          ? 'Passwords match'
                          : 'Passwords do not match'}
                      </Text>
                    </View>
                  )}

                  {/* Submit Button */}
                  <Animated.View
                    style={[
                      { transform: [{ scale: btnScale }] },
                      styles.btnWrapper,
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        (submitted || apiLoading) && styles.submitButtonSuccess,
                      ]}
                      onPress={handleSubmit(onSubmit)}
                      disabled={apiLoading || submitted}
                      activeOpacity={0.9}
                    >
                      {apiLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : submitted ? (
                        <Text style={styles.submitText}>✓ Password Updated</Text>
                      ) : (
                        <Text style={styles.submitText}>Update Password</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              </ScrollView>
            </ImageBackground>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ChangePasswordScreen;
