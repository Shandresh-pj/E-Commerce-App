/**
 * Thunks are a great place for application business logic
 */
import {splashLaunched} from '../actions/app';
import {setData, currentData} from '../actions/otherData.action';
import {AppDispatch, AppGetState} from '../store';
import {
  getData,
  getLiveData,
  getOOSData,
  localGetData,
  postData,
} from '../../services/main-service';
import {toastMsg} from '../../services/toastMsg';
import {SET_MESSAGE} from '../constants/types';
import {
  dynamicSort,

  getCurrentDate,
  isJson,
  isLiveEnabled,
  OrderStatus,
  strToJson,
  treeCategoryToArray,
} from '../../utils';
import accessories from '../../../jsondata/accessories.json';
import prodcutsAll from '../../../jsondata/prodcutsAll.json';
import categoryAll from '../../../jsondata/categoryAll.json';
import accessoriesType from '../../../jsondata/accessoriesType.json';
import {Alert} from 'react-native';
import { getAsyncData, setAsyncData } from '../../utils/storage';
export const splashScreenLaunched = () => async (dispatch: AppDispatch) => {
  dispatch(splashLaunched());
  dispatch(setData(false, 'isLoader'));
  /**
   * Application launch Logic can go here, like
   * - Validating user token
   * - Getting data from async storage
   * - Making an API call needed for booting app
   */
};

export const getLocalGetData =
  (url: any) => async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(setData(true, 'isLoading'));
    let localApiData: any = await localGetData(url);
    console.log('localApiData', localApiData, url);
    if (localApiData?.status == 200) return localApiData;
    else {
      console.log('localApiData Error', localApiData.data);
      dispatch({
        type: SET_MESSAGE,
        payload: {
          message: localApiData?.data
            ? localApiData?.data
            : 'Etwas ist schief gelaufen',
          variant: 'danger',
        },
      });
      //Alert.alert(localApiData?.data? localApiData?.data:'Something went wrong please check internet connection then try again later')
      // dispatch({
      //   type: SET_MESSAGE,
      //   payload: { message: (localApiData?.data? localApiData?.data:'Something went wrong please check internet connection then try again later'), variant: 'danger' },
      // });
    }
    dispatch(setData(false, 'isLoading'));
  };
export const runningOrderScreenLaunched =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(setData(true, 'isLoading'));
    const {auth} = getState();
    console.log('authauth', auth.user);
    let runningOrders;
    if (await isLiveEnabled()) {
      let allReceipts: any = await getData(
        `/POS/getPOSReceiptsByAddressID&AddressID=${
          auth.user.userAddress?.id || 0
        }&PageNumber=0&PageSize=100`,
      );
      console.log('allReceipts', allReceipts);
      runningOrders = allReceipts?.data?.objects || [];
    } else {
      let allReceipts: any = await localGetData(`/Receipt/getAllReceipts`);
      console.log('allReceipts', allReceipts.data);
      runningOrders = allReceipts && allReceipts?.data ? allReceipts.data : [];
      // dispatch(setData(runningOrders, 'runningOrderList'))
      // dispatch(setData(false, 'isLoading'));
    }
    dispatch(setData(runningOrders, 'runningOrderList'));
    dispatch(setData(false, 'isLoading'));
  };
  export const closedOrderScreenLaunched =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(setData(true, 'isLoading'));
    const {auth} = getState();
    console.log('authauth', auth.user);
    let closedOrders;
   let allReceipts: any = await localGetData(`/Receipt/getClosedReceiptsByDate?Date=${getCurrentDate()}`);
      console.log('allReceipts', allReceipts.data);
     closedOrders = allReceipts && allReceipts?.data ? allReceipts.data : [];
    
    dispatch(setData(closedOrders, 'closedOrderList'));
    dispatch(setData(false, 'isLoading'));
  };
export const paymentScreenLanched =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(setData(true, 'isLoading'));
    let allPaymentTypes: any = await localGetData(
      `/MasterData/getPaymentTypes`,
    );
    if (await isLiveEnabled()) {
      allPaymentTypes = await getData(`/MasterData/getPaymentTypes`);
    }

    let PaymentTypes =
      allPaymentTypes && allPaymentTypes?.data ? allPaymentTypes.data : [];
    PaymentTypes = PaymentTypes.filter(
      (i: any) => i.visible == true || i.active == true,
    );
    PaymentTypes.push({ id: '11223344',sortOrder:1000, name_DE: 'Terminal Pay' })
    PaymentTypes = PaymentTypes.sort(dynamicSort('sortOrder'));
   
    console.log('allPaymentTypes', PaymentTypes, allPaymentTypes.data);
    dispatch(setData(PaymentTypes, 'allPaymentTypes'));
    dispatch(setData(false, 'isLoading'));
  };
