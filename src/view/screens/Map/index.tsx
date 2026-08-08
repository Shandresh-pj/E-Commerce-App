import { connect } from 'react-redux';
import Component from './MapScreen';

const mapStateToProps = (state: any) => {
  const { isLoggedIn } = state.auth;
  const { messages, otherData } = state;
  return {
    isLoggedIn,
    messages,
    otherData,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatch,
});

const MapContainer = connect(mapStateToProps, mapDispatchToProps)(Component);
export default MapContainer;
