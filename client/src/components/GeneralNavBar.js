import React from 'react';
import PropTypes from 'prop-types';
import {
  Navbar,
  NavbarBrand} from 'reactstrap';
import GeneralMenu from './GeneralMenu'
import UserMenu from './UserMenu'
import * as Constants from '../resources/Constants';
import '../style/GeneralNavBarStyle.css';
import Register from "./auth/Register";
import PrivateRoute from './private-route/PrivateRoute';
import ExportSimple from "./export/ExportSimple";
import Logout from './auth/Logout'


export default class GeneralNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    console.log("in the general navbar: "+ localStorage.getItem("jwtToken"));
    return (
      <Navbar id = "bar" color="light" light expand="md">
        <GeneralMenu></GeneralMenu>
        <NavbarBrand id = "title" href="/">{Constants.TITLE}</NavbarBrand>
        <PrivateRoute exact path="/register" component={Register} />
        <UserMenu id = "usermenu"></UserMenu>
        <Logout></Logout>
      </Navbar>
    );
  }
}