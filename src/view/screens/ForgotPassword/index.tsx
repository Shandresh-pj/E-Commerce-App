import { connect } from 'react-redux';
import Component from './ForgotPassword';

const mapStateToProps = (state: any) => {
  const { otherData } = state;
  return { otherData };
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatch,
});

const ForgotPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default ForgotPasswordContainer;
