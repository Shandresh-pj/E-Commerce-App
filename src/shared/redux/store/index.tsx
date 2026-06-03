// import { applyMiddleware, createStore } from 'redux';
// import * as thunkMiddleware from 'redux-thunk';

// import reducers from '../reducers';

// let middlewares = [thunkMiddleware.default];
// // if (__DEV__) {
// //   const logger = require('redux-logger');
// //   const loggerMiddleware = logger.createLogger({
// //     duration: true,
// //   });
// //   middlewares = [...middlewares, loggerMiddleware];
// // }
// const store = createStore(reducers, applyMiddleware(...middlewares));

// export type AppDispatch = typeof store.dispatch;

// export type AppGetState = typeof store.getState;

// export default store;

// import { applyMiddleware, createStore } from 'redux';
// import * as thunkMiddleware from 'redux-thunk';

// import reducers from '../reducers';

// let middlewares = [thunkMiddleware.default];
// if (__DEV__) {
//   const logger = require('redux-logger');
//   const loggerMiddleware = logger.createLogger({
//     duration: true,
//   });
//   middlewares = [...middlewares, loggerMiddleware];
// }
// const store = createStore(reducers, applyMiddleware(...middlewares));

// export type AppDispatch = typeof store.dispatch;

// export type AppGetState = typeof store.getState;

// export default store;

import { configureStore } from '@reduxjs/toolkit'

import reducers from '../reducers';





// import SocketClient from "../../services/socket.service"

// import { socketMiddleware } from '../middleware';

import { initalStateAsync } from '../reducers/auth';
import combineReducers from '../reducers';

// const socketClient=new SocketClient()



let middlewares:any=[]; //,socketMiddleware(socketClient)

if (__DEV__) {

  const logger = require('redux-logger');

  const loggerMiddleware = logger.createLogger({

    duration: true,

  });

 // middlewares = [loggerMiddleware];  //...middlewares, 

}

// const store = createStore(reducers, applyMiddleware(...middlewares));

// const store = configureStore({reducer:reducers}); //, applyMiddleware(...middlewares)


const store = configureStore({
reducer: combineReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false, // Disable immutability check
      serializableCheck: true,
    }).concat(middlewares),
});
store.dispatch(initalStateAsync)

export type AppDispatch = typeof store.dispatch;



export type AppGetState = typeof store.getState;



export default store;