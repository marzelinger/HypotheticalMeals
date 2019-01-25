// secrets.js
const secrets = {
    dbUri: "mongodb://marzelinger:Bellerose1!@ds161764.mlab.com:61764/mern-comment-box",
    secretOrKey: "secret"
  };
  
  export const getSecret = key => secrets[key];
  