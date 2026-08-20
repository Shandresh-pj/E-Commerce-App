import axios from 'axios';
import { authHeaderNew } from '../services/auth-header';
import Defaults from '../../config';
import { getAsyncData } from '../utils/storage';
import { Alert, Platform } from 'react-native';
import RootNavigation from '../../navigation/RootNavigation';
import authService from './auth.service';



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

export const getLiveData = async (url: string): Promise<any | void> => {
  return getData(url);
};

export const getOOSData = async (url: string): Promise<any | void> => {
  return getData(url);
};

export const localGetData = async (url: string): Promise<any | void> => {
  return getData(url);
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

// Multipart file upload helper
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

export const deleteData = async (url: string): Promise<any | void> => {
  try {
    const result: any = await axios({
      method: "DELETE",
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      headers: { ...await authHeaderNew() },
    });
    return result;
  } catch (error) {
    console.log('deleteErr', error);
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


// Check if item is a parent product rather than a variant
const isProductItem = (item: any): boolean =>
  item != null &&
  (typeof item.id === 'number' || typeof item.Id === 'number') &&
  item.name != null &&
  item.ProductId == null;

// Fetch user profile
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

// Update user profile
export const updateMyProfile = async (formData: FormData): Promise<{ status: number; data: any } | null> => {
  try {  
    const stored = await getAsyncData('user');
    let userId = stored?.user?.id || stored?.id || stored?.Id || stored?.userId;

    if (!userId) {
      // Fallback: match by email
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

// Fetch wishlist
export const fetchMyWishlist = async (): Promise<any[]> => {
  try {
    const response: any = await getData('/wishlist');
    if (response && response.status) {
      return response.data?.data?.data || response.data?.data || [];
    }
    return [];
  } catch (error) {
    console.log('fetchMyWishlist error:', error);
    return [];
  }
};

// Toggle wishlist status
export const toggleWishlist = async (productId: number, isLiked: boolean): Promise<boolean> => {
  try {
    const response: any = isLiked
      ? await deleteData(`/wishlist/${productId}`)
      : await postData(`/wishlist`, { product_id: productId });

    return !!(response && response.status);
  } catch (error) {
    console.log('toggleWishlist error:', error);
    return false;
  }
};

// Fetch cart
export const fetchApiCart = async (): Promise<any[]> => {
  try {
    const response: any = await getData('/cart');
    if (response && (response.status === 200 || response.data?.success)) {
      const raw = response.data?.data ?? response.data ?? [];
      return Array.isArray(raw) ? raw : [];
    }
    return [];
  } catch (error) {
    console.log('fetchApiCart error:', error);
    return [];
  }
};

// Add item to cart
export const addToApiCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
  try {
    const response: any = await postData('/cart/add', { product_id: productId, quantity });
    return !!(response && (response.status === 200 || response.status === 201 || response.data?.success));
  } catch (error) {
    console.log('addToApiCart error:', error);
    return false;
  }
};

// Remove item from cart
export const removeFromApiCart = async (cartItemId: number): Promise<boolean> => {
  try {
    const response: any = await deleteData(`/cart/${cartItemId}`);
    return !!(response && (response.status === 200 || response.status === 204 || response.data?.success));
  } catch (error) {
    console.log('removeFromApiCart error:', error);
    return false;
  }
};

// Fetch categories
export const fetchCategories = async (): Promise<any[]> => {
  try {
    const response = await getData('/categories');
    if (response && response.status === 200) {
      const data = response.data?.data ?? response.data ?? [];
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.log('fetchCategories error:', error);
    return [];
  }
};

// Fetch paginated products
export const fetchAllProducts = async (
  currentPage: number = 1,
  pageSize: number = 50,
  categoryId?: number,
): Promise<{ items: any[]; totalPages: number; totalCount: number; currentPage: number }> => {
  try {
    let url = `/products?page=${currentPage}&limit=${pageSize}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    const response = await getData(url);
    console.log("API Product page", currentPage, response);
    if (response && response.status) {
      const body = response.data ?? {};
      const rawItems = body?.data ?? [];
      const pagination = body?.pagination ?? {};
      const totalPages = pagination?.totalPages ?? 1;
      const items = Array.isArray(rawItems)
        ? rawItems
            .filter(isProductItem)
            .map((p: any) => (p.id == null && p.Id != null ? { ...p, id: p.Id } : p))
        : [];
      const totalCount = pagination?.totalRecords ?? items.length;
      return {
        items,
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

// Fetch all products (across all pages)
export const fetchAllProductsComplete = async (pageSize: number = 100): Promise<any[]> => {
  let page = 1;
  let totalPages = 1;
  const all: any[] = [];

  do {
    const result = await fetchAllProducts(page, pageSize);
    all.push(...result.items);
    totalPages = result.totalPages;
    page++;
  } while (page <= totalPages);

  return all;
};

// Fetch products by category with client-side fallback
export const fetchProductsByCategory = async (
  categoryId: number,
  categoryName: string,
  pageSize: number = 100,
): Promise<any[]> => {

  let page = 1;
  let totalPages = 1;
  const byId: any[] = [];

  do {
    const result = await fetchAllProducts(page, pageSize, categoryId);
    byId.push(...result.items.filter(isProductItem));
    totalPages = result.totalPages;
    page++;
  } while (page <= totalPages);

  // Validate category mapping
  if (byId.length > 0) {
    const nameLC = categoryName.toLowerCase();
    const allMatch = byId.every(p => (p.category ?? '').toLowerCase() === nameLC);
    if (allMatch) return byId;
  }

  // Fallback to client-side filter
  const all = await fetchAllProductsComplete(pageSize);
  const nameLC = categoryName.toLowerCase();
  return all.filter(isProductItem).filter(p => (p.category ?? '').toLowerCase() === nameLC);
};

// Fetch product details
export const fetchProductDetail = async (id: number): Promise<any | null> => {
  try {
    const response = await getData(`/products/${id}`);
    if (response && response.status === 200) {
      const data = response.data?.data ?? null;
      // Fallback for variant records
      if (data && data.ProductId != null && data.name == null) {
        return fetchProductDetail(data.ProductId);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.log('fetchProductDetail error:', error);
    return null;
  }
};



// Axios response interceptor for 401/expired token
axios.interceptors.response.use(
  function (response) {
    // Check for token error message
    try {
      const msg = response?.data?.message;
      if (msg && typeof msg === 'string' && msg.toLowerCase().includes('token')) {
        // Reset state on token expiry
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
    }

    return response;
  },
  function (error) {
    if (error && error.response && error.response.status === 401) {
      // Reset state on 401 unauthorized
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
