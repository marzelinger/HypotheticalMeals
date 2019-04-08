import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import PageTemplate from "../PageTemplate";
import GeneralNavBar from "../GeneralNavBar";
import { Link, withRouter } from "react-router-dom";
import { Route, Redirect } from "react-router-dom";



class Dashboard extends Component {

  render() {
    //const { user } = this.props.auth;

    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        {/* <Redirect to="/skus" /> */}
        {this.props.title}
      </div>
    );
  }
}

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  {}
)(Dashboard);
