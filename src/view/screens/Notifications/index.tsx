import { connect } from 'react-redux';
import Component from './Notifications';

const mapStateToProps = (state: any) => {
    const { isLoggedIn, user } = state.auth;
    const { messages, otherData } = state;
    return {
        isLoggedIn, user, messages, otherData
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    dispatch,
});

const NotificationsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Component);

export default NotificationsContainer;
