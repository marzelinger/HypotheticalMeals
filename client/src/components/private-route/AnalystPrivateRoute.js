import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
const AnalystPrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={props =>
        
      auth.isAnalyst === true ? (
        <Component {...props} />
      ) : (
        <Redirect to="/skus" />
      )
        
    }
  />
);
AnalystPrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps)(AnalystPrivateRoute);