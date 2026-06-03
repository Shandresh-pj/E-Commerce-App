import { connect } from 'react-redux';

import Component from './login';

const mapStateToProps = (state: any,user:any) => {
  // console.log('user details for login',user)
  const { isLoggedIn } = state.auth;
  const { messages,otherData } = state;
  return {
    isLoggedIn, messages,otherData
  }
};
const mapDispatchToProps = (dispatch:any) => ({
  dispatch
});

const loginContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default loginContainer;
