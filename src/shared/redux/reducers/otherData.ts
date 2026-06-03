import {
    CURRENT_DATA
 } from '../constants/types';
 const initialState = {
  formSubmitted:false,
  cart:{selectedChair:[1],allChairs:1}
 };
 export default function OtherData(state=initialState, action:any) {
    switch (action.type) {
      case CURRENT_DATA:
        let curRecord:any={};
        curRecord[action.payload.key]=action.payload.currentRecord;
        return {
          ...state,
          ...curRecord
        };
      default:
        return state;
    }
  }