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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { updateMyProfile } from '../../../shared/services/main-service';
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

const AddressIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={10} r={3} stroke={C.accent} strokeWidth={1.8} />
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
  Address: string;
}

const NAME_REGEX = /^[a-zA-Z .'-]+$/;

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
  const route = useRoute<any>();
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [savedEmail, setSavedEmail] = useState('');

  const d = route.params?.profile;

  const nameParts = (d?.name || '').trim().split(/\s+/);
  const initFirstName = d?.FirstName || nameParts[0] || '';
  const initLastName = d?.LastName || nameParts.slice(1).join(' ') || '';
  const initEmail = d?.email || d?.Email || '';
  const initPhone = d?.mobilenumber || d?.MobileNumber || '';
  const initAddress = d?.address || d?.Address || '';

  const { control, handleSubmit, watch, formState: { errors } } =
    useForm<EditProfileForm>({
      mode: 'onBlur',
      reValidateMode: 'onChange',
      defaultValues: {
        FirstName: initFirstName,
        LastName: initLastName,
        Email: initEmail,
        MobileNumber: initPhone,
        Address: initAddress,
      },
    });

  const firstNameVal = watch('FirstName');
  const lastNameVal = watch('LastName');

  useEffect(() => {
    setSavedName(`${initFirstName} ${initLastName}`.trim());
    setSavedEmail(initEmail);
    if (d?.image || d?.Image) {
      const imgPath = d.image || d.Image;
      if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
        setAvatarUri(imgPath);
      } else {
        setAvatarUri(`${Defaults.apis.baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`);
      }
    }
  }, []);

  // ── Image pick ─────────────────────────────────────────────────────────────
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      res => {
        const asset = res.assets?.[0];
        if (asset?.uri) { setAvatarUri(asset.uri); setImageError(false); }
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
      const address = data.Address.trim() || 'N/A';

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('mobilenumber', mobilenumber);
      formData.append('address', address);

      if (avatarUri && !avatarUri.startsWith('http://') && !avatarUri.startsWith('https://')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` :  `image/jpeg`;
        formData.append('image', {
          uri: Platform.OS === 'android' && !avatarUri.startsWith('file://') && !avatarUri.startsWith('content://')
            ? `file://${avatarUri}`
            : avatarUri,
          name: filename,
          type: type,
        } as any);
      }

      const res = await updateMyProfile(formData);
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
              {avatarUri && !imageError ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={s.avatarImg}
                  onError={() => setImageError(true)}
                />
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
                rules={{}}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={false}
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
                  validate: v => !v || v.length === 10 || 'Enter a valid 10-digit mobile number.',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Mobile Number"
                    value={value}
                    onChangeText={t => onChange(t.replace(/\D/g, '').slice(0, 10))}
                    onBlur={onBlur}
                    editable={false}
                    error={errors.MobileNumber?.message}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    maxLength={10}
                    IconComp={PhoneIcon}
                  />
                )}
              />
            </View>

            <Text style={s.sectionLabel}>Delivery Address</Text>
            <View style={s.card}>
              <Controller
                control={control}
                name="Address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.Address?.message}
                    autoCapitalize="sentences"
                    IconComp={AddressIcon}
                    hint="Street, city, pincode"
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
