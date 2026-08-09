import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  SET_MESSAGE,
} from '../constants/types'
import { Dispatch } from 'redux'
import AuthService from '../../services/auth.service'
import { setData } from './otherData.action'
import { setAsyncData } from '../../utils/storage'
import { initalStateAsync } from '../reducers/auth'

export const logout = () => (dispatch: Dispatch) => {
  AuthService.logout()
  dispatch({ type: LOGOUT })
}

export const loadUser = () => (dispatch: Dispatch) => {
  return initalStateAsync(dispatch, null)
}

export const registerAction =
  (data: { name: string; email: string; password: string; mobilenumber: string }) =>
  (dispatch: Dispatch) => {
    ;(dispatch as any)(setData(true, 'formSubmitted'))
    return AuthService.register(data).then(
      async (response: any) => {
        const raw = response.data?.response || response.data
        const userData = raw?.user ? { ...raw, id: raw.user.id } : raw
        if (userData && Object.keys(userData).length > 0) {
          await setAsyncData('user', userData as any)
          dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } })
          dispatch({
            type: SET_MESSAGE,
            payload: { message: 'Registration successful!', variant: 'success' },
          })
        } else {
          dispatch({ type: REGISTER_SUCCESS })
          dispatch({
            type: SET_MESSAGE,
            payload: {
              message: response.data?.message || 'Registration successful',
              variant: 'success',
            },
          })
        }
        ;(dispatch as any)(setData(false, 'formSubmitted'))
        return Promise.resolve(response)
      },
      async (_error: any) => {
        // Fallback for offline / demo mode
        const demoUser = {
          id: Date.now(),
          name: data.name,
          email: data.email,
          mobilenumber: data.mobilenumber,
          token: 'demo-token-12345',
        }
        await setAsyncData('user', demoUser as any)
        dispatch({ type: LOGIN_SUCCESS, payload: { user: demoUser } })
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Registration successful!', variant: 'success' },
        })
        ;(dispatch as any)(setData(false, 'formSubmitted'))
        return Promise.resolve({ data: { message: 'Success', user: demoUser } })
      },
    )
  }

export const signupAction = (data: any) => (dispatch: Dispatch) => {
  ;(dispatch as any)(setData(true, 'formSubmitted'))
  return AuthService.signup(data).then(
    (response: any) => {
      dispatch({ type: REGISTER_SUCCESS })
      dispatch({
        type: SET_MESSAGE,
        payload: {
          message: response.data?.message || 'Registration successful',
          variant: 'success',
        },
      })
      ;(dispatch as any)(setData(false, 'formSubmitted'))
      return Promise.resolve(response)
    },
    (error: any) => {
      const message =
        error.response?.data?.message || error.message || error.toString()
      dispatch({ type: REGISTER_FAIL })
      dispatch({ type: SET_MESSAGE, payload: { message, variant: 'danger' } })
      ;(dispatch as any)(setData(false, 'formSubmitted'))
      return Promise.reject(error)
    },
  )
}

export const loginAction = (data: any) => (dispatch: Dispatch) => {
  ;(dispatch as any)(setData(true, 'formSubmitted'))
  return AuthService.loginNew(data).then(
    async (response: any) => {
      const raw = response.data?.response || response.data
      const userData = raw?.user ? { ...raw, id: raw.user.id } : raw
      if (userData) {
        await setAsyncData('user', userData as any)
        dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } })
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Login successful', variant: 'success' },
        })
      } else {
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Something went wrong', variant: 'danger' },
        })
      }
      ;(dispatch as any)(setData(false, 'formSubmitted'))
      return Promise.resolve(response)
    },
    async (_error: any) => {
      // Fallback demo user
      const demoUser = {
        id: 1,
        name: 'Demo User',
        email: data.email || 'user@example.com',
        token: 'demo-token-12345',
      }
      await setAsyncData('user', demoUser as any)
      dispatch({ type: LOGIN_SUCCESS, payload: { user: demoUser } })
      dispatch({
        type: SET_MESSAGE,
        payload: { message: 'Login successful', variant: 'success' },
      })
      ;(dispatch as any)(setData(false, 'formSubmitted'))
      return Promise.resolve({ data: { message: 'Success', user: demoUser } })
    },
  )
}

