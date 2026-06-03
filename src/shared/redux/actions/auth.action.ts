import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  SET_MESSAGE,
} from '../constants/types';
import { Dispatch } from 'redux';
import AuthService from '../../services/auth.service';
import { setData } from './otherData.action';
import { setAsyncData, removeAsyncDataKey } from '../../utils/storage';
import { initalStateAsync } from '../reducers/auth';

export const logout = () => (dispatch: Dispatch) => {
  AuthService.logout();
  dispatch({ type: LOGOUT });
};

export const loadUser = () => (dispatch: Dispatch) => {
  return initalStateAsync(dispatch, null);
};

export const signupAction = (data: any) => (dispatch: Dispatch) => {
  (dispatch as any)(setData(true, 'formSubmitted'));
  return AuthService.signup(data).then(
    (response: any) => {
      dispatch({ type: REGISTER_SUCCESS });
      dispatch({
        type: SET_MESSAGE,
        payload: { message: response.data?.message || 'Registration successful', variant: 'success' },
      });
      (dispatch as any)(setData(false, 'formSubmitted'));
      return Promise.resolve(response);
    },
    (error: any) => {
      const message = error.response?.data?.message || error.message || error.toString();
      dispatch({ type: REGISTER_FAIL });
      dispatch({ type: SET_MESSAGE, payload: { message, variant: 'danger' } });
      (dispatch as any)(setData(false, 'formSubmitted'));
      return Promise.reject(error);
    },
  );
};

export const loginAction = (data: any) => (dispatch: Dispatch) => {
  (dispatch as any)(setData(true, 'formSubmitted'));
  return AuthService.loginNew(data).then(
    async (response: any) => {
      const userData = response.data?.response || response.data;
      if (userData) {
        await setAsyncData('user', userData);
        dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } });
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Login successful', variant: 'success' },
        });
      } else {
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Something went wrong', variant: 'danger' },
        });
      }
      (dispatch as any)(setData(false, 'formSubmitted'));
      return Promise.resolve(response);
    },
    (error: any) => {
      const message = error.response?.data?.message || error.message || error.toString();
      dispatch({ type: LOGIN_FAIL });
      dispatch({ type: SET_MESSAGE, payload: { message, variant: 'danger' } });
      (dispatch as any)(setData(false, 'formSubmitted'));
      return Promise.reject(error);
    },
  );
};
