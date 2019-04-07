import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
const BusinessManagerPrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={props =>
        
      auth.isBM === true ? (
        <Component {...props} />
      ) : (
        <Redirect to="/skus" />
      )
        
    }
  />
);
BusinessManagerPrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps)(BusinessManagerPrivateRoute);