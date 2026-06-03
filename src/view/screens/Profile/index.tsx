import { connect } from 'react-redux';

import Component from './Profile';

const mapStateToProps = (state: any) => {
  // console.log('state',state)
  const { isLoggedIn } = state.auth;
  const { messages,otherData } = state;
  return {
    isLoggedIn, messages,otherData
  }
};
const mapDispatchToProps = (dispatch:any) => ({
  dispatch
});

const ProfileContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default ProfileContainer;
