import { getAsyncData } from '../utils/storage';

import AuthService from "./auth.service";

var jwtDecode = require('jwt-decode');
export async  function  authHeader() {
  const user = await getAsyncData('user');

  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  } else {
    return {};
  }
}


export async function authHeaderNew() {  
const user =await getAsyncData('user');
console.log('useruseruser',user)
  if (user && user.token) {
    return {
      Authorization: user.token,
    };
  } else {
    return { Authorization: ''};
  } 
}  
