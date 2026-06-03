import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { getData, postData } from '../../../shared/services/main-service';
import editStyles from './EditProfileStyle';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import styles from './ProfileStyle';
import { THEME } from '../../assets/styles/theme';

/* ─── Form DTO ───────────────────────────────────────────────────────────── */
interface EditProfileForm {
  FirstName: string;
  LastName: string;
  AadharNumber: string;
}

/* ─── Regex rules ────────────────────────────────────────────────────────── */
const NAME_REGEX = /^[a-zA-Z .'-]+$/;
const AADHAR_REGEX = /^\d{12}$/;

/* ─── Floating-label input ───────────────────────────────────────────────── */
const FloatingInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'words',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur: () => void;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [focused, setFocused] = useState(false);

  /* keep label floated when value is pre-filled */
  useEffect(() => {
    if (value) {
      anim.setValue(1);
    }
  }, [value]);

  const animate = (toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setFocused(true);
    animate(1);
  };
  const handleBlurInternal = () => {
    setFocused(false);
    if (!value) animate(0);
    onBlur();
  };

  const labelTop = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -17],
  });
  const labelSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      THEME.COLOR.textDarkGrey,
      error
        ? '#E04F4F'
        : focused
          ? THEME.COLOR.textBlack
          : THEME.COLOR.textDarkGrey,
    ],
  });

  return (
    <View style={editStyles.fieldWrap}>
      <View
        style={[
          editStyles.inputBox,
          focused && editStyles.inputBoxFocused,
          !!error && editStyles.inputBoxError,
        ]}
      >
        <Animated.Text
          style={[
            editStyles.floatLabel,
            { top: labelTop, fontSize: labelSize, color: labelColor },
          ]}
        >
          {label}
        </Animated.Text>
        <TextInput
          style={editStyles.textInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlurInternal}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
      {!!error && <Text style={editStyles.errorText}>{error}</Text>}
    </View>
  );
};

/* ─── Main Screen ────────────────────────────────────────────────────────── */
const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ── react-hook-form setup ── */
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditProfileForm>({
    mode: 'onBlur', // validate on blur
    reValidateMode: 'onChange', // re-validate as user types after first error
    defaultValues: {
      FirstName: '',
      LastName: '',
      AadharNumber: '',
    },
  });

  /* live value for avatar initials & digit counter */
  const firstNameValue = watch('FirstName');
  const lastNameValue = watch('LastName');
  const aadharValue = watch('AadharNumber');

  /* ── Fetch current profile and pre-fill form ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getData('/User/MyProfile');
        const data = res?.data?.data || res?.data?.object?.data || null;
        if (data) {
          reset({
            FirstName: data.FirstName ?? '',
            LastName: data.LastName ?? '',
            AadharNumber: data.AadharNumber ?? '',
          });
        }
      } catch (e) {
        console.log('EditProfile fetch error:', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [reset]);

  /* ── Submit handler ── */
  const onSubmit = async (formData: EditProfileForm) => {
    setSaving(true);
    try {
      const payload = {
        FirstName: formData.FirstName.trim(),
        LastName: formData.LastName.trim(),
        AadharNumber: formData.AadharNumber.trim(),
      };
      const res: any = await postData('/User/UpdateMyProfile', payload);
      const status = res?.status;
      const msg =
        res?.data?.message ||
        res?.data?.Message ||
        (status === 200
          ? 'Profile updated successfully!'
          : 'Update failed. Please try again.');

      if (status === 200 || status === 201) {
        Alert.alert('Success', msg, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', msg);
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading state ── */
  if (loadingProfile) {
    return (
      <View style={editStyles.loaderContainer}>
        <ActivityIndicator size="large" color='#fff' />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor='#2a2c40'
      />
      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ImageBackground
            source={require("../../assets/images/login-bg.jpg")}
            imageStyle={{ resizeMode: "cover", }}
            style={styles.bakcgroundImage}
          >
            <ScrollView
              contentContainerStyle={editStyles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar banner */}
              <View style={editStyles.banner}>
                <View style={editStyles.avatarCircle}>
                  <Text style={editStyles.avatarText}>
                    {(
                      (firstNameValue?.[0] ?? '') + (lastNameValue?.[0] ?? '')
                    ).toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={editStyles.bannerHint}>
                  Update your personal details
                </Text>
              </View>

              {/* Form card */}
              <View style={editStyles.card}>
                <Text style={editStyles.sectionLabel}>PERSONAL INFO</Text>

                {/* ── First Name ── */}
                <Controller
                  control={control}
                  name="FirstName"
                  rules={{
                    required: 'First name is required.',
                    maxLength: {
                      value: 50,
                      message: 'First name must be at most 50 characters.',
                    },
                    pattern: {
                      value: NAME_REGEX,
                      message:
                        "First name must contain only letters, spaces, or . ' -",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FloatingInput
                      label="First Name *"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.FirstName?.message}
                      maxLength={50}
                    />
                  )}
                />

                {/* ── Last Name ── */}
                <Controller
                  control={control}
                  name="LastName"
                  rules={{
                    maxLength: {
                      value: 50,
                      message: 'Last name must be at most 50 characters.',
                    },
                    validate: v =>
                      !v.trim() ||
                      NAME_REGEX.test(v.trim()) ||
                      "Last name must contain only letters, spaces, or . ' -",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FloatingInput
                      label="Last Name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.LastName?.message}
                      maxLength={50}
                    />
                  )}
                />

                <Text style={[editStyles.sectionLabel, { marginTop: 0 }]}>
                  KYC INFO
                </Text>

                {/* ── Aadhar Number ── */}
                <Controller
                  control={control}
                  name="AadharNumber"
                  rules={{
                    required: 'Aadhar number is required.',
                    minLength: {
                      value: 12,
                      message: 'Aadhar number must be exactly 12 digits.',
                    },
                    maxLength: {
                      value: 12,
                      message: 'Aadhar number must be exactly 12 digits.',
                    },
                    pattern: {
                      value: AADHAR_REGEX,
                      message:
                        'Aadhar number must contain only digits (exactly 12).',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FloatingInput
                      label="Aadhar Number * (12 digits)"
                      value={value}
                      onChangeText={t => onChange(t.replace(/\D/g, ''))}
                      onBlur={onBlur}
                      error={errors.AadharNumber?.message}
                      keyboardType="number-pad"
                      maxLength={12}
                      autoCapitalize="none"
                    />
                  )}
                />

                {/* Digit counter */}
                <Text
                  style={[
                    editStyles.digitCounter,
                    aadharValue.length === 12 && editStyles.digitCounterValid,
                    !!errors.AadharNumber && editStyles.digitCounterError,
                  ]}
                >
                  {aadharValue.length} / 12 digits
                </Text>
              </View>

              {/* Save button */}
              <TouchableOpacity
                style={[editStyles.saveBtn, saving && editStyles.saveBtnDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={editStyles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </ImageBackground>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default EditProfileScreen;
