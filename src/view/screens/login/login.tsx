import React, { useState, useEffect, useRef } from "react";
import {
  Keyboard, TouchableWithoutFeedback, Text, TouchableOpacity, View, StatusBar,
  KeyboardAvoidingView, Platform, TextInput, ImageBackground, ActivityIndicator,
  ScrollView, AppState, AppStateStatus, BackHandler, Linking, Image
} from "react-native";

import { Controller, useForm } from "react-hook-form";
import { loginAction } from "../../../shared/redux/actions/auth.action";
import styles from "../../assets/styles/styles";
import PasswordView from "../../assets/images/svg/Icon_eye_view.svg";
import PasswordHide from "../../assets/images/svg/Icon_eye_hide.svg";
import Logo from "../../assets/images/svg/login-logo.svg";
import PasswordLeft from "../../assets/images/svg/password.svg";
import EmailLeft from "../../assets/images/svg/email1.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { handleApiError } from "../../../shared/utils/alertHelper";
import { getData, postData } from "../../../shared/services/main-service";
import { isAppInstalled } from "../../../NativeModules/PackageChecker";
import Defaults from "../../../config/index";

const APP_CARD_COLORS = ['#F7B731', '#4FC3F7', '#e91e63', '#7C4DFF', '#43B89C', '#FF7043'];

const extractPackageId = (url: string): string | null => {
  const match = url.match(/[?&]id=([^&]+)/);
  if (!match) return null;
  const id = match[1];
  return id.includes('.') ? id : null;
};

const getAppImageUri = (path: string): string => {
  const normalized = path.replace(/\\/g, '/');
  if (normalized.startsWith('http')) return normalized;
  return `${Defaults.apis.baseUrl}/api/v1/${normalized.replace(/^\/+/, '')}`;
};

