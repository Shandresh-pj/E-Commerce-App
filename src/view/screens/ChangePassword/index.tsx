import { connect } from 'react-redux';

import Component from './ChangePassword';

import {
  homeScreenLaunched, loaderFun, currentDataFun, noteCountLaunched, getOOSOrderByPage, getOOSAllCategories, getLocalGetData, runningOrderScreenLaunched
} from '../../../shared/redux/thunk/app';

const mapStateToProps = (state: any) => {
  console.log('stat',state)
  const { isLoggedIn, user } = state.auth;
  const { messages,otherData } = state;
  return {
    isLoggedIn,user, messages,otherData
  }
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatch,
  homeLaunched: () => dispatch(homeScreenLaunched()),
  getLocalGetData:(url:any)=>dispatch(getLocalGetData(url)),
  oosOrderByPage: (pageNumber:any,status:any) => dispatch(getOOSOrderByPage(pageNumber,status)),
  getOOSAllCategories: (pageNumber:any,status:any) => dispatch(getOOSAllCategories()),
  loaderLaunched: (type:any) => dispatch(loaderFun(type)),
  runningOrderLaunched: () => dispatch(runningOrderScreenLaunched()),
  
  currentDataLaunched: (name: any,data:any) => dispatch(currentDataFun(name,data)),
});

const ChangePasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default ChangePasswordContainer;