export const homeScreenLaunched =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    //console.log('user', getState())
    dispatch(setData(true, 'isLoading'));
    dispatch(setData(1, 'footerSlectedId'));
    const {auth} = getState();
    console.log('authauth', auth.user.companyCode);
    if (auth.isLoggedIn) {
      let deviceSettings = await getAsyncData('deviceSettings');
      if (deviceSettings && deviceSettings.hasOwnProperty('apiUrl')) {
        dispatch(setData(deviceSettings, 'deviceSettings'));
      }
    

      if (await isLiveEnabled()) {

        let allRooms: any = await getLiveData(`/Room/All`);
        console.log('allRoomsallRooms', allRooms);
        if (allRooms && allRooms.name == 'AxiosError')
          dispatch({
            type: SET_MESSAGE,
            payload: {
              message:
                'Something went wrong please check internet connection then try again later',
              variant: 'danger',
            },
          });
        else
          dispatch(
            setData(
              allRooms?.data?.response ? allRooms.data.response : [],
              'allRooms',
            ),
          );
        //  allProduct = await getData(`/Products/getProductsAll&PageNumber=0&PageSize=0`);

        let categoryAll: any = await getData(
          `/Categories/getCategoriesAll&company=${auth.user.companyCode}`,
        ); ///memoria/getMethod?url=
        //dispatch(setData(allCategory?.data?allCategory?.data:[], 'allCategory'));
        let prodcutsAll: any = await getData(
          `/Products/getProductsAll&company=${auth.user.companyCode}`,
        );
        let accessoriesType: any = await getData(
          `/MasterData/getProductAccessoryTypes&company=${auth.user.companyCode}`,
        );
        let accessories: any = await getData(
          `/Products/getProductAccessoriesByDate&company=${auth.user.companyCode}`,
        );

        let allCategoryWithProduct: any = [];
        let allCategory: any = {data: []};
        let allProduct: any = {data: []};
        let productAccessTypeAll: any = {data: []};
        let productAccessoriesAll: any = {data: []};
        allCategory.data = categoryAll?.data; //tempravari
        allProduct.data = prodcutsAll?.data; //tempravari
        productAccessTypeAll.data = accessoriesType?.data; //tempravari
        productAccessoriesAll.data = accessories?.data; //tempravari

        allCategoryWithProduct = await Promise.all(
          Array.isArray(allCategory?.data) &&
            allCategory?.data?.map((cat: any) => {
              let category: any = {
                id: cat.id,
                name: cat.name_DE,
                description: cat?.description_DE,
                name_DE: cat?.name_DE,
              };
              let CatProduct = allProduct?.data?.objects.filter((i: any) => {
                if (cat.id == i.categoryID) {
                  i['productID'] = i.id;
                  i['productVariantID'] =
                    i?.productVariants.length > 0
                      ? i?.productVariants[0].id
                      : 0;
                  i['accessories'] =
                    Array.isArray(productAccessoriesAll.data) &&
                    productAccessoriesAll.data.filter(
                      (ac: any) => ac.productID == i.id,
                    );
                  // accessories
                  return i;
                }
                return false;
              });
              category['data'] = CatProduct;
              // category['id']=cat.id;
              return category;
            }),
        );
        console.log(
          '>>>>allCategoryWithProduct',
          allCategoryWithProduct,
          categoryAll,
        );
        allCategoryWithProduct =
          Array.isArray(allCategoryWithProduct) &&
          allCategoryWithProduct.filter((i: any) => i.data.length > 0);
        console.log('>>>>allCategoryWithProduct222', allCategoryWithProduct);
        dispatch(setData(allCategoryWithProduct?allCategoryWithProduct:[], 'allCategoryWithProduct'));
        dispatch(
          setData(
            allProduct?.data?.objects ? allProduct?.data?.objects : {},
            'allProduct',
          ),
        );
        dispatch(
          setData(
            productAccessTypeAll?.data ? productAccessTypeAll.data : [],
            'allProductAccessType',
          ),
        );
        dispatch(
          setData(
            productAccessoriesAll?.data ? productAccessoriesAll.data : [],
            'allProductAccessories',
          ),
        );

        console.log(
          '>>>>>>>>>>>>>>>>>>>>>>',
          allRooms,
          allCategory,
          allProduct,
          productAccessTypeAll,
          productAccessoriesAll,
        );
      } else {
        let allProduct: any;

        let posInfo:any = await localGetData(
          `/MasterData/getInfo`,
        );
       
        dispatch(setData(posInfo.data || {}, 'posInfo'));

        let allCategoryWithProduct: any = [];
        allCategoryWithProduct=await getAsyncData("allCategoryWithProduct")
          if(!Array.isArray(allCategoryWithProduct))
            allCategoryWithProduct=[];
        if(allCategoryWithProduct.length<=0){
        allProduct = await localGetData(
          `/Product/getProductsAll?PageNumber=0&PageSize=0`,
        );

      

        allCategoryWithProduct = await treeCategoryToArray(
          allProduct?.data?.objects,
          allCategoryWithProduct,
        );
        console.log('allProduct', allProduct, allCategoryWithProduct);
        allCategoryWithProduct = allCategoryWithProduct.filter(
          (i: any) => i.data.length > 0,
        );
        setAsyncData("allCategoryWithProduct",allCategoryWithProduct)
      }
        dispatch(setData(allCategoryWithProduct, 'allCategoryWithProduct'));
      }

      dispatch(setData(false, 'isLoading'));
    }

    // dispatch(splashLaunched());
    /**
     * Application launch Logic can go here, like
     * - Validating user token
     * - Getting data from async storage
     * - Making an API call needed for booting app
     */
  };
