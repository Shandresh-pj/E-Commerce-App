import Toast from 'react-native-root-toast';

import { CLEAR_MESSAGE } from "../redux/constants/types";
import { Dispatch } from 'redux';

// //export const toastMsg=(messages: any,dispatch1:any)=>(dispatch:Dispatch) =>{
export const toastMsg = (messages: any, dispatch: any) => {
    //  console.log('////////////////////////////////////////////////////messages'+messages);
    //let dispatch:Dispatch;
    const colorMapping = {
        success: "#00C851",
        danger: "#FF4444",
        info: "#33B5E5"
    };
    if (messages.message == '')
        return false;
    if (typeof messages.message === 'string') {
        // alert(messages.message);
        // alert(messages.variant);
        let cc = Toast.show(messages.message, {
            duration: 2000,
            position: Toast.positions.TOP,
            shadow: false,
            animation: true,
            hideOnPress: true,
            backgroundColor: messages.variant == 'danger' ? colorMapping.danger : colorMapping.success,
            containerStyle: {
                width: "90%",
                borderRadius: 10,
                marginTop:50,
                zIndex:10
            },
            //visible: messages.show,
            delay: 0,
            onShow: () => {
                // calls on toast\`s appear animation start
            },
            onShown: () => {
                // calls on toast\`s appear animation end.
            },
            onHide: () => {
                dispatch({ type: CLEAR_MESSAGE });
                // calls on toast\`s hide animation start.
            },
            onHidden: () => {
                // calls on toast\`s hide animation end.
            }
        });
        //console.log('cc========================================================', cc);
        //   setTimeout(function () {
        //     Toast.hide(toast);
        // }, 500);

    }
    else {
        ////alert("pppppppppppppppppppppppppppp"+ messages.message);
        messages.message.map((msg: any, id: any) => {
            Toast.show(msg.message, {
                duration: Toast.durations.LONG,
                position: 20 + id * 10,//Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
                visible: msg.show,
                onShow: () => {
                    // calls on toast\`s appear animation start
                },
                onShown: () => {
                    // calls on toast\`s appear animation end.
                },
                onHide: () => {
                    // calls on toast\`s hide animation start.
                },
                onHidden: () => {
                    // calls on toast\`s hide animation end.
                }
            });
        });
    }
}