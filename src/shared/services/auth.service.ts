import axios from "axios";
import Defaults from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeAsyncDataKey, setAsyncData } from "../utils/storage";

const HEADERS = { 'Content-Type': 'application/json', 'API_KEY': Defaults.apis.api_key };

class AuthService {
  signup(data: any) {
    return axios.post(Defaults.apis.baseUrl + Defaults.apis.user.signup, data, { headers: HEADERS });
  }

  loginNew(data: any) {
    return axios.post(Defaults.apis.baseUrl + Defaults.apis.user.login, data, { headers: HEADERS });
  }

  forgotPassword(data: any) {
    return axios.post(Defaults.apis.baseUrl + Defaults.apis.user.apiPath + '/Auth/Reset/Password', data, { headers: HEADERS });
  }

  logout() {
    AsyncStorage.removeItem("user");
    removeAsyncDataKey("user");
  }
}

export default new AuthService();
