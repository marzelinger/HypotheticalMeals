import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import FlatButton from 'material-ui/FlatButton';
import Person from 'material-ui/svg-icons/social/person-outline';
import '../../style/GeneralMenu.css';

import { Provider } from "react-redux";

class Logout extends Component {
  onLogoutClick = e => {
    // console.log("this is in the onLogoutClcik");
    e.preventDefault();
    this.props.logoutUser();
  };

render() {
    const { user } = this.props.auth;
return (
          <FlatButton
            label={`Log out ${user.username}`}
            labelPosition="after"
            primary={true}
            cursor
            icon={<Person />}
            onClick = {this.onLogoutClick}
            />
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