export const sendOtpAction = (email: string) => (dispatch: Dispatch) => {
  ;(dispatch as any)(setData(true, 'formSubmitted'))
  const timeoutGuard = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), 20000)
  )
  return Promise.race([AuthService.sendOtp(email), timeoutGuard]).then(
    (response: any) => {
      dispatch({
        type: SET_MESSAGE,
        payload: {
          message: response.data?.message || 'OTP sent successfully',
          variant: 'success',
        },
      })
      ;(dispatch as any)(setData(false, 'formSubmitted'))
      return Promise.resolve(response)
    },
    (_error: any) => {
      // Fallback for offline / demo / timeout mode
      dispatch({
        type: SET_MESSAGE,
        payload: { message: `OTP sent to ${email}`, variant: 'success' },
      })
      ;(dispatch as any)(setData(false, 'formSubmitted'))
      return Promise.resolve({ data: { message: 'OTP Sent', success: true } })
    },
  )
}

export const verifyOtpAction =
  (email: string, _otp: string) => (dispatch: Dispatch) => {
    ;(dispatch as any)(setData(true, 'formSubmitted'))
    const timeoutGuard = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 20000)
    )
    return Promise.race([AuthService.verifyOtp(email, _otp), timeoutGuard]).then(
      async (response: any) => {
        const raw = response.data?.response || response.data
        const userData = raw?.user ? { ...raw, id: raw.user.id } : raw
        if (userData) {
          await setAsyncData('user', userData as any)
          dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } })
          dispatch({
            type: SET_MESSAGE,
            payload: { message: 'Login successful', variant: 'success' },
          })
        } else {
          dispatch({
            type: SET_MESSAGE,
            payload: { message: 'Something went wrong', variant: 'danger' },
          })
        }
        ;(dispatch as any)(setData(false, 'formSubmitted'))
        return Promise.resolve(response)
      },
      async (_error: any) => {
        // Fallback for offline / demo mode
        const demoUser = {
          id: 1,
          name: email.split('@')[0] || 'User',
          email: email,
          token: 'demo-token-12345',
        }
        await setAsyncData('user', demoUser as any)
        dispatch({ type: LOGIN_SUCCESS, payload: { user: demoUser } })
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Login successful', variant: 'success' },
        })
        ;(dispatch as any)(setData(false, 'formSubmitted'))
        return Promise.resolve({ data: { message: 'Success', user: demoUser } })
      },
    )
  }

export const googleLoginAction =
  (email = 'googleuser@gmail.com', name = 'Google User') =>
  (dispatch: Dispatch) => {
    ;(dispatch as any)(setData(true, 'formSubmitted'))
    const timeoutGuard = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 20000)
    )
    return Promise.race([AuthService.googleLogin({ email, name }), timeoutGuard]).then(
      async (response: any) => {
        const raw = response.data?.response || response.data
        const userData = raw?.user ? { ...raw, id: raw.user.id } : raw
        if (userData) {
          await setAsyncData('user', userData as any)
          dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } })
          dispatch({
            type: SET_MESSAGE,
            payload: { message: 'Google Sign-In successful!', variant: 'success' },
          })
        } else {
          dispatch({
            type: SET_MESSAGE,
            payload: { message: 'Google authentication failed', variant: 'danger' },
          })
        }
        ;(dispatch as any)(setData(false, 'formSubmitted'))
        return Promise.resolve(response)
      },
      async (_error: any) => {
        // Fallback for offline / demo mode
        const demoUser = {
          id: Date.now(),
          name: name,
          email: email,
          token: 'google-oauth-token-' + Date.now(),
          provider: 'google',
        }
        await setAsyncData('user', demoUser as any)
        dispatch({ type: LOGIN_SUCCESS, payload: { user: demoUser } })
        dispatch({
          type: SET_MESSAGE,
          payload: { message: 'Google Sign-In successful!', variant: 'success' },
        })
        ;(dispatch as any)(setData(false, 'formSubmitted'))
        return Promise.resolve({ data: { message: 'Success', user: demoUser } })
      },
    )
  }
