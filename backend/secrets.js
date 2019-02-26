// secrets.js
const secrets = {    
<<<<<<< HEAD
    // dbUri: "mongodb://admin:test123@ds227255.mlab.com:27255/meta-meals-testing",
=======
>>>>>>> c2080f6ecc8f09d9c90e07f501096bbe8c8747af
    dbUri: "mongodb://admin:testtest123@ds056288.mlab.com:56288/meta-production",
    secretOrKey: "secret",
    client_secret: "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E"
  };
  
  //mongodb://<dbuser>:<dbpassword>@ds227255.mlab.com:27255/meta-meals-testing
  export const getSecret = key => secrets[key];
  
//testing DB: @ds227255.mlab.com:27255/meta-meals-testing
//prod DB: @ds056288.mlab.com:56288/meta-production