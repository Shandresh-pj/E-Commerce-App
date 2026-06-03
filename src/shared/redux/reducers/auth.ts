import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
  } from "../constants/types";

  import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAsyncData } from "../../utils/storage";
  // import { tabbedNavigation,showLogin } from "../../../navigators/navigation";
  //const user = JSON.parse( await AsyncStorage.getItem('user') || '{}');
  // var user=  AsyncStorage.getItem('user').then((val)=>{
  //   return JSON.parse( val || '{}');
  //  // return user;
  //   //console.log('val',user)
  // });
  // var getUser= async()=>{
  //   return await AsyncStorage.getItem('user');
  // }
  // console.log('useruser',user, getUser())
  //const user = JSON.parse(localStorage.getItem("user")||'{}');
  var user= {}
  const initialState = user  && Object.keys(user).length > 0
    ? { isLoggedIn: true, user }
    : { isLoggedIn: false, user: null };
  
  export default  function  authReducers(state = initialState, action:any) {
    const { type, payload } = action;
  
    switch (type) {
      case REGISTER_SUCCESS:
        return {
          ...state,
          isLoggedIn: false,
        };
      case REGISTER_FAIL:
        return {
          ...state,
          isLoggedIn: false,
        };
      case LOGIN_SUCCESS:
        //tabbedNavigation();
        return {
          ...state,
          isLoggedIn: true,
          user: payload.user,
        };
      case LOGIN_FAIL:
        return {
          ...state,
          isLoggedIn: false,
          user: null,
        };
      case LOGOUT:
        //showLogin();
        return {
          ...state,
          isLoggedIn: false,
          user: null,
        };
      default:
          return state;
    }
  };

  export async function initalStateAsync(dispatch:any, getState:any) {
    const user = await getAsyncData('user');
    dispatch({ type: user  && Object.keys(user).length > 0?LOGIN_SUCCESS:LOGOUT, payload: {user:user} })
  }