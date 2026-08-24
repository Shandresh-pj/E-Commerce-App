import axios from 'axios';
import { authHeaderNew } from '../services/auth-header';
import Defaults from '../../config';
import { getAsyncData, setAsyncData } from '../utils/storage';
import { buildImageUrl } from '../utils/imageHelper';
import { Alert } from 'react-native';
import RootNavigation from '../../navigation/RootNavigation';
import authService from './auth.service';

const API_URL = Defaults.apis.baseUrl + Defaults.apis.public.base;

/* -------------------------------------------------------------------------- */
/*                            BASE HTTP HELPERS                               */
/* -------------------------------------------------------------------------- */

export const getData = async (url: string): Promise<any | null> => {
  console.log('API_URL GET:', `${API_URL}${url}`);
  try {
    const result: any = await axios({
      method: 'GET',
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      headers: { 'Access-Control-Allow-Origin': '*', ...(await authHeaderNew()) },
    });
    console.log('getData result:', result?.status);
    return result;
  } catch (error) {
    console.log('getData error:', error);
    return null;
  }
};

export const getLiveData = async (url: string): Promise<any | null> => {
  return getData(url);
};

export const getOOSData = async (url: string): Promise<any | null> => {
  return getData(url);
};

export const localGetData = async (url: string): Promise<any | null> => {
  return getData(url);
};

export const getPublicData = async (url: string): Promise<any | null> => {
  console.log('API_URL Public GET:', `${API_URL}${url}`);
  try {
    const result: any = await axios({
      method: 'GET',
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      headers: {
        'Content-Type': 'application/json',
        API_KEY: Defaults.apis.api_key,
        Authorization: `Bearer ${Defaults.apis.api_key}`,
      },
    });
    console.log('getPublicData result:', result?.status);
    return result;
  } catch (error) {
    console.log('getPublicData error:', error);
    return null;
  }
};

export const postData = async (url: string, data: any): Promise<any | null> => {
  try {
    const result: any = await axios({
      method: 'POST',
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      data,
      headers: { ...(await authHeaderNew()) },
    });
    return result;
  } catch (error) {
    console.log('postData error:', error);
    return null;
  }
};

