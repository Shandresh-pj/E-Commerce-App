import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  BackHandler,
  Modal,
  FlatList,
  ScrollView,
  Linking,
  AppState,
  AppStateStatus,
  Image,
} from 'react-native';

const APP_CARD_COLORS = ['#F7B731', '#4FC3F7', '#e91e63', '#7C4DFF', '#43B89C', '#FF7043'];
const extractPackageId = (url: string): string | null => {
  const match = url.match(/[?&]id=([^&]+)/);
  if (!match) return null;
  const id = match[1];
  // A valid package ID must contain at least one dot (e.g. com.foo.bar)
  return id.includes('.') ? id : null;
};

import { Controller, useForm } from 'react-hook-form';
import { signupAction } from '../../../shared/redux/actions/auth.action';
import styles from '../../assets/styles/styles';
import { EyeShow as PasswordView } from '../../assets/images/svg/Svg2/EyeShow';
import { EyeHide as PasswordHide } from '../../assets/images/svg/Svg2/EyeHide';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { handleApiError } from '../../../shared/utils/alertHelper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getData, getPublicData } from '../../../shared/services/main-service';
import Defaults from '../../../config/index';

function SignUp(props: any) {
  const { navigation, otherData, dispatch } = props;
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 24, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

  const [hidePass, setHidePass] = useState(true);
  const [hideConfirmPass, setHideConfirmPass] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(maxDate);
  const [countries, setCountries] = useState<any[]>([]);
  const [customerApps, setCustomerApps] = useState<any[]>([]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [languages, setLanguages] = useState<any[]>([]);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<any>(null);
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [stateSearch, setStateSearch] = useState('');

  useEffect(() => {
    fetchCountries();
    fetchLanguages();
    fetchState();

    // Prevent back action
    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    });

    const backAction = () => {
      return true; // Return true to prevent the back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  const fetchCountries = async () => {
    try {
      const response: any = await getData('/Country/All');
      const data =
        response?.data?.data?.data ||
        response?.data?.object?.data?.data ||
        response?.data?.data ||
        [];
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('fetchCountries error:', error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response: any = await getData('/Languages');
      const data =
        response?.data || response?.data?.object || response?.data || [];
      setLanguages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('fetchLanguages error:', error);
    }
  };

  const fetchState = async () => {
    try {
      const response: any = await getData('/State/All');
      const data =
        response?.data?.data?.data ||
        response?.data?.object?.data?.data ||
        response?.data?.data ||
        [];
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('fetchState error:', error);
    }
  };

  const filteredStates = states.filter(s =>
    (s.Name || s.StateName || s.stateName || s.name || '')
      .toLowerCase()
      .includes(stateSearch.toLowerCase()),
  );

  const filteredLanguages = languages.filter(l =>
    (l.Name || l.LanguageName || l.languageName || l.name || '')
      .toLowerCase()
      .includes(languageSearch.toLowerCase()),
  );

  const filteredCountries = countries.filter(c =>
    (c.Name || c.CountryName || c.countryName || c.name || '')
      .toLowerCase()
      .includes(countrySearch.toLowerCase()),
  );

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      // Store in API format: YYYY-MM-DD
      setValue('DOB', `${year}-${month}-${day}`, { shouldValidate: true });
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Name: '',
      Email: '',
      MobileNumber: '',
      Password: '',
      DOB: '',
      ConfirmPassword: '',
      ReferralCode: '',
      UserType: 'Student',
      CountryId: '',
      LanguagesId: '',
      Gender: '',
      District: '',
      AadharNumber: '',
      StateId: '',
    },
  });

  const passwordValue = watch('Password');

  const onSubmit = (data: any) => {
    const payload = { ...data };
    console.log('SignUp fields:', JSON.stringify(payload, null, 2));
    dispatch(signupAction(payload))
      .then(() => {
        navigation.navigate('Login');
      })
      .catch((error: any) => {
        handleApiError(error, 'Failed to sign up.');
      });
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor="#2a2c40"
        translucent
      />
      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/login-bg.jpg')}
          imageStyle={{ resizeMode: 'cover', alignSelf: 'flex-end' }}
          style={styles.bakcgroundImage}
        >
          <KeyboardAwareScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30 }}
              extraScrollHeight={20}
              enableOnAndroid={true}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Text style={styles.LoginTitle}>Sign Up</Text>
                <Text style={styles.LoginSubTitle}>
                  Create your account to continue
                </Text>
              </View>

              <View style={{ paddingVertical: 20 }}>
                {/* Name */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Full Name</Text>
                    {errors.Name && (
                      <Text style={styles.errorMsg}>
                        {errors.Name.message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="Name"
                        rules={{ required: 'Name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter your full name"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            autoCapitalize="words"
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Email (required) */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>
                      Email Address (Optional)
                    </Text>
                    {errors.Email && (
                      <Text style={styles.errorMsg}>
                        {errors.Email.message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="Email"
                        rules={{
                          pattern: {
                            value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address',
                          },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter your email"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Gender */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Gender</Text>
                    {errors.Gender && (
                      <Text style={styles.errorMsg}>
                        {(errors.Gender as any).message as string}
                      </Text>
                    )}
                  </View>
                  <Controller
                    control={control}
                    name="Gender"
                    rules={{ required: 'Gender is required' }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.inputContainer}
                          onPress={() => setGenderModalVisible(true)}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text
                              style={[
                                styles.inputStyle,
                                {
                                  flex: 1,
                                  paddingVertical: 12,
                                  color: value ? '#ffffff' : '#A6A7AE',
                                },
                              ]}
                            >
                              {value || 'Select your gender'}
                            </Text>
                            <Text style={{ marginRight: 12, color: '#A6A7AE' }}>
                              ▾
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <Modal
                          visible={genderModalVisible}
                          animationType="slide"
                          transparent
                          onRequestClose={() => setGenderModalVisible(false)}
                        >
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: '#fff',
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: 16,
                                  borderBottomWidth: 1,
                                  borderBottomColor: '#eee',
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    color: '#2a2c40',
                                  }}
                                >
                                  Select Gender
                                </Text>
                                <TouchableOpacity
                                  onPress={() => setGenderModalVisible(false)}
                                >
                                  <Text
                                    style={{ fontSize: 18, color: '#2a2c40' }}
                                  >
                                    ✕
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              {['Male', 'Female', 'Others'].map(g => (
                                <TouchableOpacity
                                  key={g}
                                  style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 18,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#f0f0f0',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                  onPress={() => {
                                    setSelectedGender(g);
                                    onChange(g);
                                    setGenderModalVisible(false);
                                  }}
                                >
                                  <Text
                                    style={{ color: '#2a2c40', fontSize: 15 }}
                                  >
                                    {g}
                                  </Text>
                                  {value === g && (
                                    <Text
                                      style={{ color: '#2a2c40', fontSize: 16 }}
                                    >
                                      ✓
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              ))}
                              <View style={{ height: 20 }} />
                            </View>
                          </View>
                        </Modal>
                      </>
                    )}
                  />
                </View>

                {/* Date of Birth */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Date of Birth</Text>
                    {errors.DOB && (
                      <Text style={styles.errorMsg}>
                        {errors.DOB.message as string}
                      </Text>
                    )}
                  </View>
                  <Controller
                    control={control}
                    name="DOB"
                    rules={{
                      required: 'Date of birth is required',
                      validate: (value) => {
                        if (!value) return true;
                        const dob = new Date(value);
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        const m = today.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                          age--;
                        }
                        if (age < 13 || age > 24) {
                          return 'Age must be between 13 and 24';
                        }
                        return true;
                      }
                    }}
                    render={({ field: { value } }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.inputContainer}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text
                            style={[
                              styles.inputStyle,
                              {
                                flex: 1,
                                paddingVertical: 12,
                                color: value ? '#ffffff' : '#A6A7AE',
                              },
                            ]}
                          >
                            {value
                              ? value.split('-').reverse().join('-')
                              : 'Select your date of birth'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                  {showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      minimumDate={minDate}
                      maximumDate={maxDate}
                    />
                  )}
                </View>

                {/* Country */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Country</Text>
                    {errors.CountryId && (
                      <Text style={styles.errorMsg}>
                        {(errors.CountryId as any).message as string}
                      </Text>
                    )}
                  </View>
                  <Controller
                    control={control}
                    name="CountryId"
                    rules={{ required: 'Country is required' }}
                    render={({ field: { onChange } }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.inputContainer}
                        onPress={() => {
                          setCountrySearch('');
                          setCountryModalVisible(true);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={[
                              styles.inputStyle,
                              {
                                flex: 1,
                                paddingVertical: 12,
                                color: selectedCountry ? '#ffffff' : '#A6A7AE',
                              },
                            ]}
                          >
                            {selectedCountry
                              ? `${selectedCountry.Flag || ''} ${
                                  selectedCountry.Name ||
                                  selectedCountry.CountryName ||
                                  selectedCountry.countryName ||
                                  selectedCountry.name
                                }`.trim()
                              : 'Select your country'}
                          </Text>
                          <Text style={{ marginRight: 12, color: '#A6A7AE' }}>
                            ▾
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Country Picker Modal */}
                <Modal
                  visible={countryModalVisible}
                  animationType="slide"
                  transparent
                  onRequestClose={() => setCountryModalVisible(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        maxHeight: '70%',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#2a2c40',
                          }}
                        >
                          Select Country
                        </Text>
                        <TouchableOpacity
                          onPress={() => setCountryModalVisible(false)}
                        >
                          <Text style={{ fontSize: 18, color: '#2a2c40' }}>
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                      >
                        <TextInput
                          placeholder="Search country..."
                          placeholderTextColor="#A6A7AE"
                          value={countrySearch}
                          onChangeText={setCountrySearch}
                          style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            color: '#000',
                          }}
                        />
                      </View>
                      <FlatList
                        data={filteredCountries}
                        keyExtractor={(item, index) =>
                          String(
                            item.Id ||
                              item.CountryId ||
                              item.countryId ||
                              item.id ||
                              index,
                          )
                        }
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: '#f0f0f0',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onPress={() => {
                              setSelectedCountry(item);
                              setValue(
                                'CountryId',
                                String(
                                  item.Id ||
                                    item.CountryId ||
                                    item.countryId ||
                                    item.id,
                                ),
                                { shouldValidate: true },
                              );
                              setCountryModalVisible(false);
                            }}
                          >
                            <Text
                              style={{
                                color: '#2a2c40',
                                fontSize: 15,
                                flex: 1,
                              }}
                            >
                              {item.Flag ? `${item.Flag}  ` : ''}
                              {item.Name ||
                                item.CountryName ||
                                item.countryName ||
                                item.name}
                            </Text>
                            {/* {item.DialCode ? (
                            <Text style={{ color: "#A6A7AE", fontSize: 14, marginLeft: 8 }}>{item.DialCode}</Text>
                          ) : null} */}
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                          <Text
                            style={{
                              textAlign: 'center',
                              padding: 20,
                              color: '#A6A7AE',
                            }}
                          >
                            No countries found
                          </Text>
                        }
                      />
                    </View>
                  </View>
                </Modal>

                {/* Mobile Number */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Mobile Number</Text>
                    {errors.MobileNumber && (
                      <Text style={styles.errorMsg}>
                        {errors.MobileNumber.message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      {selectedCountry?.DialCode ? (
                        <View
                          style={{
                            paddingHorizontal: 12,
                            borderRightWidth: 1,
                            borderRightColor: '#ddd',
                            justifyContent: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: '#2a2c40',
                              fontSize: 15,
                              fontWeight: '500',
                            }}
                          >
                            {selectedCountry.Flag
                              ? `${selectedCountry.Flag} `
                              : ''}
                            {selectedCountry.DialCode}
                          </Text>
                        </View>
                      ) : null}
                      <Controller
                        control={control}
                        name="MobileNumber"
                        rules={{
                          required: 'Mobile number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Enter a valid 10-digit mobile number',
                          },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter mobile number"
                            onBlur={onBlur}
                            onChangeText={text =>
                              onChange(text.replace(/[^0-9]/g, '').slice(0, 10))
                            }
                            value={value}
                            keyboardType="phone-pad"
                            maxLength={10}
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Aadhaar Number */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Aadhaar Number</Text>
                    {errors.AadharNumber && (
                      <Text style={styles.errorMsg}>
                        {(errors.AadharNumber as any).message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="AadharNumber"
                        rules={{
                          required: 'Aadhaar number is required',
                          pattern: {
                            value: /^[0-9]{12}$/,
                            message: 'Enter a valid 12-digit Aadhaar number',
                          },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter your 12-digit Aadhaar number"
                            onBlur={onBlur}
                            onChangeText={text =>
                              onChange(text.replace(/[^0-9]/g, '').slice(0, 12))
                            }
                            value={value}
                            keyboardType="number-pad"
                            maxLength={12}
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* State */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>State</Text>
                    {errors.StateId && (
                      <Text style={styles.errorMsg}>
                        {(errors.StateId as any).message as string}
                      </Text>
                    )}
                  </View>
                  <Controller
                    control={control}
                    name="StateId"
                    rules={{ required: 'State is required' }}
                    render={({ field: { onChange } }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.inputContainer}
                        onPress={() => {
                          setStateSearch('');
                          setStateModalVisible(true);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={[
                              styles.inputStyle,
                              {
                                flex: 1,
                                paddingVertical: 12,
                                color: selectedState ? '#ffffff' : '#A6A7AE',
                              },
                            ]}
                          >
                            {selectedState
                              ? selectedState.Name ||
                                selectedState.StateName ||
                                selectedState.stateName ||
                                selectedState.name
                              : 'Select your state'}
                          </Text>
                          <Text style={{ marginRight: 12, color: '#A6A7AE' }}>
                            ▾
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* State Picker Modal */}
                <Modal
                  visible={stateModalVisible}
                  animationType="slide"
                  transparent
                  onRequestClose={() => setStateModalVisible(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        maxHeight: '70%',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#2a2c40',
                          }}
                        >
                          Select State
                        </Text>
                        <TouchableOpacity
                          onPress={() => setStateModalVisible(false)}
                        >
                          <Text style={{ fontSize: 18, color: '#2a2c40' }}>
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                      >
                        <TextInput
                          placeholder="Search state..."
                          placeholderTextColor="#A6A7AE"
                          value={stateSearch}
                          onChangeText={setStateSearch}
                          style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            color: '#000',
                          }}
                        />
                      </View>
                      <FlatList
                        data={filteredStates}
                        keyExtractor={(item, index) =>
                          String(
                            item.Id ||
                              item.StateId ||
                              item.stateId ||
                              item.id ||
                              index,
                          )
                        }
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: '#f0f0f0',
                            }}
                            onPress={() => {
                              setSelectedState(item);
                              setValue(
                                'StateId',
                                String(
                                  item.Id ||
                                    item.StateId ||
                                    item.stateId ||
                                    item.id,
                                ),
                                { shouldValidate: true },
                              );
                              setStateModalVisible(false);
                            }}
                          >
                            <Text style={{ color: '#2a2c40', fontSize: 15 }}>
                              {item.Name ||
                                item.StateName ||
                                item.stateName ||
                                item.name}
                            </Text>
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                          <Text
                            style={{
                              textAlign: 'center',
                              padding: 20,
                              color: '#A6A7AE',
                            }}
                          >
                            No states found
                          </Text>
                        }
                      />
                    </View>
                  </View>
                </Modal>

                {/* District */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>District</Text>
                    {errors.District && (
                      <Text style={styles.errorMsg}>
                        {(errors.District as any).message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="District"
                        rules={{ required: 'District is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter your district"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            autoCapitalize="words"
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Language */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Language</Text>
                    {errors.LanguagesId && (
                      <Text style={styles.errorMsg}>
                        {(errors.LanguagesId as any).message as string}
                      </Text>
                    )}
                  </View>
                  <Controller
                    control={control}
                    name="LanguagesId"
                    rules={{ required: 'Language is required' }}
                    render={({ field: { onChange } }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.inputContainer}
                        onPress={() => {
                          setLanguageSearch('');
                          setLanguageModalVisible(true);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={[
                              styles.inputStyle,
                              {
                                flex: 1,
                                paddingVertical: 12,
                                color: selectedLanguage ? '#ffffff' : '#A6A7AE',
                              },
                            ]}
                          >
                            {selectedLanguage
                              ? selectedLanguage.NativeName ||
                                selectedLanguage.LanguageName ||
                                selectedLanguage.Name
                              : 'Select your language'}
                          </Text>
                          <Text style={{ marginRight: 12, color: '#A6A7AE' }}>
                            ▾
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Language Picker Modal */}
                <Modal
                  visible={languageModalVisible}
                  animationType="slide"
                  transparent
                  onRequestClose={() => setLanguageModalVisible(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        maxHeight: '70%',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#2a2c40',
                          }}
                        >
                          Select Language
                        </Text>
                        <TouchableOpacity
                          onPress={() => setLanguageModalVisible(false)}
                        >
                          <Text style={{ fontSize: 18, color: '#2a2c40' }}>
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                      >
                        <TextInput
                          placeholder="Search language..."
                          placeholderTextColor="#A6A7AE"
                          value={languageSearch}
                          onChangeText={setLanguageSearch}
                          style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            color: '#000',
                          }}
                        />
                      </View>
                      <FlatList
                        data={filteredLanguages}
                        keyExtractor={(item, index) =>
                          String(
                            item.Id ||
                              item.LanguageId ||
                              item.languageId ||
                              item.id ||
                              index,
                          )
                        }
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: '#f0f0f0',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onPress={() => {
                              setSelectedLanguage(item);
                              setValue(
                                'LanguagesId',
                                String(
                                  item.Id ||
                                    item.LanguageId ||
                                    item.languageId ||
                                    item.id,
                                ),
                                { shouldValidate: true },
                              );
                              setLanguageModalVisible(false);
                            }}
                          >
                            <Text
                              style={{
                                color: '#2a2c40',
                                fontSize: 15,
                                flex: 1,
                              }}
                            >
                              {item.NativeName || item.Name || 'N/A'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                          <Text
                            style={{
                              textAlign: 'center',
                              padding: 20,
                              color: '#A6A7AE',
                            }}
                          >
                            No languages found
                          </Text>
                        }
                      />
                    </View>
                  </View>
                </Modal>

                {/* Password */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Password</Text>
                    {errors.Password && (
                      <Text style={styles.errorMsg}>
                        {errors.Password.message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="Password"
                        rules={{
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter password"
                            secureTextEntry={hidePass}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                      <TouchableOpacity
                        onPress={() => setHidePass(!hidePass)}
                        style={{ marginRight: 12 }}
                      >
                        {hidePass ? <PasswordHide /> : <PasswordView />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Confirm Password</Text>
                    {errors.ConfirmPassword && (
                      <Text style={styles.errorMsg}>
                        {errors.ConfirmPassword.message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="ConfirmPassword"
                        rules={{
                          required: 'Please confirm your password',
                          validate: val =>
                            val === passwordValue || 'Passwords do not match',
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Re-enter password"
                            secureTextEntry={hideConfirmPass}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                      <TouchableOpacity
                        onPress={() => setHideConfirmPass(!hideConfirmPass)}
                        style={{ marginRight: 12 }}
                      >
                        {hideConfirmPass ? <PasswordHide /> : <PasswordView />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Referral Code */}
                <View style={styles.formgroup}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.formlabel}>Referral Code</Text>
                    {errors.ReferralCode && (
                      <Text style={styles.errorMsg}>
                        {errors.ReferralCode.message as string}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Controller
                        control={control}
                        name="ReferralCode"
                        rules={{ required: 'Referral code is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            style={[styles.inputStyle, { flex: 1 }]}
                            placeholder="Enter referral code"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            autoCapitalize="characters"
                            underlineColorAndroid="transparent"
                            placeholderTextColor="#A6A7AE"
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Submit */}
                <View style={[styles.formgroup, { marginTop: 10 }]}>
                  {otherData?.formSubmitted ? (
                    <View
                      style={[
                        styles.btnPrimary,
                        {
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <ActivityIndicator color="#fff" size={20} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.btnPrimary, { width: '100%' }]}
                      onPress={handleSubmit(onSubmit)}
                      accessibilityLabel="Sign Up"
                    >
                      <Text style={styles.btnTextWhite}>Sign Up</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ marginVertical: 10, alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={[styles.formlabel, { color: '#fff' }]}>
                      Already have an account?{' '}
                      <Text style={{ fontWeight: 'bold', color: '#fff' }}>
                        Login
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAwareScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

export default SignUp;
