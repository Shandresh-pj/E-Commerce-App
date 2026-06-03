/**
 * This file includes all the reducers under reducers directory,
 * Import all and add to combineReducers to use any among whole app
 */
// import { combineReducers } from 'redux';

import app from './app';
import auth from "./auth";
import message from "./message";
import otherData from "./otherData";



const  combineReducers ={

  app,

  auth,

  messages:message,

  otherData,

 // socketData:socketReducer

};

export default combineReducers;