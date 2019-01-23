// config.js
const config = {
    //dbUri: "mongodb://marzelinger:metameals123@ds058739.mlab.com:58739/meta-meals"
    //the above db is used to test the database for the login stuff.
    dbUri: "mongodb://madeline:madeline32897@ds111025.mlab.com:11025/login_auth_app"
  };
  
  export const getConfig = key => config[key];
  