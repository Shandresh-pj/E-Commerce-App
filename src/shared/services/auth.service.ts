import axios from "axios";
import Defaults from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeAsyncDataKey, setAsyncData } from "../utils/storage";

const HEADERS = { 'Content-Type': 'application/json', 'API_KEY': Defaults.apis.api_key };
const REQ_CONFIG = { headers: HEADERS, timeout: 15000 };

class AuthService {
  signup(data: any) {
    return axios.post(Defaults.apis.baseUrl + Defaults.apis.user.signup, data, REQ_CONFIG);
  }

  register(data: { name: string; email: string; password: string; mobilenumber: string }) {
    return axios.post(
      Defaults.apis.baseUrl + '/api/auth/register',
      data,
      REQ_CONFIG,
    ).catch(err => {
      // Fallback endpoint if without /api prefix
      return axios.post(
        Defaults.apis.baseUrl + '/auth/register',
        data,
        REQ_CONFIG,
      );
    });
  }

  loginNew(data: any) {
    return axios.post(Defaults.apis.baseUrl + Defaults.apis.user.login, data, REQ_CONFIG);
  }

  forgotPassword(data: any) {
    return axios.post(Defaults.apis.baseUrl + Defaults.apis.user.apiPath + '/Auth/Reset/Password', data, REQ_CONFIG);
  }

  sendOtp(email: string) {
    return axios.post(
      Defaults.apis.baseUrl + '/api/auth/send-otp',
      { email },
      REQ_CONFIG,
    ).catch(() => {
      return axios.post(
        Defaults.apis.baseUrl + '/auth/send-otp',
        { email },
        REQ_CONFIG,
      );
    });
  }

  verifyOtp(email: string, otp: string) {
    return axios.post(
      Defaults.apis.baseUrl + '/api/auth/verify-otp',
      { email, otp },
      REQ_CONFIG,
    ).catch(() => {
      return axios.post(
        Defaults.apis.baseUrl + '/auth/verify-otp',
        { email, otp },
        REQ_CONFIG,
      );
    });
  }

  googleLogin(data: { email: string; name?: string; idToken?: string }) {
    return axios.post(
      Defaults.apis.baseUrl + '/api/auth/google',
      data,
      REQ_CONFIG,
    ).catch(() => {
      return axios.post(
        Defaults.apis.baseUrl + '/auth/google',
        data,
        REQ_CONFIG,
      );
    });
  }

  logout() {
    AsyncStorage.removeItem("user");
    removeAsyncDataKey("user");
  }
}

export default new AuthService();
