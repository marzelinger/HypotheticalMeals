// secrets.js
const secrets = {
    dbUri: "mongodb://marzelinger:Bellerose1!@ds161764.mlab.com:61764/mern-comment-box"
  };
  
  export const getSecret = key => secrets[key];
  