// config.js
const config = {
    dbUri: "mongodb://marzelinger:Bellerose1!@ds058739.mlab.com:58739/meta-meals"
  };
  
  export const getConfig = key => config[key];
  