const base = '/api/v1';
//  const domain = (__DEV__)?'api.ction.in':'api.ction.in';
 const domain = (__DEV__)?'dev.futurebelieve.in':'dev.futurebelieve.in';
// const domain = (__DEV__)?'192.168.29.12:5001':'192.168.29.12:5001';
// const domain = (__DEV__)?'192.168.29.243:5005':'192.168.29.243:5005';
import {name as appName} from '../../app.json';
const Defaults = {
  appName: appName,
  domain,
  defaultLocale: {
    lang: 'ta'
  },
  isDev:__DEV__,
  app: {
    platforms: ['ios', 'android'] 
  },
  apis: {
    api_key:264895216548969,
    baseUrl:`http${(__DEV__)?'s':'s'}://${domain}`,
    public: {
      base: `${base}`,
      backend: `${base}`
    },
    user: {
      apiPath:'/api/v1', 
      base: `${base}`,
      login: `${base}/Auth/Login`,
      signup: `${base}/Auth/Signup`,
      logout: `${base}/Logout`
    }
  }
};

export default Defaults;  
