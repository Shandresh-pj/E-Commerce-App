import { getAsyncData } from '../utils/storage';

export async function authHeader() {
  try {
    const user = await getAsyncData('user');
    const tok = user?.accessToken ?? user?.token ?? user?.user?.accessToken ?? user?.user?.token ?? '';
    if (tok && typeof tok === 'string' && tok.trim().length > 0) {
      const formattedToken = tok.startsWith('Bearer ') ? tok : 'Bearer ' + tok;
      return { Authorization: formattedToken };
    }
  } catch (e) {}
  return { Authorization: '' };
}

export async function authHeaderNew() {
  try {
    const user = await getAsyncData('user');
    const tok =
      user?.token ??
      user?.accessToken ??
      user?.jwt ??
      user?.user?.token ??
      user?.user?.accessToken ??
      '';
    if (tok && typeof tok === 'string' && tok.trim().length > 0) {
      const formattedToken = tok.startsWith('Bearer ') ? tok : 'Bearer ' + tok;
      return {
        Authorization: formattedToken,
      };
    }
  } catch (e) {
    console.log('authHeaderNew error:', e);
  }
  return { Authorization: '' };
}
