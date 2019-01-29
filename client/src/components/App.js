import React from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Navbar from "./layout/Navbar";
import ListPage from "./ListPage/ListPage";
import Landing from "./layout/Landing";
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";
import Login from "./auth/Login";
import PrivateRoute from "./private-route/PrivateRoute";
import Dashboard from "./dashboard/Dashboard";
import jwt_decode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";
import DataStore from "./../helpers/DataStore";
import GeneralNavBar from "./GeneralNavBar";
import ManufacturingGoalsPage from "./ManufacturingGoalsPage";

import { setCurrentUser, logoutUser } from "../actions/authActions";
import { Provider } from "react-redux";
//import store from '../store/configureStore';
import configureStore from '../store/configureStore';
import ManufacturingGoal from './ManufacturingGoal';

// Check for token to keep user logged in

const store = configureStore();

class App extends React.Component{
  constructor() {
    super();
    this.determineUser();
  }

  determineUser = () => {
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
  }

  getIngredientRender = () => {
    return () => (
      <div className="container">
        <ListPage
          {...DataStore.getIngredientData()}
        />
      </div>
    );
  }

  getSkuRender = () => {
    return () => (
      <ListPage
        {...DataStore.getSkuData()}
      />
    );
  }

  render(){
    let props = {};
    return(
      <div>
        <Provider store={store}>
          <Router>
            <div className="App">
            <GeneralNavBar/>
              <Route exact path="/" component={Landing} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/adminregister" component={AdminRegister} />
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
                <PrivateRoute exact path="/skus" component={this.getSkuRender()} />
                <PrivateRoute exact path="/ingredients" component={this.getIngredientRender()} />
                <PrivateRoute exact path="/manu_goals" component={ManufacturingGoalsPage} />
              </Switch>
            </div>
          </Router>
        </Provider>
      </div>
    )
  }
}

export default App



// render(){
//   return(
// <div>
//   <Provider store={store}>
//       <Router>
//         <div className="App">
//           <Navbar />
//           <Route exact path="/" component={Landing} />
//           <Route exact path="/login" component={Login} />
//           <Route exact path="/register" component={Register} />
//           <Route exact path="/adminregister" component={AdminRegister} />
//           <Switch>
//           <PrivateRoute exact path="/dashboard" component={Dashboard} />
//           </Switch>
//         </div>
//       </Router>
//     </Provider>
//     </div>
//   )
// }
// }



