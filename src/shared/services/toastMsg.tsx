import Toast from 'react-native-root-toast';
import { CLEAR_MESSAGE } from "../redux/constants/types";

export const toastMsg = (messages: any, dispatch: any) => {
    const colorMapping = {
        success: "#00C851",
        danger: "#FF4444",
        info: "#33B5E5"
    };

    if (messages.message == '')
        return false;

    if (typeof messages.message === 'string') {
        Toast.show(messages.message, {
            duration: 2000,
            position: Toast.positions.TOP,
            shadow: false,
            animation: true,
            hideOnPress: true,
            backgroundColor: messages.variant == 'danger' ? colorMapping.danger : colorMapping.success,
            containerStyle: {
                width: "90%",
                borderRadius: 10,
                marginTop: 50,
                zIndex: 10
            },
            delay: 0,
            onHide: () => {
                dispatch({ type: CLEAR_MESSAGE });
            }
        });
    } else {
        messages.message.map((msg: any, id: any) => {
            Toast.show(msg.message, {
                duration: Toast.durations.LONG,
                position: 20 + id * 10,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
                visible: msg.show
            });
        });
    }
}