export const getOOSOrderByPage =
  (pageNumber: any, status: any = 'Offen') =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    let allOOSOrder: any = await getOOSData(
      `/order/all?pageSize=12&currentPage=${pageNumber}&orderBy=order_id asc&status=${status}`,
    );
    let data: any = {};
    data[OrderStatus[status]] = Array.isArray(allOOSOrder?.data?.response?.data)
      ? allOOSOrder?.data.response
      : {data: []};
    dispatch(setData(data, 'allOOSOrder'));
    let overViewData: any = {};
    data = data?.[OrderStatus[status]].data;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].products.length; j++) {
        let access: any = strToJson(data[i].products[j].accessories);

        let key: any = Object.keys(access).join('_');
        key = (key ? '_' : '') + key;
        // console.log('access',access)
        overViewData[data[i].products[j].product_id + key] = {
          quantity:
            data[i].products[j].quantity +
            (overViewData[data[i].products[j].product_id]
              ? overViewData[data[i].products[j].product_id].quantity
              : 0),
          productName: data[i].products[j].product_name,
          accessories: access,
        };
      }
    }
    dispatch(setData(overViewData, 'overViewData'));
  };
export const getOOSAllCategories =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    let allOOSCategories: any = await getOOSData(`/order/getCategoriesAll`);
    console.log('allOOSCategories', allOOSCategories);
    let data = Array.isArray(allOOSCategories?.data?.response)
      ? allOOSCategories?.data.response
      : [];
    dispatch(setData(data, 'allOOSCategory'));
  };
export const loaderFun =
  (type: any) => async (dispatch: AppDispatch, getState: AppGetState) => {
    console.log('user', getState());
    const {auth} = getState();
    if (auth.isLoggedIn) {
      let id = auth.user.userAddress.id;
      console.log('ID', id);

      if (type === 'show') {
        //alert("type1"+type)
        dispatch(setData(true, 'isLoader'));
      } else {
        //alert("type2"+type)
        dispatch(setData(false, 'isLoader'));
      }
    }
  };
export const footerSelect =
  (footerSlectionId: any) => (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(setData(footerSlectionId, 'footerSlectedId'));
  };
export const messageTrigger =
  (data: any) => (dispatch: AppDispatch, getState: AppGetState) => {
    // alert("tttttttttttttttttttttttttttttttttttttttttttttttttttttttt            "+data);
    dispatch({
      type: SET_MESSAGE,
      payload: {message: data, variant: 'success'},
    });
  };
export const callMsgToast =
  (data: any) => (dispatch: AppDispatch, getState: AppGetState) => {
    toastMsg(data, dispatch);
  };
export const currentDataFun =
  (name: any, data: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    console.log('user', getState());
    const {auth} = getState();
    if (auth.isLoggedIn) {
      let id = auth.user.userAddress.id;
      console.log('ID', id);

      dispatch(currentData(data, name));
    }
  };
export const noteCountLaunched =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const {auth} = getState();
    if (auth.isLoggedIn) {
      let id = auth.user.userAddress.id;
      console.log('ID', id);
      let statusData = 'Open';
      let getRequestPaymentData: any = await getData(
        `/talenthr/getMethod?url=/CustomerCardCredit/getCustomerCardPaymentRequests&ToAddressID=${id}&TransferStatus=${statusData}&OrderBy=dateCreated DESC`,
      );
      if (getRequestPaymentData.status === 200) {
        if (
          getRequestPaymentData.data.objects.length > 0 &&
          getRequestPaymentData.data.objects != '' &&
          getRequestPaymentData.data.objects != undefined
        ) {
          //alert(getRequestPaymentData.data.objects.length)
          dispatch(
            setData(getRequestPaymentData.data.objects.length, 'noteCount'),
          );
        } else {
          dispatch(setData(0, 'noteCount'));
        }
      } else {
        dispatch(setData(0, 'noteCount'));
      }
    }
  };
