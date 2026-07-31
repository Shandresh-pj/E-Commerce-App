import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { useNavigation } from '@react-navigation/native'
import { postData } from '../../../shared/services/main-service'
import LinearGradient from 'react-native-linear-gradient'

interface ContactFormInputs {
  name: string
  email: string
  mobile: string
  city: string
  pincode: string
  message: string
}

const GlassField = ({ label, name, control, errors, rules, placeholder, keyboardType, autoCapitalize, maxLength }: any) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={[s.input, errors[name] && s.inputError]}
          placeholder={placeholder}
          placeholderTextColor="#9a9a9a"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
        />
      )}
    />
    {errors[name] && <Text style={s.errorText}>{errors[name].message}</Text>}
  </View>
)

export default function ContactUs() {
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormInputs>({
    defaultValues: { name: '', email: '', mobile: '', city: '', pincode: '', message: '' },
  })

  const onSubmit = async (data: ContactFormInputs) => {
    setIsLoading(true)
    const payload = {
      Name: data.name,
      Email: data.email,
      Phone: data.mobile,
      Subject: `${data.city} - ${data.pincode}`,
      Message: data.message,
    }
    try {
      const response: any = await postData('/ContactUs/Add', payload)
      if (response.status == 200) {
        Alert.alert('Success', 'Your message has been sent successfully!')
        reset()
      } else {
        Alert.alert('Error', response.message || 'Something went wrong.')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect. Please check your internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#F4F5F0', '#FFFCE8', '#E9EDEE']}
      locations={[0, 0.4, 1]}
      style={s.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="rgba(255,255,255,0.55)" />
      <SafeAreaView style={s.safe} edges={[]}>
        {/* Glass Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => (navigation as any).goBack()}
          >
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Contact Us</Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero */}
            <View style={s.hero}>
              <View style={s.heroIconBox}>
                <Text style={{ fontSize: 36 }}>💬</Text>
              </View>
              <Text style={s.heroTitle}>Get in Touch</Text>
              <Text style={s.heroSub}>
                Contact us about anything related to our services.{'\n'}
                We'll get back to you as soon as possible.
              </Text>
            </View>

            {/* Form Card */}
            <View style={s.formCard}>
              <GlassField
                label="Name"
                name="name"
                control={control}
                errors={errors}
                rules={{ required: 'Name is required' }}
                placeholder="Enter your name"
                autoCapitalize="words"
              />
              <GlassField
                label="Email Address"
                name="email"
                control={control}
                errors={errors}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <GlassField
                label="Mobile Number"
                name="mobile"
                control={control}
                errors={errors}
                rules={{
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9]{10,12}$/,
                    message: 'Enter a valid mobile number',
                  },
                }}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
              />
              <View style={s.rowFields}>
                <View style={{ flex: 1 }}>
                  <GlassField
                    label="City"
                    name="city"
                    control={control}
                    errors={errors}
                    rules={{ required: 'City is required' }}
                    placeholder="City"
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GlassField
                    label="Pincode"
                    name="pincode"
                    control={control}
                    errors={errors}
                    rules={{
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Enter 6-digit pincode',
                      },
                    }}
                    placeholder="Pincode"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* Message */}
              <View style={s.fieldWrap}>
                <Text style={s.label}>Message</Text>
                <Controller
                  control={control}
                  name="message"
                  rules={{ required: 'Message is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[s.input, s.textArea, errors.message && s.inputError]}
                      placeholder="Enter your message"
                      placeholderTextColor="#9a9a9a"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  )}
                />
                {errors.message && (
                  <Text style={s.errorText}>{errors.message.message}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[s.sendBtn, isLoading && s.sendBtnLoading]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.sendBtnText}>Send Message</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEA',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 17, color: '#141414' },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontFamily: 'DMSans-Bold',
    color: '#141414',
  },

  scrollContent: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: '#141414',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#8a8a8a',
    textAlign: 'center',
    lineHeight: 19,
  },

  formCard: {
    marginHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 4,
    marginBottom: 24,
  },

  rowFields: { flexDirection: 'row', gap: 12 },

  fieldWrap: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#9a9a9a',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#141414',
  },
  inputError: { borderColor: '#C0392B' },
  textArea: { height: 110, paddingTop: 12 },
  errorText: {
    fontSize: 11.5,
    color: '#C0392B',
    fontFamily: 'DMSans-Regular',
    marginTop: 4,
  },

  sendBtn: {
    backgroundColor: '#0C831F',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnLoading: { opacity: 0.7 },
  sendBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
})
