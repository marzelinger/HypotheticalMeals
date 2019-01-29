import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";
import '../style/GeneralMenu.css';

const currentUserIsAdmin = require("../components/auth/currentUserIsAdmin");


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
          <DropdownItem>Manufacturing Goals</DropdownItem>
          <DropdownItem>User Settings</DropdownItem>
          
          <DropdownItem>
            <div>
              {
                currentUserIsAdmin().isValid 
                ? (
                <div>
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
              </div>)
              : (<div/>)
              }
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}