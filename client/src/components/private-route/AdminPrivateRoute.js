import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import GeneralNavBar from '../GeneralNavBar';
const AdminPrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={props =>
        
      auth.isAdmin === true ? (
        <Component {...props} />
      ) : (
        <Redirect to="/skus" />
      )
        
    }
  />
);
AdminPrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps)(AdminPrivateRoute);