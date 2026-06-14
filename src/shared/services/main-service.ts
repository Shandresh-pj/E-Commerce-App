import axios from 'axios';
import { authHeaderNew } from '../services/auth-header';
import Defaults from '../../config';
import { getAsyncData } from '../utils/storage';
import { Alert, Platform } from 'react-native';
import RootNavigation from '../../navigation/RootNavigation';
import authService from './auth.service';

// ─── Task Submission Types ────────────────────────────────────────────────────
export interface TaskSubmissionAsset {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;   // MIME type e.g. 'video/mp4', 'image/jpeg'
  duration?: number;
}

export interface TaskSubmissionResult {
  success: boolean;
  status: number;
  data: any;
  message?: string;
}

/**
 * Uploads image/video to /PartakeTask/Submissions/{taskId}.
 * Retries up to `maxRetries` times on network errors with exponential back-off.
 */
export const submitTaskEntry = async (
  taskId: string,
  assets: { video?: TaskSubmissionAsset; photo?: TaskSubmissionAsset },
  onProgress?: (percent: number) => void,
  maxRetries = 3,
): Promise<TaskSubmissionResult> => {
  const endpoint = `/PartakeTask/Submit/${taskId}`;

  const buildFormData = (): FormData => {
    const formData = new FormData();

    if (assets.video) {
      const v = assets.video;
      const ext = v.uri.split('.').pop()?.toLowerCase() || 'mp4';
      const mimeType = v.type || 'video/mp4';
      formData.append('MediaUrl', {
        uri: Platform.OS === 'android' && !v.uri.startsWith('file://') && !v.uri.startsWith('content://')
          ? `file://${v.uri}`
          : v.uri,
        name: v.fileName || `task_video_${Date.now()}.${ext}`,
        type: mimeType,
      } as any);
    }

    if (assets.photo) {
      const p = assets.photo;
      const ext = p.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = p.type || (ext === 'png' ? 'image/png' : 'image/jpeg');
      formData.append('MediaUrl', {
        uri: Platform.OS === 'android' && !p.uri.startsWith('file://') && !p.uri.startsWith('content://')
          ? `file://${p.uri}`
          : p.uri,
        name: p.fileName || `task_photo_${Date.now()}.${ext}`,
        type: mimeType,
      } as any);
    }

    formData.append('taskId', taskId);
    return formData;
  };

  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const formData = buildFormData();

      console.log(
        `[submitTaskEntry] Attempt ${attempt}/${maxRetries} → POST ${endpoint}`,
      );

      // Using the XHR postFormData method for real-time progress events
      const result = await postFormData(endpoint, formData, onProgress);

      console.log('[submitTaskEntry] Response:', JSON.stringify(result.data));

      const isSuccess = result.status >= 200 && result.status < 300;
      if (isSuccess) {
        onProgress?.(100);
      }

      return {
        success: isSuccess,
        status: result.status,
        data: result.data,
        message: result.data?.message || (isSuccess ? 'Submission successful' : 'Submission failed'),
      };
    } catch (error: any) {
      lastError = error;
      console.log(
        `[submitTaskEntry] Attempt ${attempt} failed:`,
        error?.message
      );

      if (attempt >= maxRetries) {
        break;
      }

      // Exponential back-off: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`[submitTaskEntry] Retrying in ${delay}ms...`);
      await new Promise<void>(resolve => setTimeout(resolve, delay));
    }
  }

  console.log('[submitTaskEntry] All attempts exhausted. Last error:', lastError);
  return {
    success: false,
    status: lastError?.status || 0,
    data: lastError?.data || null,
    message: lastError?.message || 'Network error. Please check your connection and try again.',
  };
};

/**
 * Submits a contest entry to /ContestSubmission/Add.
 */
