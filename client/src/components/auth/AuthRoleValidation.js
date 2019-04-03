// AuthRoleValidation.js
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';

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

    static async checkIsRole(role){
        var res = SubmitRequest.submitGetUserByID(getUserID());
        if(res.success){
            if(res.data!=null){
                if(res.data.roles!=null){
                    if (res.data.roles.includes(role)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static async IsPlantMForX(manu_line){
        var res = SubmitRequest.submitGetUserByID(getUserID());
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
