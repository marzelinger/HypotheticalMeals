// secrets.js
const secrets = {    
    dbUri: "mongodb://marzelinger:metameals123@ds058739.mlab.com:58739/meta-meals",
    secretOrKey: "secret"
  };
  
  export const getSecret = key => secrets[key];
  