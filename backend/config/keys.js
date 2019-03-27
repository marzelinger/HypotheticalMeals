// config.js
module.exports = {
  mongoURI: "mongodb://admin:testtest123@ds135592.mlab.com:35592/meta-meals-prod-ev3",
    //:mongodb://marzelinger:metameals123@ds227255.mlab.com:27255/meta-meals-testing//the above db is used to test the database for the login stuff.
    //dbUri: "mongodb://madeline:madeline32897@ds111025.mlab.com:11025/login_auth_app"
    secretOrKey: "secret",
    client_secret: "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E"
  };
  
//EV 1
//testing DB: mongodb://admin:test123@ds227255.mlab.com:27255/meta-meals-testing
//prod DB: mongodb://admin:testtest123@ds056288.mlab.com:56288/meta-production

//EV 3
//mongodb://<dbuser>:<dbpassword>@ds211083.mlab.com:11083/meta-meals-ev3-testing

//backup/dump testing
//mongodb://admin:testtest123@ds129651.mlab.com:29651/meta-meals-backup-testing-ev3

//EV3 Production database: 
//mongodb://admin:testtest123@ds135592.mlab.com:35592/meta-meals-prod-ev3