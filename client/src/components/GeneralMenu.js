import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";



import '../style/GeneralMenu.css';

export default class GeneralMenu extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  render() {
    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle id = "menubutton">
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
          <DropdownItem disabled>Action (disabled)</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Manufacturing Goals</DropdownItem>
          <DropdownItem>User Settings</DropdownItem>
          <DropdownItem>
               <Link
                 to="/register"
                 style={{
                   width: "140px",
                   borderRadius: "3px",
                   letterSpacing: "1.5px"
                 }}
                 className="btn btn-large waves-effect waves-light hoverable blue accent-3"
               >
                 Register New User
               </Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}