export const submitContestEntry = async (
  contestId: string,
  file: TaskSubmissionAsset,
  type: string,
  title: string,
  description: string,
  onProgress?: (percent: number) => void,
): Promise<TaskSubmissionResult> => {
  try {
    const endpoint = `/ContestSubmission/Add`;
    const formData = new FormData();

    formData.append('ContestId', contestId);
    formData.append('SubmissionText', title || '');
    formData.append('Description', description || '');

    // Capitalize Type (e.g., 'image' -> 'Image')
    const displayType = type.charAt(0).toUpperCase() + type.slice(1);
    formData.append('Type', displayType);

    if (file) {
      console.log('submitContestEntry: Raw File URI =', file.uri);
      const ext = file.uri.split('.').pop()?.toLowerCase() || 'jpg';
      let mimeType = file.type;
      if (!mimeType) {
        if (type === 'image') mimeType = `image/${ext === 'png' ? 'png' : 'jpeg'}`;
        else if (type === 'video') mimeType = 'video/mp4';
        else if (type === 'audio') mimeType = 'audio/mpeg';
      }

      const resolvedUri = Platform.OS === 'android' && !file.uri.startsWith('file://') && !file.uri.startsWith('content://')
        ? `file://${file.uri}`
        : file.uri;

      console.log('submitContestEntry: Resolved File URI =', resolvedUri, 'MIME =', mimeType);

      formData.append('SubmissionFile', {
        uri: resolvedUri,
        name: file.fileName || `submission_${Date.now()}.${ext}`,
        type: mimeType || 'application/octet-stream',
      } as any);
    }

    const result = await postFormData(endpoint, formData, onProgress);

    const isSuccess = result.status >= 200 && result.status < 300;
    return {
      success: isSuccess,
      status: result.status,
      data: result.data,
      message: result.data?.message || (isSuccess ? 'Submission successful' : 'Submission failed'),
    };
  } catch (error: any) {
    console.error('submitContestEntry error:', error);
    return {
      success: false,
      status: 0,
      data: null,
      message: error?.message || 'Failed to submit entry. Please try again.',
    };
  }
};

export const uploadVideo = async (
  url: string,
  videoUri: string,
  onProgress?: (progress: number) => void,
  caption?: string,
  audioMeta?: { audioUri: string; audioName: string; originalVolume: number; bgVolume: number },
  mediaType?: 'video' | 'photo',
): Promise<any> => {
  try {
    const formData = new FormData();
    if (mediaType === 'photo') {
      const ext = videoUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      formData.append('image', {
        uri: videoUri,
        name: `post_${Date.now()}.${ext}`,
        type: mimeType,
      } as any);
    } else {
      formData.append('video', {
        uri: videoUri,
        name: `selfie_${Date.now()}.mp4`,
        type: 'video/mp4',
      } as any);
    }
    if (caption) {
      formData.append('caption', caption);
    }
    if (audioMeta) {
      formData.append('audio', {
        uri: audioMeta.audioUri,
        name: audioMeta.audioName,
        type: 'audio/mpeg',
      } as any);
      formData.append('originalVolume', String(audioMeta.originalVolume));
      formData.append('bgVolume', String(audioMeta.bgVolume));
    }

    onProgress?.(10);
    const result = await postFormData(url, formData);
    onProgress?.(100);

    return result;
  } catch (error) {
    console.log('uploadVideo error', error);
    throw error;
  }
};


const API_URL = Defaults.apis.baseUrl + Defaults.apis.public.base;

