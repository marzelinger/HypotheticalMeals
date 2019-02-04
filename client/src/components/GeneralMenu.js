import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, NavLink } from 'reactstrap';
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
          <DropdownItem>
          <Link
                to="/manu_goals"
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
 Manufacturing Goals
               </Link>
            
            
            </DropdownItem>
            <DropdownItem>
          <Link
                to="/ingredients"
                style={{
                  width: "140px",
                  borderRadius: "3px",
                  letterSpacing: "1px"
                }}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"

              >
 Ingredients
               </Link>
            
            
            </DropdownItem>
            <DropdownItem>
              </DropdownItem>


            <DropdownItem>
          <Link
                to="/skus"
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
 SKUs
               </Link>
            
            
            </DropdownItem>      
            
            <DropdownItem>
 Product Lines
            
            
            </DropdownItem>      
          <DropdownItem>
            <div>
              {
                currentUserIsAdmin().isValid 
                ? (
                <div>
                <Link
                to="/register"
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