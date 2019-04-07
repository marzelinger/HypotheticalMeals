import {
    SET_CURRENT_USER,
    USER_LOADING
  } from "../actions/types";
  import AuthRoleValidation from "../components/auth/AuthRoleValidation";
  import * as Constants from '../resources/Constants';
  
  const isEmpty = require("is-empty");
  const initialState = {
    isAuthenticated: false,
    isAdmin: false,
    isAdmin: false,
    isPM: false,
    isAnalyst: false,
    isBM: false,
    isPlantM: false,
    user: {},
    loading: false
  };
  export default function(state = initialState, action) {
    // console.log("this is the action: "+JSON.stringify(action));
    switch (action.type) {
      case SET_CURRENT_USER:
        // console.log("this is the response: "+ await AuthRoleValidation.checkUserIDIsRole(action.payload.id, Constants.admin) );
        // var admin = isEmpty(action.payload) ? false : await AuthRoleValidation.checkUserIDIsRole(action.payload.id, Constants.admin);
        // console.log("this is admin: "+admin);
        return {
          ...state,
          isAuthenticated: !isEmpty(action.payload),
          isAdmin: action.payload.admin,
          isPM: action.payload.product_manager,
          isAnalyst: action.payload.analyst,
          isBM: action.payload.business_manager,
          isPlantM: action.payload.plant_manager,
          user: action.payload
        };
      case USER_LOADING:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  }
  