export const getData = async (url: string): Promise<any | void> => {
  console.log("API_URL", `${API_URL}${url}`)
  try {
    const result: any = await axios({
      method: 'GET',
      url: `${API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      headers: { "Access-Control-Allow-Origin": "*", ...await authHeaderNew() },
    });
    console.log("result", result)
    return result;
  } catch (error) {
    console.log('getErr', error);
  }
};

export const getPublicData = async (url: string): Promise<any | void> => {
  console.log("API_URL (public)", `${API_URL}${url}`)
  try {
    const result: any = await axios({
      method: 'GET',
      url: `${API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      headers: { 'Content-Type': 'application/json', 'API_KEY': Defaults.apis.api_key, 'Authorization': `Bearer ${Defaults.apis.api_key}` },
    });
    console.log('result getPublicData', result);
    return result;

  } catch (error) {
    console.log('getPublicDataErr', error);
  }
};


export const postData = async (url: string, data: any): Promise<string | void> => {
  try {
    const result: any = await axios({
      method: "POST",
      url: `${API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      data: data,
      headers: { ...await authHeaderNew() },
    });
    return result;
  } catch (error) {
    console.log('postErr', error);
  }
};

/**
 * Robust multipart/form-data upload using fetch.
 * fetch automatically sets the boundary for FormData.
 */
export const postFormData = async (
  url: any,
  data: any,
  onProgress?: (percent: number) => void
): Promise<any> => {
  try {
    const fullUrl = `${API_URL}${url}`;
    console.log('postFormData Fetch posting to:', fullUrl);

    if (data && data._parts) {
      console.log('postFormData FormData parts detail:', JSON.stringify(data._parts));
    }

    const headers = {
      'API_KEY': String(Defaults.apis.api_key),
      ...await authHeaderNew(),
    };

    onProgress?.(30);
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: data,
      headers,
    });

    onProgress?.(90);
    const text = await response.text();
    console.log('postFormData Fetch response status:', response.status, 'body:', text);

    let resultData = null;
    try {
      resultData = JSON.parse(text);
    } catch {
      resultData = text;
    }

    return {
      status: response.status,
      data: resultData,
      ok: response.ok,
    };
  } catch (error) {
    console.error('postFormData Fetch error:', error);
    throw error;
  }
};

export const putData = async (url: string, data: any): Promise<any | void> => {
  try {
    const result: any = await axios({
      method: "PUT",
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      data,
      headers: { 'Content-Type': 'application/json', ...await authHeaderNew() },
    });
    return result;
  } catch (error) {
    console.log('putErr', error);
  }
};

export const patchData = async (url: string, data: any): Promise<any | void> => {
  try {
    const result: any = await axios({
      method: "PATCH",
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      data,
      headers: { 'Content-Type': 'application/json', ...await authHeaderNew() },
    });
    return result;
  } catch (error) {
    console.log('patchErr', error);
  }
};

export const putFormData = async (url: string, data: any): Promise<any> => {
  try {
    const fullUrl = `${API_URL}${url}`;
    const headers = {
      'API_KEY': String(Defaults.apis.api_key),
      ...await authHeaderNew(),
    };
    const response = await fetch(fullUrl, {
      method: 'PUT',
      body: data,
      headers,
    });
    const text = await response.text();
    let resultData = null;
    try { resultData = JSON.parse(text); } catch { resultData = text; }
    return { status: response.status, data: resultData, ok: response.ok };
  } catch (error) {
    console.error('putFormData error:', error);
    throw error;
  }
};

export const deleteData = async (url: string, data: any): Promise<string | void> => {
  try {
    const result: any = await axios({
      method: "DELETE",
      url: `${API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      data: data,
      headers: { ...await authHeaderNew() },
    });
    return result;
  } catch (error) {
    console.log('deleteErr', error);
  }
};

// --- Centralized API Methods ---

/**
 * Fetches the current user's profile details from /profile/all.
 */
export const fetchMyProfile = async (): Promise<any> => {
  try {
    const response = await getData('/profile/all');
    const list = response?.data?.data || response?.data?.object?.data || response?.data || null;
    if (Array.isArray(list)) {
      const stored = await getAsyncData('user');
      const userId = stored?.user?.id || stored?.id || stored?.Id || stored?.userId;
      if (userId) {
        return list.find((p: any) => p.id === userId || p.Id === userId) ?? list[0] ?? null;
      }
      return list[0] ?? null;
    }
    return list;
  } catch (error) {
    console.log('fetchMyProfile error:', error);
    return null;
  }
};

/**
 * Updates the current user's profile via PUT /profile/{id}. Accepts FormData for image uploads.
 */
export const updateMyProfile = async (formData: FormData): Promise<{ status: number; data: any } | null> => {
  try {  
    const stored = await getAsyncData('user');
    let userId = stored?.user?.id || stored?.id || stored?.Id || stored?.userId;

    if (!userId) {
      // Fallback: fetch profile list and match by stored email
      const email = stored?.user?.email || stored?.email || stored?.Email;
      const res = await getData('/profile/all');
      const list = res?.data?.data || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        const match = email
          ? list.find((p: any) => p.email === email)
          : list[0];
        userId = match?.id ?? list[0]?.id;
      }
    }

    if (!userId) {
      console.log('updateMyProfile: no user id found');
      return null;
    }
    const response = await putFormData(`/profile/${userId}`, formData);
    return response;
  } catch (error) {
    console.log('updateMyProfile error:', error);
    return null;
  }
};

/**
 * Fetches the user's wishlist items.
 */
export const fetchMyWishlist = async (): Promise<any[]> => {
  try {
    const response: any = await getData('/Product/GetMyWishlist');
    if (response && response.status) {
      return response.data?.data?.data || response.data?.data || [];
    }
    return [];
  } catch (error) {
    console.log('fetchMyWishlist error:', error);
    return [];
  }
};

/**
 * Toggles a product in the wishlist (Add/Remove).
 */
export const toggleWishlist = async (productId: number, isLiked: boolean): Promise<boolean> => {
  try {
    const response: any = isLiked
      ? await deleteData(`/Product/Wishlist/${productId}`, {})
      : await postData(`/Product/Wishlist/${productId}`, {});

    return !!(response && response.status);
  } catch (error) {
    console.log('toggleWishlist error:', error);
    return false;
  }
};

/**
 * Fetches products with pagination.
 * @param currentPage - page number (1-indexed)
 * @param pageSize - number of items per page (default 50)
 * @returns object with `items` array, `totalPages`, `totalCount`, and `currentPage`
 */
export const fetchAllProducts = async (
  currentPage: number = 1,
  pageSize: number = 50,
): Promise<{ items: any[]; totalPages: number; totalCount: number; currentPage: number }> => {
  try {
    const maxPages = Math.ceil(500 / pageSize); // reasonable upper bound
    const url = `/Product/All?currentPage=${currentPage}&pageSize=${pageSize}&maxPages=${maxPages}`;
    const response = await getData(url);
    console.log("API Product page", currentPage, response);
    if (response && response.status) {
      const responseData = response.data?.data || response.data || {};
      const items = responseData?.data || responseData?.items || responseData?.Items || [];
      const totalPages = responseData?.totalPages || responseData?.TotalPages || 1;
      const totalCount = responseData?.totalCount || responseData?.TotalCount || items.length;
      return {
        items: Array.isArray(items) ? items : [],
        totalPages,
        totalCount,
        currentPage,
      };
    }
    return { items: [], totalPages: 1, totalCount: 0, currentPage };
  } catch (error) {
    console.log('fetchAllProducts error:', error);
    return { items: [], totalPages: 1, totalCount: 0, currentPage };
  }
};

export const privatePostData = async (url: any, data: any): Promise<string | void> => {

  try {
    const result: any = await axios({
      method: "POST",
      url: `${API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      data: data, // data can be `string` or {object}! 
      headers: { 'Content-Type': 'application/json', ...await authHeaderNew(), 'API_KEY': Defaults.apis.api_key },
    });
    return result;
  } catch (error) {
  }
};

export const publicPostData = async (url: any, data: any): Promise<string | void> => {

  try {
    console.log(`${API_URL}${url}`)
    const result: any = await axios({
      method: "POST",
      url: `${API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      data: data, // data can be `string` or {object}! 
      headers: { 'Content-Type': 'application/json', 'API_KEY': Defaults.apis.api_key },
    });
    console.log("data show", result)
    return result;
  } catch (error) {
  }
};

export const localPostData = async (url: any, data: any): Promise<string | void> => {

  try {

    let LOCAL_API_URL = 'http://localhost:5000/api';
    let apiKey = 3162
    let deviceSettings = await getAsyncData('deviceSettings')
    if (deviceSettings && deviceSettings.hasOwnProperty('apiUrl')) {
      LOCAL_API_URL = deviceSettings.apiUrl + ":" + deviceSettings.apiPort + '/api';
      apiKey = deviceSettings.apiKey
    }
    console.log(`${LOCAL_API_URL}${url}`)
    const result: any = await axios({
      method: "POST",
      url: `${LOCAL_API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      data: data, // data can be `string` or {object}! 
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
    });
    console.log("data show", result)
    return result;
  } catch (error) {
  }
};

export const localGetData = async (url: any): Promise<string | void> => {

  try {
    let LOCAL_API_URL = 'http://localhost:5000/api';
    let apiKey = 3162
    let deviceSettings = await getAsyncData('deviceSettings')
    if (deviceSettings && deviceSettings.hasOwnProperty('apiUrl')) {
      LOCAL_API_URL = deviceSettings.apiUrl + ":" + deviceSettings.apiPort + '/api';
      apiKey = deviceSettings.apiKey

    }
    console.log(`LOCAL_API_URL===${LOCAL_API_URL}${url}`)
    const result: any = await axios({
      method: 'GET',
      url: `${LOCAL_API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      headers: { "Access-Control-Allow-Origin": "*", 'Authorization': apiKey },
    });
    //let response = result;      

    return result;
  } catch (error: any) {

    console.log('getErr', JSON.stringify(error));
    return error
  }
};

export const localDeleteData = async (url: any): Promise<string | void> => {

  try {
    let LOCAL_API_URL = 'http://localhost:5000/api';
    let apiKey = 3162
    let deviceSettings = await getAsyncData('deviceSettings')
    if (deviceSettings && deviceSettings.hasOwnProperty('apiUrl')) {
      LOCAL_API_URL = deviceSettings.apiUrl + ":" + deviceSettings.apiPort + '/api';
      apiKey = deviceSettings.apiKey

    }
    console.log(`LOCAL_API_URL===${LOCAL_API_URL}${url}`)
    const result: any = await axios({
      method: 'DELETE',
      url: `${LOCAL_API_URL}${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      headers: { "Access-Control-Allow-Origin": "*", 'Authorization': apiKey },
    });
    //let response = result;      

    return result;
  } catch (error: any) {

    console.log('getErr', JSON.stringify(error));
    return error
  }
};

export const getOOSData = async (url: any): Promise<string | void> => {
  try {
    const result: any = await axios({
      method: 'GET',
      url: `https://oos.memoria.app/api${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: 'esW2sdw-ssdfSwS1Dqd12azs2fs34fsd'//'esW2sdw-ssdfSwS1Dqd12azs2fs34fsd'
      },
    });
    //let response = result;      

    return result;
  } catch (error) {
    console.log('getErr', error);
  }
};

export const postOOSData = async (url: any, data: any): Promise<string | void> => {
  try {
    const result: any = await axios({
      method: "POST",
      url: `https://oos.memoria.app/api${url}`,
      validateStatus: function (status) {
        return status < 600;
      },
      data: data, // data can be `string` or {object}! 
      headers: { 'Content-Type': 'application/json', ...await authHeaderNew(), Authorization: 'esW2sdw-ssdfSwS1Dqd12azs2fs34fsd' },
    });
    return result;
  } catch (error) {
  }
};

// Add a 401 response interceptor
axios.interceptors.response.use(
  function (response) {
    // If backend returns a message that token is invalid/expired, handle it here
    try {
      const msg = response?.data?.message;
      if (msg && typeof msg === 'string' && msg.toLowerCase().includes('token')) {
        // Clear stored user and navigate to login
        authService.logout();
        Alert.alert(
          'Session expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => {
                RootNavigation.reset('Login');
              },
            },
          ]
        );
        return Promise.reject(response);
      }
    } catch (e) {
      // ignore parsing errors
    }

    return response;
  },
  function (error) {
    if (error && error.response && error.response.status === 401) {
      // Token probably expired or unauthorized. Clear user and go to login.
      try {
        authService.logout();
      } catch (e) { }
      Alert.alert(
        'Session expired',
        'Your session has expired. Please login again.',
        [
          {
            text: 'OK',
            onPress: () => {
              RootNavigation.reset('Login');
            },
          },
        ]
      );
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);
