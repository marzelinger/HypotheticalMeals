import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, NavLink } from 'reactstrap';
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

const currentUserIsAdmin = require("../components/auth/currentUserIsAdmin");


export default class GeneralMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});

  render() {
    return (
      <div>
          <div  onClick={this.handleToggle}
            className = "waves-effect waves-light button hoverable" primary = {true}>
            <MenuIcon color = '#424242'></MenuIcon>
          </div>
          
        <Drawer openSecondary = {true} open={this.state.open} docked = {false} onRequestChange={(open) => this.setState({open})}>
        <Link to="/manu_goals" >
          <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Manufacturing Goals'}></MenuItem>
        </Link>
        <Link to="/ingredients" >
        <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Ingredients'}></MenuItem>
        </Link>
        <Link to="/skus" >
          <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'SKUs'}></MenuItem>
        </Link>
        <Link to="/prod_lines" >
          <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Product Lines'}></MenuItem>
        </Link>
        <Link to="/import" >
          <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Import'}></MenuItem>
        </Link>
          {
            currentUserIsAdmin().isValid ? 
            (
              <Link to="/register" >
                <MenuItem style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Register New Users'}></MenuItem>
              </Link>
            )
            :
            (<div></div>)
          }
        </Drawer>
      </div>
    );
  }
}