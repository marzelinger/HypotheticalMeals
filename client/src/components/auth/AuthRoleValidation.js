// AuthRoleValidation.js
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");

export default class AuthRoleValidation{

    static async getUserID(){
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
        var res = SubmitRequest.submitGetUserByID(this.getUserID());
        if(res.success){
            if(res.data!=null){
                if(res.data.roles!=null){
                    if (res.data.roles.includes(role)) {
                        console.log("res_data_roles: "+res.data.roles);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static async checkUserIsRole(user, role){
        console.log("checking role: "+role);
        console.log("this is user: "+JSON.stringify(user));
        var res = SubmitRequest.submitGetUserByID(user._id);
        console.log("this is res: "+JSON.stringify(res));
        if(res.success){
            if(res.data!=null){
                if(res.data.roles!=null){
                    if (res.data.roles.includes(role)) {
                        console.log("res_data_roles: "+res.data.roles);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static async IsCurrentUserPlantMForX(manu_line){
        var res = SubmitRequest.submitGetUserByID(this.getUserID());
        if(res.success){
            if(res.data!=null){
                if(res.data.roles!=null){
                    if (res.data.roles.includes(Constants.plant_manager)) {
                        if(res.data.manu_lines.includes(manu_line)){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // static async getXForPlantM(user, manu_line){

    //     return false;
    // }


    // static async IsAdmin(){
    //     var res = SubmitRequest.submitGetUserByID(getUserID());
    //     if(res.success){
    //         if(res.data!=null){
    //             if(res.data.roles!=null){
    //                 if (res.data.roles.includes(opt)) {

    //                 }
    //             }
    //         }
    //     }
    //     return false;
    // }
    // static async IsNormal(user){

    //     return false;
    // }

    // static async IsAnalyst(user){

    //     return false;
    // }

    // static async IsPM(user){

    //     return false;
    // }

    // static async IsBM(user){

    //     return false;
    // }

    // static async IsPlantM(user){

    //     return false;
    // }


    
    









  }
