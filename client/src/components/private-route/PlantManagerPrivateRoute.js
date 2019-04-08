import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
const PlantManagerPrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={props =>
        
      auth.isPlantM === true ? (
        <Component {...props} />
      ) : (
        <Redirect to="/skus" />
      )
        
    }
  />
);
PlantManagerPrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps)(PlantManagerPrivateRoute);