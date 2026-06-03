import { connect } from 'react-redux';

import Component from './Component';
import {
  splashScreenLaunched,
} from '../../../shared/redux/thunk/app';

const mapStateToProps = (state: any) => {

  const { isLoggedIn } = state.auth;
  const { message } = state.messages;
  return {
    isLoggedIn, message
  }
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatch,
  splashLaunched: () => dispatch(splashScreenLaunched()),
});

const splashContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default splashContainer;
