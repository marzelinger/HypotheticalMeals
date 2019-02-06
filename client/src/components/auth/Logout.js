import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import { Provider } from "react-redux";

class Logout extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }
  onLogoutClick = e => {
    e.preventDefault();
    logoutUser();
  };

render() {
    //const { user } = this.props.auth;
return (
        <MenuItem onClick={this.onLogoutClick} primaryText="Log out"/>
    );
  }
}


Logout.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});


export default connect(
  mapStateToProps,
  { logoutUser }
)(Logout);


