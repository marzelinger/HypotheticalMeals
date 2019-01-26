import React from 'react';
import {
  Navbar,
  NavbarBrand} from 'reactstrap';
import GeneralMenu from './GeneralMenu'
import Logout from './auth/Logout'
import * as Constants from '../resources/Constants';
import '../style/GeneralNavBarStyle.css';

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
    return (
      <div>
        <Navbar color="light" light expand="md">
          <GeneralMenu></GeneralMenu>
          <NavbarBrand id = "title" href="/">{Constants.TITLE}</NavbarBrand>
          <Logout></Logout>
        </Navbar>
        
      </div>
    );
  }
}