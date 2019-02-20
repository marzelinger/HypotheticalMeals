import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import setAdminToken from "../utils/setAdminToken";
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
      if(currentUserIsAdmin().isValid){
        axios
        .post("/api/users/register", userData)
        .then(res => history.push("/skus")) //re-direct to skus on successful register.
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
      const decoded = jwt_decode(token);

      if(decoded.admin==true){
        setAdminToken(token);
      }
      // Decode token to get user data
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


// Login - get user token
export const loginDukeUser = (userData, netIDToken, client_id) => dispatch => {
//   axios
//     .post("/api/users/loginDukeNetID", userData)
//     .then(res => {
//       // Save to localStorage
// // Set token to localStorage
//       const { token } = res.data;
//       localStorage.setItem("jwtToken", token);
//       // Set token to Auth header
//       setAuthToken(token);
//       const decoded = jwt_decode(token);

//       if(decoded.admin==true){
//         setAdminToken(token);
//       }
//       // Decode token to get user data
//       // Set current user
//       dispatch(setCurrentUser(decoded));
//     })
//     .catch(err =>
//       dispatch({
//         type: GET_ERRORS,
//         payload: err.response.data
//       })
//     );

    //   localStorage.setItem("jwtToken", netIDToken);
    //   // Set token to Auth header
    //   setAuthToken(netIDToken);

    //   // Decode token to get user data
    //   // Set current user
    //   dispatch(setCurrentUser(decoded));
    // })
    // .catch(err =>
    //   dispatch({
    //     type: GET_ERRORS,
    //     payload: err.response.data
    //   })
    // );

    let res = axios.get('https://api.colab.duke.edu/meta/v1/apis/identity/v1', {
      headers: {
          'x-api-key': client_id,
          'Authorization': `Bearer ${netIDToken}`
      }
    });
    console.log("this is the res: "+res);

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
  setAdminToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};



// // Register First Admin
export const registerFirstAdmin = (userData, history) => dispatch => {

  //if(!adminHasInit().isValid){
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
  //}
};



// // Get all Users
export const getAllUsers = () => dispatch => {
  var count = 0;
  axios
    .get("/api/users")
    .then(res => {
      if(res.data.data.length>0){
        //sessionStorage.setItem("firstAdminCreated", true);
        localStorage.setItem("firstAdminCreated", true);
        count = res.data.data.length;
     }
     else{
      //sessionStorage.setItem("firstAdminCreated", false);
      }
          }) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
    return count;
};