// secrets.js
const secrets = {    
    dbUri: "mongodb://admin:test123@ds227255.mlab.com:27255/meta-meals-testing",
    secretOrKey: "secret"
  };
  
  //mongodb://<dbuser>:<dbpassword>@ds227255.mlab.com:27255/meta-meals-testing
  export const getSecret = key => secrets[key];
  