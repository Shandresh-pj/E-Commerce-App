import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@svk_auth_token';
const REFRESH_TOKEN_KEY = '@svk_refresh_token';
const USER_KEY = '@svk_user_session';

export const SecureStorageService = {
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to store auth token securely', e);
    }
  },

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },

  async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {
      console.error('Failed to store refresh token securely', e);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (e) {
      console.error('Failed to clear secure session', e);
    }
  },
};

