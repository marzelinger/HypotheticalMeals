import React from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import SkusPage from "./ListPage/SkusPage";
import FormulasPage from "./ListPage/FormulasPage";
import Landing from "./layout/Landing";
import Register from "./auth/Register";
import AdminRegister from "./auth/AdminRegister";
import Login from "./auth/Login";
import PrivateRoute from "./private-route/PrivateRoute";
import Dashboard from "./dashboard/Dashboard";
import jwt_decode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";
import GeneralNavBar from "./GeneralNavBar";
import ManufacturingPage from "./ManufacturingGoal/ManufacturingPage";
import ImportPage from "./ImportPage";
import IngredientsPage from "./ListPage/IngredientsPage";
import ProductLinePage from "./ProductLine/ProductLinePage";
import * as Constants from '../resources/Constants';
import Logout from '../components/auth/Logout';

import { setCurrentUser, logoutUser, getAllUsers } from "../actions/authActions";
import { Provider } from "react-redux";
//import store from '../store/configureStore';
import configureStore from '../store/configureStore';

import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

//const getAllUsers = require("../actions/authActions");

// Check for token to keep user logged in
const store = configureStore();

class App extends React.Component{
  constructor() {
    super();
    //localStorage.clear();
    //this.determineUserInit();
    this.determineUser();
    this.state = {
      navbar_items: [Constants.SkuTitle, Constants.IngTitle, Constants.ManuGoalTitle, Constants.FormulaTitle],
    }
  }

  determineUser = () => {
    if (localStorage.jwtToken) {
      //if(localStorage.getItem("firstAdminCreated")){
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
      //}
    }
  }

  render(){
    let props = {};
    return(
      <div>
        <Provider store={store}>
          <Router>
            <div className="App">
                <PrivateRoute component={GeneralNavBar}/>
                {//<Route exact path="/" component={Landing} />
                }
               <Route exact path="/login" component={Login} />
               <Route exact path="/adminregister" component={AdminRegister} />         
              <Switch>
                <PrivateRoute exact path="/ingredients" component={IngredientsPage} />
                <PrivateRoute exact path="/register" component={Register} />
                <PrivateRoute exact path="/" component={Dashboard} />
                <PrivateRoute exact path="/skus" component={SkusPage} />
                <PrivateRoute exact path="/manu_goals" component={ManufacturingPage} />
                <PrivateRoute exact path="/prod_lines" component={ProductLinePage} />
                <PrivateRoute exact path="/import" component={ImportPage} />
                <PrivateRoute exact path="/formulas" component={FormulasPage} />
              </Switch>
            </div>
          </Router>
        </Provider>
      </div>
    )
  }
}

export default App;