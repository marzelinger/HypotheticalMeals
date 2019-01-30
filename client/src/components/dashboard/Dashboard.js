import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import PageTemplate from "../PageTemplate";
import GeneralNavBar from "../GeneralNavBar";

class Dashboard extends Component {

  render() {
    //const { user } = this.props.auth;

    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
                            <GeneralNavBar/>
            <PageTemplate></PageTemplate>
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
