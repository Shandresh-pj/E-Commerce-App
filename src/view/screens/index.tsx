import * as React from "react";
//import { Navigation } from "react-native-navigation";

import { SCREENS } from "../../constants/screen";
import * as Login from "./login";
import * as Home from "./home";

import { initalStateAsync } from "../../shared/redux/reducers/auth"



const registerComponentWithRedux = (redux: any) => (
  name: string,
  screen: any
) => {

  // Navigation.registerComponent(
  //   name,
  //   () => (props: any) => (
  //     <Provider store={redux.store}>
  //       <screen.default {...props} />
  //     </Provider>
  //   ),
  //   () => screen.default
  // );
};

export function registerScreens(redux: any) {
  redux.store.dispatch(initalStateAsync)
  registerComponentWithRedux(redux)(SCREENS.Login, Login);
  registerComponentWithRedux(redux)(SCREENS.Home, Home);
}