export const postFormData = async (
  url: string,
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
      API_KEY: String(Defaults.apis.api_key),
      ...(await authHeaderNew()),
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

export const putData = async (url: string, data: any): Promise<any | null> => {
  try {
    const result: any = await axios({
      method: 'PUT',
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      data,
      headers: { 'Content-Type': 'application/json', ...(await authHeaderNew()) },
    });
    return result;
  } catch (error) {
    console.log('putData error:', error);
    return null;
  }
};

export const deleteData = async (url: string): Promise<any | null> => {
  try {
    const result: any = await axios({
      method: 'DELETE',
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      headers: { ...(await authHeaderNew()) },
    });
    return result;
  } catch (error) {
    console.log('deleteData error:', error);
    return null;
  }
};

export const patchData = async (url: string, data: any): Promise<any | null> => {
  try {
    const result: any = await axios({
      method: 'PATCH',
      url: `${API_URL}${url}`,
      validateStatus: (status) => status < 600,
      data,
      headers: { 'Content-Type': 'application/json', ...(await authHeaderNew()) },
    });
    return result;
  } catch (error) {
    console.log('patchData error:', error);
    return null;
  }
};

export const putFormData = async (url: string, data: any): Promise<any> => {
  try {
    const fullUrl = `${API_URL}${url}`;
    const headers = {
      API_KEY: String(Defaults.apis.api_key),
      ...(await authHeaderNew()),
    };
    const response = await fetch(fullUrl, {
      method: 'PUT',
      body: data,
      headers,
    });
    const text = await response.text();
    let resultData = null;
    try {
      resultData = JSON.parse(text);
    } catch {
      resultData = text;
    }
    return { status: response.status, data: resultData, ok: response.ok };
  } catch (error) {
    console.error('putFormData error:', error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                               PRODUCT UTILS                                */
/* -------------------------------------------------------------------------- */

const isProductItem = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;
  const hasId = item.id != null || item.Id != null || item._id != null;
  const hasName = item.name != null || item.Name != null || item.title != null || item.product_name != null;
  return hasId && hasName;
};

/* -------------------------------------------------------------------------- */
/*                               PROFILE APIS                                 */
/* -------------------------------------------------------------------------- */

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

export const updateMyProfile = async (formData: FormData): Promise<{ status: number; data: any } | null> => {
  try {
    const stored = await getAsyncData('user');
    let userId = stored?.user?.id || stored?.id || stored?.Id || stored?.userId;

    if (!userId) {
      const email = stored?.user?.email || stored?.email || stored?.Email;
      const res = await getData('/profile/all');
      const list = res?.data?.data || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        const match = email ? list.find((p: any) => p.email === email) : list[0];
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

/* -------------------------------------------------------------------------- */
/*                               WISHLIST APIS                                */
/* -------------------------------------------------------------------------- */

export const fetchWishlist = async (): Promise<any[]> => {
  try {
    const response: any = await getData('/wishlist');
    if (response && (response.status === 200 || response.data?.success || response.data)) {
      const raw = response.data?.data ?? response.data ?? [];
      if (Array.isArray(raw)) {
        await setAsyncData('wishlist', raw);
        return raw;
      }
    }
  } catch (error) {
    console.log('fetchWishlist error:', error);
  }
  const localWishlist = await getAsyncData('wishlist');
  return Array.isArray(localWishlist) ? localWishlist : [];
};

export const fetchMyWishlist = fetchWishlist;

export const addToWishlist = async (productId: number, productObj?: any): Promise<boolean> => {
  try {
    await postData(`/wishlist/${productId}`, { product_id: productId });
  } catch (error) {
    try {
      await postData('/wishlist', { product_id: productId });
    } catch (e) {
      console.log('addToWishlist API error:', e);
    }
    console.log('addToWishlist API error:', error);
  }

  try {
    const currentWishlist: any[] = (await getAsyncData('wishlist')) || [];
    const targetId = Number(productId);
    const exists = currentWishlist.some(
      (w: any) => Number(w.product_id ?? w.ProductId ?? w.id) === targetId
    );
    if (!exists) {
      const nameStr = productObj?.name ?? productObj?.title ?? 'Product';
      const rawImg = productObj?.image ?? productObj?.imageUrl ?? productObj?.ImagePath ?? '';
      const updated = [
        ...currentWishlist,
        {
          id: targetId,
          product_id: targetId,
          name: nameStr,
          title: nameStr,
          price: parseFloat(productObj?.price ?? 0) || 0,
          image: buildImageUrl(rawImg, nameStr),
        },
      ];
      await setAsyncData('wishlist', updated);
    }
  } catch (e) {
    console.log('addToWishlist local sync error:', e);
  }

  return true;
};

export const removeFromWishlist = async (productId: number): Promise<boolean> => {
  try {
    await deleteData(`/wishlist/${productId}`);
  } catch (error) {
    console.log('removeFromWishlist error:', error);
  }

  try {
    const currentWishlist: any[] = (await getAsyncData('wishlist')) || [];
    const targetId = Number(productId);
    const updated = currentWishlist.filter(
      (w: any) => Number(w.product_id ?? w.ProductId ?? w.id) !== targetId
    );
    await setAsyncData('wishlist', updated);
  } catch (e) {
    console.log('removeFromWishlist local sync error:', e);
  }

  return true;
};

export const checkWishlistStatus = async (productId: number): Promise<boolean> => {
  try {
    const response: any = await getData(`/wishlist/check/${productId}`);
    if (response && (response.status === 200 || response.data?.success)) {
      return Boolean(response.data?.inWishlist ?? response.data?.status ?? true);
    }
  } catch (e) {
    console.log('checkWishlistStatus error:', e);
  }

  const localWishlist: any[] = (await getAsyncData('wishlist')) || [];
  const targetId = Number(productId);
  return localWishlist.some(
    (w: any) => Number(w.product_id ?? w.ProductId ?? w.id) === targetId
  );
};

export const toggleWishlist = async (
  productId: number,
  isCurrentlyWished?: boolean,
  productObj?: any
): Promise<boolean> => {
  const currentlyWished =
    isCurrentlyWished !== undefined
      ? isCurrentlyWished
      : await checkWishlistStatus(productId);

  if (currentlyWished) {
    await removeFromWishlist(productId);
    return false;
  } else {
    await addToWishlist(productId, productObj);
    return true;
  }
};

/* -------------------------------------------------------------------------- */
/*                                CART APIS                                   */
/* -------------------------------------------------------------------------- */

export const fetchApiCart = async (): Promise<any[]> => {
  try {
    const response: any = await getData('/cart');
    if (response && (response.status === 200 || response.data?.success || response.data)) {
      const raw = response.data?.data ?? response.data ?? [];
      if (Array.isArray(raw)) {
        const normalized = raw.map((item: any) => {
          const product = item.product ?? item.Product ?? item;
          const prodId = Number(product.id ?? product.Id ?? item.product_id ?? item.ProductId ?? item.id);
          const nameStr = product.name ?? product.Name ?? item.name ?? item.title ?? 'Product';
          const rawImg = product.image ?? product.imageUrl ?? item.image ?? item.imageUrl ?? '';
          return {
            ...item,
            cartItemId: item.id ?? item.Id,
            id: prodId,
            product_id: prodId,
            title: nameStr,
            name: nameStr,
            price: parseFloat(product.price ?? item.price ?? 0) || 0,
            quantity: Number(item.quantity ?? item.Quantity ?? 1),
            image: buildImageUrl(rawImg, nameStr),
          };
        });
        await setAsyncData('cart', normalized);
        return normalized;
      }
    }
  } catch (error) {
    console.log('fetchApiCart error:', error);
  }
  const localCart = await getAsyncData('cart');
  return Array.isArray(localCart) ? localCart : [];
};

export const addToApiCart = async (
  productId: number,
  quantity: number = 1,
  productObj?: any
): Promise<boolean> => {
  try {
    await postData('/cart/add', { product_id: productId, quantity });
  } catch (error) {
    console.log('addToApiCart API error:', error);
  }

  try {
    const currentCart: any[] = (await getAsyncData('cart')) || [];
    const targetProdId = Number(productId);
    const index = currentCart.findIndex((item: any) => {
      const pId = Number(item.product_id ?? item.ProductId ?? item.product?.id ?? item.Product?.id ?? item.id);
      return pId === targetProdId;
    });

    let updatedCart = [...currentCart];

    if (index > -1) {
      const newQty = (updatedCart[index].quantity || 1) + quantity;
      if (newQty <= 0) {
        updatedCart.splice(index, 1);
      } else {
        updatedCart[index] = {
          ...updatedCart[index],
          quantity: newQty,
        };
      }
    } else if (quantity > 0) {
      const nameStr = productObj?.name ?? productObj?.title ?? 'Product';
      const rawImg = productObj?.image ?? productObj?.imageUrl ?? productObj?.ImagePath ?? '';
      updatedCart.push({
        id: targetProdId,
        product_id: targetProdId,
        quantity: quantity,
        price: parseFloat(productObj?.price ?? 0) || 0,
        title: nameStr,
        name: nameStr,
        image: buildImageUrl(rawImg, nameStr),
      });
    }
    await setAsyncData('cart', updatedCart);
  } catch (e) {
    console.log('addToApiCart local sync error:', e);
  }

  return true;
};

export const removeFromApiCart = async (productIdOrCartItemId: number): Promise<boolean> => {
  try {
    await deleteData(`/cart/${productIdOrCartItemId}`);
  } catch (error) {
    console.log('removeFromApiCart error:', error);
  }

  try {
    const currentCart: any[] = (await getAsyncData('cart')) || [];
    const targetId = Number(productIdOrCartItemId);
    const updatedCart = currentCart.filter((item: any) => {
      const pId = Number(item.product_id ?? item.ProductId ?? item.product?.id ?? item.Product?.id ?? item.id);
      const cId = Number(item.cartItemId ?? item.id);
      return pId !== targetId && cId !== targetId;
    });
    await setAsyncData('cart', updatedCart);
  } catch (e) {
    console.log('removeFromApiCart local sync error:', e);
  }

  return true;
};

/* -------------------------------------------------------------------------- */
/*                              CATALOG APIS                                  */
/* -------------------------------------------------------------------------- */

export const fetchCategories = async (): Promise<any[]> => {
  try {
    let response = await getPublicData('/categories');
    if (!response || !response.status) {
      response = await getData('/categories');
    }
    if (response && (response.status === 200 || response.status === 201)) {
      const data = response.data?.data ?? response.data ?? [];
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.log('fetchCategories error:', error);
    return [];
  }
};

export const fetchAllProducts = async (
  currentPage: number = 1,
  pageSize: number = 50,
  categoryId?: number
): Promise<{ items: any[]; totalPages: number; totalCount: number; currentPage: number }> => {
  try {
    let url = `/products?page=${currentPage}&limit=${pageSize}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    let response = await getPublicData(url);
    if (!response || !response.status) {
      response = await getData(url);
    }
    console.log('API Product page', currentPage, response?.status);
    if (response && (response.status === 200 || response.status === 201 || response.data)) {
      const body = response.data ?? {};
      let rawItems: any[] = [];
      if (Array.isArray(body)) {
        rawItems = body;
      } else if (Array.isArray(body?.data)) {
        rawItems = body.data;
      } else if (Array.isArray(body?.items)) {
        rawItems = body.items;
      } else if (Array.isArray(body?.products)) {
        rawItems = body.products;
      } else if (Array.isArray(body?.data?.data)) {
        rawItems = body.data.data;
      }

      const pagination = body?.pagination ?? body?.data?.pagination ?? {};
      const totalPages = pagination?.totalPages ?? 1;
      const items = rawItems
        .filter(isProductItem)
        .map((p: any) => ({
          ...p,
          id: p.id ?? p.Id ?? p._id,
          name: p.name ?? p.Name ?? p.title ?? p.product_name ?? 'Product',
          price: parseFloat(p.price ?? p.Price ?? p.regular_price ?? 0) || 0,
          compare_at_price: parseFloat(p.compare_at_price ?? p.mrp ?? p.Mrp ?? p.originalPrice ?? p.price ?? 0) || 0,
          image: p.image ?? p.imageUrl ?? p.ImagePath ?? p.Image ?? '',
        }));
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

export const fetchProductsByCategory = async (
  categoryId: number,
  categoryName: string,
  pageSize: number = 100
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

  if (byId.length > 0) {
    const nameLC = categoryName.toLowerCase();
    const allMatch = byId.every((p) => (p.category ?? '').toLowerCase() === nameLC);
    if (allMatch) return byId;
  }

  const all = await fetchAllProductsComplete(pageSize);
  const nameLC = categoryName.toLowerCase();
  return all.filter(isProductItem).filter((p) => (p.category ?? '').toLowerCase() === nameLC);
};

export const fetchProductDetail = async (id: number): Promise<any | null> => {
  try {
    let response = await getPublicData(`/products/${id}`);
    if (!response || !response.status) {
      response = await getData(`/products/${id}`);
    }
    if (response && (response.status === 200 || response.status === 201)) {
      const data = response.data?.data ?? response.data ?? null;
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

/* -------------------------------------------------------------------------- */
/*                               COUPON APIS                                  */
/* -------------------------------------------------------------------------- */

export const fetchAllCoupons = async (): Promise<any[]> => {
  try {
    let res = await getPublicData('/coupons');
    if (!res || !res.status) res = await getData('/coupons');
    if (res && (res.status === 200 || res.data)) {
      const data = res.data?.data ?? res.data ?? [];
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.log('fetchAllCoupons error:', e);
  }
  return [
    { id: 1, code: 'SVK20', title: '20% OFF Mega Sale', discountPercent: 20, minSpend: 200, description: 'Get 20% off on all orders above ₹200' },
    { id: 2, code: 'FREESHIP', title: 'Free Express Shipping', discountAmount: 15, freeShipping: true, description: 'Waive shipping fees on your current order' },
    { id: 3, code: 'SAVE50', title: 'Flat ₹50 Instant Discount', discountAmount: 50, minSpend: 300, description: 'Flat ₹50 discount on orders over ₹300' },
    { id: 4, code: 'WELCOME10', title: '10% New Customer Special', discountPercent: 10, minSpend: 100, description: 'Welcome offer for instant 10% discount' },
  ];
};

export const validateCouponCode = async (code: string): Promise<any> => {
  try {
    const res = await postData('/coupons/validate', { code });
    if (res && (res.status === 200 || res.data?.valid)) {
      return res.data;
    }
  } catch (e) {
    console.log('validateCouponCode note:', e);
  }
  const clean = code.trim().toUpperCase();
  const coupons = await fetchAllCoupons();
  const found = coupons.find((c: any) => c.code === clean);
  if (found) {
    return { valid: true, coupon: found };
  }
  return { valid: false, message: 'Invalid promo code. Try SVK20 or SAVE50' };
};

export const calculateCouponDiscount = async (code: string, subtotal: number): Promise<number> => {
  try {
    const res = await postData('/coupons/calculate', { code, subtotal });
    if (res && res.data?.discountAmount != null) {
      return Number(res.data.discountAmount);
    }
  } catch (e) {
    console.log('calculateCouponDiscount note:', e);
  }
  const val = await validateCouponCode(code);
  if (val?.valid && val?.coupon) {
    const c = val.coupon;
    if (c.discountPercent) return (subtotal * c.discountPercent) / 100;
    if (c.discountAmount) return c.discountAmount;
  }
  return 0;
};

/* -------------------------------------------------------------------------- */
/*                         AXIOS RESPONSE INTERCEPTOR                         */
/* -------------------------------------------------------------------------- */

axios.interceptors.response.use(
  function (response) {
    try {
      const url = response?.config?.url || '';
      const isPublicEndpoint = url.includes('/products') || url.includes('/categories');
      const msg = response?.data?.message;
      if (!isPublicEndpoint && msg && typeof msg === 'string' && msg.toLowerCase().includes('token')) {
        authService.logout();
        Alert.alert('Session expired', 'Your session has expired. Please login again.', [
          {
            text: 'OK',
            onPress: () => {
              RootNavigation.reset('Login');
            },
          },
        ]);
        return Promise.reject(response);
      }
    } catch (e) {
      console.log('Interceptor error:', e);
    }

    return response;
  },
  function (error) {
    const url = error?.config?.url || '';
    const isPublicEndpoint = url.includes('/products') || url.includes('/categories');
    if (!isPublicEndpoint && error && error.response && error.response.status === 401) {
      try {
        authService.logout();
      } catch (e) {
        console.log('Logout error on 401:', e);
      }
      Alert.alert('Session expired', 'Your session has expired. Please login again.', [
        {
          text: 'OK',
          onPress: () => {
            RootNavigation.reset('Login');
          },
        },
      ]);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
