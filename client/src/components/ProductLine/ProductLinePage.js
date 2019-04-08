import React from 'react';
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';
import '../../style/ProductLineTableStyle.css'
import ProductLineBox from './ProductLineBox';
import GeneralNavBar from '../GeneralNavBar';
import AuthRoleValidation from '../auth/AuthRoleValidation';

export default class ProductLinePage extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      current_user: {},
      token: ''
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
        <GeneralNavBar title={Constants.ProductLineTitle}></GeneralNavBar>
        <ProductLineBox
          user = {this.state.current_user}
        ></ProductLineBox>
        
      </div>
    );
  }
}