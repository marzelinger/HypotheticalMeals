
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");


module.exports = function currentUserUsername(){
  if(localStorage != null){
    if(localStorage.getItem("jwtToken")!= null){
      const decoded = jwt_decode(localStorage.getItem("jwtToken"));
      return decoded.username;
    }
  }
    return "";
}

