import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Person from 'material-ui/svg-icons/social/person-outline';
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import '../style/GeneralMenu.css';
import Logout from './auth/Logout';

const jwt_decode = require('jwt-decode');

export default class UserMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      username: jwt_decode(localStorage.getItem("jwtToken")).name
    };

  }

  handleClickMenu = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
        <div>
            <FlatButton
            label={this.state.username}
            labelPosition="after"
            primary={true}
            cursor
            icon={<Person />}
            onClick = {this.handleClickMenu}
            />
            <Popover
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={this.handleRequestClose}
            >
                <Menu>
                    {/* <Logout></Logout> */}
                    <MenuItem primaryText = "LogoutDUMMY"></MenuItem>                    
                </Menu>
            </Popover>
        </div>
    );
  }
}