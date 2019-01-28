// config.js
const config = {
    dbUri: "mongodb://marzelinger:metameals123@ds058739.mlab.com:58739/meta-meals"
  };
  
  export const getConfig = key => config[key];
  