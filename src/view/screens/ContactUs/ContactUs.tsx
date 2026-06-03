import React, { useState } from 'react';
import styles from './ContactUsStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../assets/styles/theme';
import {
  StatusBar,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert, // ← Added for user feedback
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { postData } from '../../../shared/services/main-service';
import UserIcon from '../../assets/images/svg/user-bar.svg';

interface ContactFormInputs {
  name: string;
  email: string;
  mobile: string;
  city: string;
  pincode: string;
  message: string;
}

export default function ContactUs() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormInputs>({
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      city: '',
      pincode: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormInputs) => {
    setIsLoading(true);

    const payload = {
      Name: data.name,
      Email: data.email,
      Phone: data.mobile,
      Subject: `${data.city} - ${data.pincode}`,
      Message: data.message,
    };

    try {
      const response: any = await postData('/ContactUs/Add', payload);
      console.log(response, 'response data');

      if (response.status == 200) {
        Alert.alert('Success', 'Your message has been sent successfully!');
        reset();
      } else {
        Alert.alert(
          'Error',
          response.message || 'Something went wrong. Please try again.',
        );
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert(
        'Error',
        'Failed to connect to server. Please check your internet connection.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" hidden={false} backgroundColor="#2a2c40" translucent />
      <SafeAreaView edges={["left", "right",]} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer());
              }}
            >
              <UserIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contact us</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                Contact us about anything related to our company services. We'll
                do our best to get back to you as soon as possible.
              </Text>

              {/* Name */}
              <View style={styles.formgroup}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: 'Name is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.inputStyle, errors.name ? styles.inputError : null]}
                        placeholder="Enter Name"
                        placeholderTextColor="#B0B0B0"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="words"
                      />
                    )}
                  />
                </View>
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.formgroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.inputStyle,
                          errors.email ? styles.inputError : null,
                        ]}
                        placeholder="Enter Email Address"
                        placeholderTextColor="#B0B0B0"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    )}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}

              </View>

              {/* Mobile */}
              <View style={styles.formgroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name="mobile"
                    rules={{
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10,12}$/,
                        message: 'Enter a valid mobile number',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.inputStyle,
                          errors.mobile ? styles.inputError : null,
                        ]}
                        placeholder="Enter Mobile Number"
                        placeholderTextColor="#B0B0B0"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                </View>
                {errors.mobile && (
                  <Text style={styles.errorText}>{errors.mobile.message}</Text>
                )}
              </View>

              {/* City */}
              <View style={styles.formgroup}>
                <Text style={styles.label}>City</Text>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name="city"
                    rules={{ required: 'City is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.inputStyle, errors.city ? styles.inputError : null]}
                        placeholder="Enter City"
                        placeholderTextColor="#B0B0B0"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="words"
                      />
                    )}
                  />
                </View>
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
                )}
              </View>
              {/* Pincode */}
              <View style={styles.formgroup}>
                <Text style={styles.label}>Pincode</Text>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name="pincode"
                    rules={{
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Enter a valid 6-digit pincode',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.inputStyle,
                          errors.pincode ? styles.inputError : null,
                        ]}
                        placeholder="Enter Pincode"
                        placeholderTextColor="#B0B0B0"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="numeric"
                        maxLength={6}
                      />
                    )}
                  />
                </View>
                {errors.pincode && (
                  <Text style={styles.errorText}>{errors.pincode.message}</Text>
                )}
              </View>
              {/* Message */}
              <View style={styles.formgroup}>
                <Text style={styles.label}>Message</Text>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name="message"
                    rules={{ required: 'Message is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.inputStyle,
                          styles.textArea,
                          errors.message ? styles.inputError : null,
                        ]}
                        placeholder="Enter your message"
                        placeholderTextColor="#B0B0B0"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    )}
                  />
                </View>
                {errors.message && (
                  <Text style={styles.errorText}>{errors.message.message}</Text>
                )}
              </View>
              {/* Send Button */}
              <TouchableOpacity
                style={[styles.sendButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Message</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </ImageBackground>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
