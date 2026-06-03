import {
    ALL_DATA,
    CURRENT_DATA
} from "../constants/types";
import { Dispatch } from 'redux';

export const allData = (data: any, key: any) => (dispatch: Dispatch) => {
    dispatch({
        type: CURRENT_DATA,
        payload: { key: 'all_' + key, currentRecord: data },
    });
}
export const currentData = (data: any, key: any) => (dispatch: Dispatch) => {
    dispatch({
        type: CURRENT_DATA,
        payload: { key: 'current_' + key, currentRecord: data },
    });
}

export const setData = (data: any, key: string) => (dispatch: Dispatch) => {
    dispatch({
        type: CURRENT_DATA,
        payload: { key: key, currentRecord: data },
    });
}

