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
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { getData, postData, postFormData } from '../../../shared/services/main-service';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import Defaults from '../../../config';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  header: '#1a1b2e',
  accent: '#7C6EF5',
  accentLight: 'rgba(124,110,245,0.1)',
  text: '#1C1C2E',
  textMid: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  border: '#E8EAED',
  inputBg: '#F8F9FB',
  success: '#22C55E',
  shadow: '#1C1C2E',
};

const { width } = Dimensions.get('window');

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CameraIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={13} r={4} stroke="#fff" strokeWidth={1.8} />
  </Svg>
);

const UserIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={C.accent} strokeWidth={1.8} />
    <Path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="22,6 12,13 2,6" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Form DTO ─────────────────────────────────────────────────────────────────
interface EditProfileForm {
  FirstName: string;
  LastName: string;
  Email: string;
  MobileNumber: string;
}

const NAME_REGEX = /^[a-zA-Z .'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Animated input field ─────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur: () => void;
  error?: string;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: any;
  IconComp?: React.FC;
  editable?: boolean;
  hint?: string;
}

const Field: React.FC<FieldProps> = ({
  label, value, onChangeText, onBlur, error,
  keyboardType = 'default', maxLength, autoCapitalize = 'words',
  IconComp, editable = true, hint,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const animBorder = (v: number) =>
    Animated.timing(borderAnim, { toValue: v, duration: 180, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? C.danger : C.border, error ? C.danger : C.accent],
  });

  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <Animated.View style={[f.box, { borderColor }, !editable && f.boxDisabled]}>
        {IconComp && (
          <View style={f.icon}>
            <IconComp />
          </View>
        )}
        <TextInput
          style={[f.input, !IconComp && { paddingLeft: 14 }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => { setFocused(true); animBorder(1); }}
          onBlur={() => { setFocused(false); animBorder(0); onBlur(); }}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          placeholderTextColor={C.textLight}
          placeholder={editable ? `Enter ${label.replace(' *', '').toLowerCase()}` : ''}
        />
      </Animated.View>
      {hint && !error && <Text style={f.hint}>{hint}</Text>}
      {!!error && <Text style={f.error}>{error}</Text>}
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [savedName, setSavedName] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [userId, setUserId] = useState<number | string>('');
  const [userAddress, setUserAddress] = useState<string>('');

  const { control, handleSubmit, reset, watch, formState: { errors } } =
    useForm<EditProfileForm>({
      mode: 'onBlur',
      reValidateMode: 'onChange',
      defaultValues: { FirstName: '', LastName: '', Email: '', MobileNumber: '' },
    });

  const firstNameVal = watch('FirstName');
  const lastNameVal = watch('LastName');

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getData('/profile');
        const d = res?.data?.user || res?.data?.data || res?.data?.object?.data || null;
        if (d) {
          let firstName = '';
          let lastName = '';
          if (d.name) {
            const parts = d.name.trim().split(/\s+/);
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
          } else {
            firstName = d.FirstName ?? '';
            lastName = d.LastName ?? '';
          }

          reset({
            FirstName: firstName,
            LastName: lastName,
            Email: d.email || d.Email || '',
            MobileNumber: d.mobilenumber || d.MobileNumber || '',
          });
          setSavedName(`${firstName} ${lastName}`.trim());
          setSavedEmail(d.email || d.Email || '');
          setUserId(d.id || d.Id || '');
          setUserAddress(d.address || d.Address || '');

          if (d.image || d.Image) {
            const imgPath = d.image || d.Image;
            if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
              setAvatarUri(imgPath);
            } else {
              setAvatarUri(`${Defaults.apis.baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`);
            }
          }
        }
      } catch (e) {
        console.log('EditProfile fetch error:', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetch();
  }, [reset]);

  // ── Image pick ─────────────────────────────────────────────────────────────
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      res => {
        const asset = res.assets?.[0];
        if (asset?.uri) setAvatarUri(asset.uri);
      },
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: EditProfileForm) => {
    setSaving(true);
    try {
      const name = `${data.FirstName.trim()} ${data.LastName.trim()}`.trim();
      const email = data.Email.trim();
      const mobilenumber = data.MobileNumber.trim();
      const address = userAddress.trim() || 'N/A';

      const formData = new FormData();
      formData.append('id', String(userId));
      formData.append('name', name);
      formData.append('email', email);
      formData.append('mobilenumber', mobilenumber);
      formData.append('address', address);

      if (avatarUri && !avatarUri.startsWith('http://') && !avatarUri.startsWith('https://')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('image', {
          uri: Platform.OS === 'android' && !avatarUri.startsWith('file://') && !avatarUri.startsWith('content://')
            ? `file://${avatarUri}`
            : avatarUri,
          name: filename,
          type: type,
        } as any);
      }

      const res = await postFormData('/profile/update', formData);
      const status = res?.status;
      const msg = res?.data?.message || res?.data?.Message ||
        (status === 200 ? 'Profile updated successfully!' : 'Update failed. Try again.');

      if (status === 200 || status === 201) {
        Alert.alert('Success ✓', msg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Error', msg);
      }
    } catch (error) {
      console.log('Update profile error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Initials ───────────────────────────────────────────────────────────────
  const initials = ((firstNameVal?.[0] ?? '') + (lastNameVal?.[0] ?? '')).toUpperCase() || '?';

  if (loadingProfile) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.header} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.header }} />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={s.root}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Edit Profile</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* ── Profile hero card ────────────────────────────────────────── */}
          <View style={s.heroCard}>
            {/* Avatar with camera overlay */}
            <View style={s.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatarImg} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Text style={s.avatarText}>{initials}</Text>
                </View>
              )}
              <TouchableOpacity style={s.cameraBtn} onPress={pickImage} activeOpacity={0.8}>
                <CameraIcon />
              </TouchableOpacity>
            </View>

            {/* Name & email summary */}
            <View style={s.heroInfo}>
              <Text style={s.heroName} numberOfLines={1}>
                {(firstNameVal + ' ' + lastNameVal).trim() || savedName || 'Your Name'}
              </Text>
              <Text style={s.heroEmail} numberOfLines={1}>
                {watch('Email') || savedEmail || 'your@email.com'}
              </Text>
            </View>

            {/* Tap to change photo hint */}
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              <Text style={s.changePhotoHint}>Tap avatar to change photo</Text>
            </TouchableOpacity>
          </View>

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.sectionLabel}>Personal Information</Text>
            <View style={s.card}>
              {/* First Name */}
              <Controller
                control={control}
                name="FirstName"
                rules={{
                  required: 'First name is required.',
                  maxLength: { value: 50, message: 'Max 50 characters.' },
                  pattern: { value: NAME_REGEX, message: "Only letters, spaces, or . ' -" },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="First Name *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.FirstName?.message}
                    maxLength={50}
                    IconComp={UserIcon}
                  />
                )}
              />

              {/* Last Name */}
              <Controller
                control={control}
                name="LastName"
                rules={{
                  maxLength: { value: 50, message: 'Max 50 characters.' },
                  validate: v => !v.trim() || NAME_REGEX.test(v.trim()) || "Only letters, spaces, or . ' -",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Last Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.LastName?.message}
                    maxLength={50}
                    IconComp={UserIcon}
                  />
                )}
              />
            </View>

            <Text style={s.sectionLabel}>Contact Information</Text>
            <View style={s.card}>
              {/* Email */}
              <Controller
                control={control}
                name="Email"
                rules={{
                  required: 'Email is required.',
                  pattern: { value: EMAIL_REGEX, message: 'Enter a valid email address.' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Email *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.Email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    IconComp={MailIcon}
                  />
                )}
              />

              {/* Mobile */}
              <Controller
                control={control}
                name="MobileNumber"
                rules={{
                  minLength: { value: 10, message: 'Enter a valid mobile number.' },
                  maxLength: { value: 15, message: 'Max 15 digits.' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Mobile Number"
                    value={value}
                    onChangeText={t => onChange(t.replace(/[^0-9+\s-]/g, ''))}
                    onBlur={onBlur}
                    error={errors.MobileNumber?.message}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    maxLength={15}
                    IconComp={PhoneIcon}
                    hint="Optional — used for delivery alerts"
                  />
                )}
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[s.saveBtn, saving && s.saveBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={s.saveBtnInner}>
                  <CheckIcon />
                  <Text style={s.saveBtnText}>Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  /* Header */
  header: {
    backgroundColor: C.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Hero card */
  heroCard: {
    backgroundColor: C.header,
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: C.header,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(124,110,245,0.4)',
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(124,110,245,0.4)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.header,
  },
  heroInfo: { alignItems: 'center', gap: 4, marginBottom: 8 },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.2,
  },
  changePhotoHint: {
    fontSize: 12,
    color: 'rgba(124,110,245,0.8)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  /* Section */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMid,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  /* Form scroll */
  scroll: { paddingBottom: 24 },

  /* Save button */
  saveBtn: {
    backgroundColor: C.accent,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

// ─── Field styles ─────────────────────────────────────────────────────────────
const f = StyleSheet.create({
  wrap: { marginBottom: 14, marginTop: 8 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMid,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: C.border,
    overflow: 'hidden',
  },
  boxDisabled: { backgroundColor: '#F0F1F5', opacity: 0.75 },
  icon: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingVertical: 13,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11.5,
    color: C.textLight,
    marginTop: 4,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  error: {
    fontSize: 11.5,
    color: C.danger,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },
});

export default EditProfileScreen;
