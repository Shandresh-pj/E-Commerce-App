import { configureStore } from '@reduxjs/toolkit'
import { initalStateAsync } from '../reducers/auth';
import combineReducers from '../reducers';

let middlewares: any = [];

if (__DEV__) {
  const logger = require('redux-logger');
  const loggerMiddleware = logger.createLogger({
    duration: true,
  });
  // middlewares = [loggerMiddleware];
}

const store = configureStore({
  reducer: combineReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false, // Disable immutability checks
      serializableCheck: true,
    }).concat(middlewares),
});

store.dispatch(initalStateAsync)

export type AppDispatch = typeof store.dispatch;
export type AppGetState = typeof store.getState;
export default store;