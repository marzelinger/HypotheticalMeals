import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING
} from "./types";
const currentUserIsAdmin = require("../components/auth/currentUserIsAdmin");
const adminHasInit = require("../../src/components/auth/adminHasInit");

// Register New User
export const registerUser = (userData, history) => dispatch => {
  console.log(history);
  console.log(userData);
  console.log(localStorage);
      if(currentUserIsAdmin().isValid){
        console.log("curUserIsAdmin has been confirmed to be true");
        axios
        .post("/api/users/register", userData)
        //.then(res => history.push("/login")) // re-direct to login on successful register
        .then(res => history.push("/dashboard")) //re-direct to dashboard on successful register.
        .catch(err =>
          dispatch({
            type: GET_ERRORS,
            payload: err.response.data
          })
        );
      }
};

// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      // Save to localStorage
// Set token to localStorage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      console.log("logging in user and setting if admin in authActions: "+decoded.admin);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};
// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};
// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
  console.log(SET_CURRENT_USER);
  console.log("localStorage: "+localStorage.getItem("jwtToken"));
};



// // Register First Admin
export const registerFirstAdmin = (userData, history) => dispatch => {
  console.log(history);
  console.log(userData);

  if(!adminHasInit().isValid){
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login")) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
    localStorage.setItem("firstAdminCreated", true);
  }
};



// // Get all Users
export const getAllUsers = (history) => dispatch => {
  console.log(history);

  axios
    .get("/api/users/getall")
    //.then(res => history.push("/login")) // re-direct to login on successful register
    .then(res => {
      //console.log("this is the response in authActions: "+ res);
      //console.log("this is the response in authActions.data.form 0: "+ res.data.form[0]);
      //console.log("this is the response in authActions.error: "+ res.error);
      //var myObject = JSON.parse(res.data);
      //console.log("this is the parsed: "+ myObject);

      let userList = {};
      userList = res.data;
      console.log("this is the list: "+userList);
      console.log('this is the userlist.length: '+ userList.length);
      if(res.data.length === undefined){
        localStorage.setItem("firstAdminCreated", false);
      }
      else if(res.data.length === 0){
        localStorage.setItem("firstAdminCreated", false);
      }
      else{
          localStorage.setItem("firstAdminCreated", true);
      }  
      console.log("this is the response in getAllusers length: "+ res.data.length);
      console.log("this is the firstAdminCreatedFlag: "+ localStorage.getItem("firstAdminCreated"));
    }) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};