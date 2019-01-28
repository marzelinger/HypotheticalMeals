import React from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


import Navbar from "./layout/Navbar";
import Landing from "./layout/Landing";
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";
import Login from "./auth/Login";
import PrivateRoute from "./private-route/PrivateRoute";
import Dashboard from "./dashboard/Dashboard";
import jwt_decode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";

import { setCurrentUser, logoutUser } from "../actions/authActions";
import { Provider } from "react-redux";
//import store from '../store/configureStore';
import configureStore from '../store/configureStore';

// Check for token to keep user logged in

const store = configureStore();

if (localStorage.jwtToken) {
  if(localStorage.getItem("firstAdminCreated")){
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
    // Check for expired token
    const currentTime = Date.now() / 1000; // to get in milliseconds
    if (decoded.exp < currentTime) {
      // Logout user
      store.dispatch(logoutUser());
  
      // Redirect to login
      window.location.href = "./login";
    }
  }
  }

class App extends React.Component{
render(){
    return(
  <div>
    <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/adminregister" component={AdminRegister} />
            <Switch>
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            </Switch>
          </div>
        </Router>
      </Provider>
      </div>
    )
}
}

export default App


// class App extends React.Component{
//   render(){
//       return(
//     <div>
//       <Provider store={store}>
//           <Router>
//             <div className="App">
//               <Navbar />
//               <Route exact path="/" component={Landing} />
//               <Route exact path="/adminregister" component={AdminRegister} />
//               <Route exact path="/login" component={Login} />
//               <Switch>
//               <PrivateRoute exact path="/dashboard" component={Dashboard} />
//               </Switch>
//             </div>
//           </Router>
//         </Provider>
//         </div>
//       )
//   }
//   }




// render(){
//     return(
//   <div>
//     <Provider store={store}>
//     <PageTemplate></PageTemplate>
//         <Router>
//           <div className="App">
//             <Navbar />
//             <Route exact path="/" component={Landing} />
//             <Route exact path="/register" component={Register} />
//             <Route exact path="/login" component={Login} />
//             <Switch>
//               <PrivateRoute exact path="/dashboard" component={Dashboard} />
//             </Switch>
//           </div>
//         </Router>
//       </Provider>
//       </div>
//     )
// }
