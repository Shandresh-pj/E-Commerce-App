import React, { useState } from 'react'
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
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { updateMyProfile } from '../../../shared/services/main-service'
import { launchImageLibrary } from 'react-native-image-picker'
import Defaults from '../../../config'
import LinearGradient from 'react-native-linear-gradient'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={s.fieldWrap}>
    <Text style={s.fieldLabel}>{label}</Text>
    {children}
  </View>
)

const EditProfileScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const d = route.params?.profile ?? {}
console.log('ddd',d);

  const initName =
    d?.name ||
    `${d?.FirstName ?? ''}${d?.LastName ? ' ' + d.LastName : ''}`.trim()

  const [fullName, setFullName] = useState(initName)
  const [email, setEmail] = useState(d?.email || d?.Email || '')
  const [mobile, setMobile] = useState(d?.mobilenumber || d?.MobileNumber || '')
  const [saving, setSaving] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [avatarUri, setAvatarUri] = useState<string | null>(() => {
    const imgPath = d?.image || d?.Image
    if (!imgPath) return null
    return imgPath.startsWith('http')
      ? imgPath
      : `${Defaults.apis.baseUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
  })

  const initials = (fullName.trim()[0] || 'A').toUpperCase()

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      const asset = res.assets?.[0]
      if (asset?.uri) {
        setAvatarUri(asset.uri)
        setImageError(false)
      }
    })
  }

  const onSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', fullName.trim())
      formData.append('email', email.trim())
      formData.append('mobilenumber', mobile.trim())
      
      const addr = d?.address || d?.Address || 'N/A';
      formData.append('address', String(addr))

      if (avatarUri && !avatarUri.startsWith('http')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg'
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'
        formData.append('image', {
          uri:
            Platform.OS === 'android' && !avatarUri.startsWith('file://') && !avatarUri.startsWith('content://')
              ? `file://${avatarUri}`
              : avatarUri,
          name: filename,
          type,
        } as any)
      }

      const res = await updateMyProfile(formData)
      const status = res?.status
      const msg = res?.data?.message || (status === 200 || status === 201 ? 'Profile updated!' : 'Update failed.')
      if (status === 200 || status === 201) {
        Alert.alert('Success', msg, [{ text: 'OK', onPress: () => navigation.goBack() }])
      } else {
        Alert.alert('Error', msg)
      }
    } catch (e) {
      console.log('Update profile error:', e)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LinearGradient colors={['#FFF4C2', '#FFFCE8', '#EDEFEA']} locations={[0, 0.22, 1]} style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4C2" translucent={false} />
      <SafeAreaView style={s.safe} edges={[]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Edit profile</Text>
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Avatar */}
            <View style={s.avatarBlock}>
              <TouchableOpacity style={s.avatarWrap} onPress={pickImage} activeOpacity={0.85}>
                {avatarUri && !imageError ? (
                  <Image source={{ uri: avatarUri }} style={s.avatarImg} onError={() => setImageError(true)} />
                ) : (
                  <Text style={s.avatarText}>{initials}</Text>
                )}
                <View style={s.cameraBadge}><Text style={{ fontSize: 12 }}>📷</Text></View>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickImage}>
                <Text style={s.changePhoto}>Change photo</Text>
              </TouchableOpacity>
            </View>

            <Field label="NAME">
              <View style={s.inputBox}>
                <TextInput
                  style={s.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your name"
                  placeholderTextColor="#9a9a9a"
                  autoCapitalize="words"
                />
              </View>
            </Field>

            <Field label="MOBILE NUMBER">
              <View style={s.inputBox}>
                <TextInput
                  style={s.input}
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Mobile number"
                  placeholderTextColor="#9a9a9a"
                  keyboardType="phone-pad"
                />
              </View>
            </Field>

            <Field label="EMAIL">
              <View style={s.inputBox}>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  placeholderTextColor="#9a9a9a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </Field>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Save */}
          <View style={s.saveBar}>
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.7 }]}
              onPress={onSave}
              disabled={saving}
              activeOpacity={0.9}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save changes</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  backArrow: { fontSize: 18, color: '#141414' },
  headerTitle: { fontFamily: 'DMSans-Bold', fontSize: 24, color: '#141414', letterSpacing: -0.4 },

  scroll: { paddingHorizontal: 18, paddingTop: 8 },

  avatarBlock: { alignItems: 'center', paddingVertical: 14 },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarText: { fontFamily: 'DMSans-Bold', fontSize: 34, color: '#FFE000' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFCE8',
  },
  changePhoto: { fontFamily: 'DMSans-Bold', fontSize: 14, color: '#0C831F', marginTop: 10 },

  fieldWrap: { marginTop: 20 },
  fieldLabel: { fontFamily: 'DMSans-Bold', fontSize: 12, letterSpacing: 0.6, color: '#8a8a8a', marginBottom: 9 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#ECECE8',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputBoxLocked: { backgroundColor: 'rgba(255,255,255,0.45)' },
  input: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 15.5, color: '#141414', padding: 0 },
  lockedText: { flex: 1, fontFamily: 'DMSans-Bold', fontSize: 15.5, color: '#5a5a5a' },
  verifiedBadge: { backgroundColor: '#E4F6E6', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5 },
  verifiedText: { fontFamily: 'DMSans-Bold', fontSize: 10.5, color: '#0C831F', letterSpacing: 0.3 },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderPill: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5,
    borderColor: '#ECECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: { backgroundColor: '#141414', borderColor: '#141414' },
  genderText: { fontFamily: 'DMSans-Bold', fontSize: 15, color: '#5a5a5a' },
  genderTextActive: { color: '#fff' },

  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,240,236,0.9)',
    padding: 14,
    paddingBottom: 22,
  },
  saveBtn: {
    height: 56,
    backgroundColor: '#0C831F',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnText: { color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 17 },
})

export default EditProfileScreen
