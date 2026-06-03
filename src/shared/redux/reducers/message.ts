import { SET_MESSAGE, CLEAR_MESSAGE } from  "../constants/types";

const initialState = {message:'',variant:'success',show:false};

export default function (state = initialState, action:any) {
  const { type, payload } = action;

  switch (type) {
    case SET_MESSAGE:
      return { ...payload,show:true };

    case CLEAR_MESSAGE:
      return { message: "",show:false };

    default:
      return state;
  }
}