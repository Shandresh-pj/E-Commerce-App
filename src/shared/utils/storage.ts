import AsyncStorage from '@react-native-async-storage/async-storage';
export const setAsyncData = async (key: any, value: JSON) => {
    try {
      console.log("async value " + key, value);
      await AsyncStorage.setItem('@' + key, JSON.stringify(value))
    } catch (e) {
      console.log(`async error ${key} =`, e);
  
    }
  }
  
   export const getAsyncData = async (key: any) => {
    try {
      const jsonValue = await AsyncStorage.getItem('@' + key);
      return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
      console.log(`async error ${key} =`, e);
      return null;
    }
  }
  export const removeAsyncDataKey = async (key: any) => {
    try {
      console.log("async value " + key);
      await AsyncStorage.removeItem('@' + key)
    } catch (e) {
      // saving error
      console.log(`async error ${key} =`, e);
    }
  }