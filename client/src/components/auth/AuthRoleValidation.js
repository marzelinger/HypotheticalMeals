// AuthRoleValidation.js
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';
import { useReducer } from 'react';
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");

export default class AuthRoleValidation{

    constructor() {
        this.state = {
            current_user: {}
          };
          this.determineUser = this.determineUser.bind(this);
      }


    static async determineUser () {
        var res = await SubmitRequest.submitGetUserByID(this.getUserID());
        if(res.success){
            if(res.data!=null){
                if(localStorage != null){
                    if(localStorage.getItem("jwtToken")!= null){
                        var token = localStorage.getItem("jwtToken");
                        return {
                        user: res.data[0],
                        token: token
                        };
                    }
                }
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

    static IsCurrentUserPlantMForX(user, manu_line){
        console.log("user: "+ JSON.stringify(user));
        console.log("manuline: "+ JSON.stringify(manu_line));
            if(this.checkRole(user, Constants.plant_manager)){
                console.log("here1");
                if(user.manu_lines!=null){
                    console.log("here2");
                    for(let m = 0; m<user.manu_lines.length; m++){
                        if(user.manu_lines[m]._id == manu_line._id) return true;
                    }

                    // if (user.manu_lines.includes(manu_line)) {
                    //     console.log("here3");

                    //         return true;
                    // }
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
