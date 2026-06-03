import { getAsyncData, setAsyncData } from "./storage"

export const addDevice =async (data:any) => {
    let DeviceList=await getAsyncData('DeviceList');
    if(DeviceList == null){
        DeviceList={};
    }
    else if(DeviceList[data?.DeviceName]){
            return 'Device name already exists';
        }
    DeviceList[data?.DeviceName]=data;
    setAsyncData('DeviceList',DeviceList);
    return 'Success';
 }
 export const updateDevice =async (key:any,data:any) => {
    let DeviceList=await getAsyncData('DeviceList');
    DeviceList[key]=data;    
    setAsyncData('DeviceList',DeviceList);
    return 'Success';
}

 
export const deleteDevice =async (data:any) => {
    let DeviceList=await getAsyncData('DeviceList');
    if(DeviceList[data?.DeviceName]){
        delete DeviceList[data?.DeviceName];
    }
    setAsyncData('DeviceList',DeviceList);
}

export const getDeviceByName =async (DeviceName:any) => {
    let DeviceList=await getAsyncData('DeviceList');
    if(DeviceList[DeviceName]){
        return DeviceList[DeviceName];
    }
   return  {};
}

export const getAllDevice =async () => {
    let DeviceList=await getAsyncData('DeviceList');
   return  DeviceList;
}