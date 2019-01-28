import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING
} from "./types";
const currentUserIsAdmin = require("../components/auth/currentUserIsAdmin");
var firstAdminRegistered = false;

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
  if(!firstAdminRegistered){
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login")) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
  firstAdminRegistered = true;
  }
};