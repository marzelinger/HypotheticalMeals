// AuthRoleValidation.js
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");

export default class AuthRoleValidation{

    constructor() {
        this.state = {
            current_user: {}
          };
        //this.determineUser();
      }


    static async determineUser () {
        var res = await SubmitRequest.submitGetUserByID(this.getUserID());
        if(res.success){
            if(res.data!=null){
                return res.data[0];
                // await this.setState({
                //     current_user: res.data[0]
                // })
                // console.log("this is the user: "+this.state.current_user);
            }
        }
        return null;
    }
    

    static getUserID(){
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
              const decoded = jwt_decode(localStorage.getItem("jwtToken"));
              const id = decoded.id;
              if(id){
                return id;
              }
            }
          }
          return null;
    }

    static async checkCurrentUserIsRole(role){
        console.log("checking role: "+role);
        var res = await SubmitRequest.submitGetUserByID(this.getUserID());
        console.log("response "+JSON.stringify(res));

        if(res.success){
            if(res.data!=null){
                if(res.data[0].roles!=null){
                    var roles = res.data[0].roles;
                    if (roles.includes(role)) {
                        console.log("returning true");
                        return true;
                    }
                }
            }
        }
        return false;
    }
 

    static async checkUserIsRole(user, role){
        var res = await SubmitRequest.submitGetUserByID(user._id);
        if(res.success){
            if(res.data!=null){
                if(res.data[0].roles!=null){
                    var roles = res.data[0].roles;
                    if (roles.includes(role)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static checkRole (user, role){
        if(user!=undefined){
            if (user.roles!=undefined){
            return user.roles.includes(role);
            }
        }
        return false;
      }


    //THIS ONE WORKS
    static async checkUserIDIsRole(user_id, role){
        var res = await SubmitRequest.submitGetUserByID(user_id);
        if(res.success){
            if(res.data!=null){
                if(res.data[0].roles!=null){
                    var roles = res.data[0].roles;
                    if (roles.includes(role)) {
                        console.log("this is this role: yes");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static async IsCurrentUserPlantMForX(manu_line){
        var res = await SubmitRequest.submitGetUserByID(this.getUserID());
        if(res.success){
            if(res.data!=null){
                if(res.data[0].roles!=null){
                    if (res.data[0].roles.includes(Constants.plant_manager)) {
                        if(res.data[0].manu_lines.includes(manu_line)){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    static async checkLocalUser(role) {
        if (localStorage != null) {
            if(localStorage.getItem("jwtToken")!= null){
                const decoded = jwt_decode(localStorage.getItem("jwtToken"));
                var deco_role = decoded[role];
                console.log("decod_rule: "+deco_role);
                return decoded[role];
            }
        }
    }




    
    









  }
