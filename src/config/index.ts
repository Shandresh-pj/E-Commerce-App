const base = '/api';
//const domain = __DEV__ ? '192.168.29.229:3000' : '192.168.29.229:3000';
const domain = (__DEV__)? '192.168.29.229:3000': 'new-e-commerce-backend-xt4w.onrender.com';
import { name as appName } from '../../app.json';
const Defaults = {
  appName: appName,
  domain,
  defaultLocale: {
    lang: 'ta'
  },
  isDev: __DEV__,
  app: {
    platforms: ['ios', 'android']
  },      
  apis: {
    api_key: 264895216548969,
    baseUrl: `http${(__DEV__) ? '' : ''}://${domain}`,
    public: {
      base: `${base}`,
      backend: `${base}`
    },
    user: {
      apiPath: '/api',
      base: `${base}`,
      login: `${base}/Auth/Login`,
      signup: `${base}/Auth/Signup`,
      logout: `${base}/Logout`
    }
  }
};

export default Defaults;  
