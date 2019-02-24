import axios from "axios";
const setAdminToken = token => {
  if (token) {
    // Apply admin token to every request if logged in
    axios.defaults.headers.common["Admin"] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["Admin"];
  }
};
export default setAdminToken;