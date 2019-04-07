import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, NavLink } from 'reactstrap';
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./auth/Register";
// import AdminRegister from "./auth/AdminRegister";
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import AuthRoleValidation from './auth/AuthRoleValidation';
import * as Constants from '../resources/Constants';

export default class GeneralMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      current_user: {},
      token: ''
    };
    this.determineUser = this.determineUser.bind(this);
    this.determineUser();
  }

  async determineUser() {
    var res = await AuthRoleValidation.determineUser();
    if(res!=null){
        var user = res.user;
        var token = res.token;
        await this.setState({
            current_user: user,
            token: token
        })
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if(localStorage != null){
      if(localStorage.getItem("jwtToken")!= null){
          var token = localStorage.getItem("jwtToken");
          if(this.state.token!=null){
              if(this.state.token != token){
                  await this.determineUser();
              }
          }
      }
    }

    if(this.state.current_user._id != AuthRoleValidation.getUserID()){
      await this.determineUser();
    }
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
          
        <Drawer open={this.state.open} docked = {false} onRequestChange={(open) => this.setState({open})}>
          <Link to="/skus" >
            <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'SKUs'}></MenuItem>
          </Link>
          <Link to="/ingredients" >
            <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Ingredients'}></MenuItem>
          </Link>
          <Link to="/formulas">
            <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Formulas'}></MenuItem>
          </Link>
          <Link to="/manu_lines" >
            <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Manufacturing Lines'}></MenuItem>
          </Link>
          <Link to="/prod_lines" >
            <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Product Lines'}></MenuItem>
          </Link>
          {AuthRoleValidation.checkRole(this.state.current_user, Constants.analyst) ?
            (<Link to="/manu_goals" >
              <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Manufacturing Goals'}></MenuItem>
            </Link>
            )
            :
            (<div></div>)
          }
          {AuthRoleValidation.checkRole(this.state.current_user, Constants.analyst) ?
            (<Link to="/salesreport">
              <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Sales Report'}></MenuItem>
            </Link>
            )
            :
            (<div></div>)
          }
          {AuthRoleValidation.checkRole(this.state.current_user, Constants.analyst) ?
            (<Link to="/manu_schedule" >
              <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Manufacturing Schedule'}></MenuItem>
            </Link>
            )
            :
            (<div></div>)
          }
          {AuthRoleValidation.checkRole(this.state.current_user, Constants.product_manager) ?
            (<Link to="/import" >
              <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Import'}></MenuItem>
            </Link>
            )
            :
            (<div></div>)
          }
          {AuthRoleValidation.checkRole(this.state.current_user, Constants.admin) ?
            (<Link to="/register" >
              <MenuItem style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'Register New Users'}></MenuItem>
            </Link>
            )
            :
            (<div></div>)
          }
          {AuthRoleValidation.checkRole(this.state.current_user, Constants.admin) ?
            (<Link to="/users" >
              <MenuItem onClick={this.handleClose} style = {{color: 'rgb(0, 188, 212)'}}className = "item" primaryText = {'User Settings'}></MenuItem>
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