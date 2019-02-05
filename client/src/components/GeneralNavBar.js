import React from 'react';
import PropTypes from 'prop-types';
import {
  Navbar,
  NavbarBrand} from 'reactstrap';
import GeneralMenu from './GeneralMenu'
import UserMenu from './UserMenu'
import * as Constants from '../resources/Constants';
import '../style/GeneralNavBarStyle.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
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
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand id = "title" href="/">{Constants.TITLE}</NavbarBrand>
          <GeneralMenu/>
          <PrivateRoute exact path="/register" component={Register} />
          <UserMenu></UserMenu>
          <Logout></Logout>  
        </Navbar>
      </div>
    );
  }
}



// <Navbar color="light" light expand="md">
// <GeneralMenu/>
// <Route exact path="/register" component={Register} />
// <NavbarBrand id = "title" href="/">{Constants.TITLE}</NavbarBrand>
// {
//   localStorage.getItem("jwtToken")
//   ? 
//   <Logout></Logout>
//   : <div></div>


// }

// }
// </Navbar>