function Login(props: any) {
  const { navigation, otherData, dispatch } = props;
  const [hidePass, setHidePass] = useState(true);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      // Email: "",
      MobileNumber: "",
      Password: "",
      UserType: "Student",
    },
  });

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [customerApps, setCustomerApps] = useState<any[]>([]);
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>({});
  const [appsLoading, setAppsLoading] = useState(true);
  const customerAppsRef = useRef<any[]>([]);
  const initialInstallCheck = useRef(true);

  const installedCount = Object.values(installedApps).filter(Boolean).length;
  // Display only first 10 apps
  const appsToDisplay = customerApps.slice(0, 10);
  const requiredInstalls = 5;
  const allAppsInstalled = installedCount >= requiredInstalls;
  const appState = useRef(AppState.currentState);

  const reportInstalledApp = async (appId: string) => {
    try {
      await postData(`/CustomerApps/NonLog/Install/${appId}`, {});
      console.log(`Reported install for app ${appId}`);
    } catch (error) {
      console.log(`reportInstalledApp error for app ${appId}:`, error);
    }
  };

  const checkInstalledApps = async (apps?: any[]) => {
    const list = apps ?? customerAppsRef.current;
    if (!list.length) return;
    const results: Record<string, boolean> = {};
    await Promise.all(
      list.map(async (app: any) => {
        const packageId = extractPackageId(app.Url || '');
        results[String(app.Id)] = packageId ? await isAppInstalled(packageId) : false;
      }),
    );

    const newlyInstalled: string[] = [];
    setInstalledApps(prev => {
      const merged: Record<string, boolean> = {};
      Object.keys(results).forEach(id => {
        const installed = results[id];
        merged[id] = prev[id] === true ? true : installed;
        if (!prev[id] && installed && !initialInstallCheck.current) {
          newlyInstalled.push(id);
        }
      });
      return merged;
    });

    if (newlyInstalled.length) {
      newlyInstalled.forEach(reportInstalledApp);
    }
    if (initialInstallCheck.current) {
      initialInstallCheck.current = false;
    }
  };

  const handleInstall = (url: string) => {
    const packageId = extractPackageId(url);
    if (!packageId) {
      Linking.openURL(url).catch(() => {});
      return;
    }
    const marketUrl = `market://details?id=${packageId}`;
    Linking.canOpenURL(marketUrl)
      .then(supported => {
        const target = supported ? marketUrl : url;
        return Linking.openURL(target);
      })
      .catch(() => {
        Linking.openURL(url).catch(() => {});
      });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (currentStep === 2) { setCurrentStep(1); return true; }
        return false;
      },
    );
    fetchCustomerApps();
    checkInstalledApps();
    const appStateSub = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          setTimeout(() => checkInstalledApps(), 1500);
        }
        appState.current = nextState;
      },
    );
    return () => {
      backHandler.remove();
      appStateSub.remove();
    };
  }, []);

  const fetchCustomerApps = async () => {
    try {
      const response: any = await getData('/CustomerApps/NonLog/All');
      const data =
        response?.data?.data?.data ||
        response?.data?.object?.data?.data ||
        response?.data?.data ||
        [];
      const apps = Array.isArray(data) ? data : [];
      customerAppsRef.current = apps;
      setCustomerApps(apps);
      await checkInstalledApps(apps);
    } catch (error) {
      console.log('fetchCustomerApps error:', error);
    } finally {
      setAppsLoading(false);
    }
  };

  const onSubmit = (data: any) => {
    console.log('Login fields:', JSON.stringify(data, null, 2));
    dispatch(loginAction(data))
      .then(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      })
      .catch((error: any) => {
        handleApiError(error, "Failed to sign in.");
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <KeyboardAwareScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'center',
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {currentStep === 1 && (
                  <ScrollView
                    contentContainerStyle={{
                      paddingHorizontal: 20,
                      paddingBottom: 40,
                      paddingTop: 30,
                    }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                      <Text style={styles.LoginTitle}>Get Started 🎯</Text>
                      <Text
                        style={[
                          styles.LoginSubTitle,
                          { marginTop: 6, paddingHorizontal: 16 },
                        ]}
                      >
                        {appsLoading
                          ? 'Loading required apps...'
                          : `Install at least ${requiredInstalls} partner apps to unlock login`}
                      </Text>
                    </View>

                    {appsLoading && (
                      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                        <ActivityIndicator color="#e91e63" size="large" />
                      </View>
                    )}

                    {!appsLoading && appsToDisplay.length > 0 && (
                      <>
                        <View
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: 6,
                            height: 8,
                            marginBottom: 6,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              height: '100%',
                              width: `${Math.min(100, (installedCount / requiredInstalls) * 100)}%`,
                              backgroundColor: '#e91e63',
                              borderRadius: 6,
                            }}
                          />
                        </View>
                        <Text
                          style={[
                            styles.LoginSubTitle,
                            { textAlign: 'right', marginBottom: 20 },
                          ]}
                        >
                          {installedCount} / {requiredInstalls} installed
                        </Text>
                      </>
                    )}

                    {!appsLoading &&
                      appsToDisplay.map((app, index) => {
                        const appId = String(app.Id);
                        const done = !!installedApps[appId];
                        const cardColor =
                          APP_CARD_COLORS[index % APP_CARD_COLORS.length];
                        return (
                        <View
                          key={appId}
                          style={{
                            backgroundColor: done
                              ? 'rgba(67,184,156,0.12)'
                              : 'rgba(255,255,255,0.08)',
                            borderRadius: 14,
                            padding: 14,
                            marginBottom: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: done
                              ? 'rgba(67,184,156,0.45)'
                              : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              backgroundColor: cardColor + '33',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12,
                              borderWidth: 1,
                              borderColor: cardColor + '66',
                              overflow: 'hidden',
                            }}
                          >
                            {app.UploadImage && typeof app.UploadImage === 'string' && app.UploadImage.trim().length > 0 ? (
                              <Image
                                source={{ uri: getAppImageUri(app.UploadImage) }}
                                style={{ width: 36, height: 36, borderRadius: 8 }}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={{ fontSize: 22 }}>📱</Text>
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 14,
                                fontWeight: '700',
                                marginBottom: 2,
                              }}
                            >
                              {app.Title}
                            </Text>
                          </View>
                          {done ? (
                            <View
                              style={{
                                backgroundColor: '#43B89C',
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                              }}
                            >
                              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓ Done</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => handleInstall(app.Url)}
                              style={{
                                backgroundColor: '#e91e63',
                                borderRadius: 20,
                                paddingHorizontal: 14,
                                paddingVertical: 6,
                              }}
                            >
                              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Install</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                    {!appsLoading && (
                      <TouchableOpacity
                        style={[
                          styles.btnPrimary,
                          {
                            width: '100%',
                            marginTop: 12,
                            opacity: allAppsInstalled ? 1 : 0.4,
                          },  
                        ]}
                        onPress={!allAppsInstalled ? () => setCurrentStep(2) : undefined}
                        activeOpacity={allAppsInstalled ? 0.8 : 1}
                      >
                        <Text style={styles.btnTextWhite}>
                          {allAppsInstalled
                            ? 'Continue to Login'
                            : `Install ${
                                Math.max(0, requiredInstalls - installedCount)
                              } More App${
                                requiredInstalls - installedCount !== 1 ? 's' : ''
                              }`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={{ marginVertical: 16, alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={[styles.formlabel, { color: '#fff' }]}>
                          Don't have an account?{' '}
                          <Text style={{ fontWeight: 'bold', color: '#fff' }}>
                            Sign Up
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}

                {currentStep === 2 && (
                <View
                  style={[
                    styles.loginWidth,
                    { paddingHorizontal: 20, paddingVertical: 30 },
                  ]}
                >
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                      width: 90,
                      height: 90,
                      marginBottom: 20,
                      backgroundColor: 'rgba(255,255,255,1)',
                      padding: 20,
                      borderRadius: 20,
                    }}
                  >
                    <Logo />
                  </View>

                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: 20,
                      borderRadius: 20,
                    }}
                  >
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Text style={styles.LoginTitle}>Sign In</Text>
                      <Text style={styles.LoginSubTitle}>
                        Sign in to continue
                      </Text>
                    </View>

                    <View style={{ paddingTop: 20 }}>
                      {/* Email */}
                      {/* <View style={styles.formgroup}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <Text style={styles.formlabel}>Email</Text>
                          {errors.Email && <Text style={styles.errorMsg}>{errors.Email.message as string}</Text>}
                        </View>
                        <View style={styles.inputContainer}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ width: 40, justifyContent: "center", alignItems: "center", marginLeft: 5 }}>
                              <EmailLeft />
                            </View>
                            <Controller
                              control={control}
                              name="Email"
                              rules={{
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: "Enter a valid email address",
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
                      </View> */}

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
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                width: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 5,
                              }}
                            >
                              <EmailLeft />
                            </View>
                            <Controller
                              control={control}
                              name="MobileNumber"
                              rules={{
                                required: 'Mobile number is required',
                                pattern: {
                                  value: /^[0-9]{10}$/,
                                  message:
                                    'Enter a valid 10-digit mobile number',
                                },
                              }}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <TextInput
                                  style={[styles.inputStyle, { flex: 1 }]}
                                  placeholder="Enter mobile number"
                                  onBlur={onBlur}
                                  onChangeText={text =>
                                    onChange(
                                      text.replace(/[^0-9]/g, '').slice(0, 10),
                                    )
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
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                width: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 5,
                              }}
                            >
                              <PasswordLeft />
                            </View>
                            <Controller
                              control={control}
                              name="Password"
                              rules={{ required: 'Password is required' }}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <TextInput
                                  style={[styles.inputStyle, { flex: 1 }]}
                                  placeholder="Enter your password"
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

                      {/* Forgot Password */}
                      <View
                        style={{ alignItems: 'flex-end', marginBottom: 10 }}
                      >
                        <TouchableOpacity
                          onPress={() => navigation.navigate('ForgotPassword')}
                        >
                          <Text style={[styles.formlabel, { color: '#fff' }]}>
                            Forgot Password?
                          </Text>
                        </TouchableOpacity>
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
                            accessibilityLabel="Login"
                          >
                            <Text style={styles.btnTextWhite}>Sign In</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                          onPress={() => navigation.navigate('SignUp')}
                        >
                          <Text style={[styles.formlabel, { color: '#fff' }]}>
                            Don't have an account?{' '}
                            <Text style={{ fontWeight: 'bold', color: '#fff' }}>
                              Sign Up
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                )}
              </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

export default Login;
