// secrets.js
const secrets = {    
    dbUri: "mongodb://admin:testtest123@ds129651.mlab.com:29651/meta-meals-backup-testing-ev3",
    secretOrKey: "secret",
    client_secret: "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E"
  };
  
  //mongodb://<dbuser>:<dbpassword>@ds227255.mlab.com:27255/meta-meals-testing
  export const getSecret = key => secrets[key];
  
//testing DB: mongodb://admin:test123@ds227255.mlab.com:27255/meta-meals-testing
//prod DB: mongodb://admin:testtest123@ds056288.mlab.com:56288/meta-production
//mongodb://<dbuser>:<dbpassword>@ds211083.mlab.com:11083/meta-meals-ev3-testing

//backup/dump testing
//mongodb://admin:testtest123@ds129651.mlab.com:29651/meta-meals-backup-testing-ev3