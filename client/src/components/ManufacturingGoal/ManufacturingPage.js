import React from 'react';
import GeneralNavBar from '../GeneralNavBar';
import ManufacturingGoalsBox from './Goals/ManufacturingGoalsBox';
import AuthRoleValidation from '../auth/AuthRoleValidation';
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';

const jwt_decode = require('jwt-decode');


export default class ManufacturingPage extends React.Component {
  constructor() {
    super();

    this.state = {
        current_user: {},
        token: ''

    };
    if(localStorage != null){
        if(localStorage.getItem("jwtToken")!= null){
          this.state.user = jwt_decode(localStorage.getItem("jwtToken")).id;
        }
    }
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

async componentDidUpdate (prevProps, prevState) {
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
  
  
  
  
  render() {
    return (
      <div>
        <GeneralNavBar title={Constants.ManuGoalTitle}></GeneralNavBar>
        <ManufacturingGoalsBox
          user = {this.state.current_user}
        ></ManufacturingGoalsBox>
      </div>
    );
  }
}