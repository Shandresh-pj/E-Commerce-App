import React, { useState } from "react";
import {
  Keyboard,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Alert } from "react-native";
import styles from "../../assets/styles/styles";
import Logo from "../../assets/images/svg/login-logo.svg";
import EmailLeft from "../../assets/images/svg/email1.svg";
import authService from "../../../shared/services/auth.service";

function ForgotPassword(props: any) {
  const { navigation } = props;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      Alert.alert(
        "Success",
        "Password reset instructions have been sent to your email.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send reset email. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" hidden={false} backgroundColor="#2a2c40" translucent />
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
          style={styles.bakcgroundImage}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.loginWidth, { paddingHorizontal: 20, paddingVertical: 30 }]}>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "center",
                      width: 90,
                      height: 90,
                      marginBottom: 20,
                      backgroundColor: "rgba(255,255,255,1)",
                      padding: 20,
                      borderRadius: 20,
                    }}
                  >
                    <Logo />
                  </View>

                  <View style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: 20, borderRadius: 20 }}>
                    <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                      <Text style={styles.LoginTitle}>Forgot Password</Text>
                      <Text style={[styles.LoginSubTitle, { textAlign: "center" }]}>
                        Enter your email address and we'll send you instructions to reset your password.
                      </Text>
                    </View>

                    <View style={{ paddingTop: 20 }}>
                      {/* Email */}
                      <View style={styles.formgroup}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <Text style={styles.formlabel}>Email Address</Text>
                          {errors.email && (
                            <Text style={styles.errorMsg}>{errors.email.message as string}</Text>
                          )}
                        </View>
                        <View style={styles.inputContainer}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View
                              style={{
                                width: 40,
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 5,
                              }}
                            >
                              <EmailLeft />
                            </View>
                            <Controller
                              control={control}
                              name="email"
                              rules={{
                                required: "Email is required",
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
                      </View>

                      {/* Submit */}
                      <View style={[styles.formgroup, { marginTop: 10 }]}>
                        {loading ? (
                          <View
                            style={[
                              styles.btnPrimary,
                              { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center" },
                            ]}
                          >
                            <ActivityIndicator color="#fff" size={20} />
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.btnPrimary, { width: "100%" }]}
                            onPress={handleSubmit(onSubmit)}
                            accessibilityLabel="Send Reset Email"
                          >
                            <Text style={styles.btnTextWhite}>Send Reset Email</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={{ alignItems: "center" }}>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                          <Text style={[styles.formlabel, { color: "#fff" }]}>
                            Remember your password?{" "}
                            <Text style={{ fontWeight: "bold", color: "#fff" }}>Sign In</Text>
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

export default ForgotPassword;
