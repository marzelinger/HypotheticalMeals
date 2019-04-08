import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getAllUsers } from "../../actions/authActions";

import { Button } from 'reactstrap';
const querystring = require('querystring');

const adminHasInit = require("../auth/adminHasInit");

//const OAUTH_URL = "https://oauth.oit.duke.edu/oauth/authorize.php";

// var authURI;
// const params = {
//   client_id: "meta-alligators",
//   client_secret: "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E",
//   redirect_uri: "http://localhost:3000",
//   response_type: "token",
//   state: 7777,
//   scope: "basic"
// // };

// const EVENTS_URL = "https://api.colab.duke.edu/events/v1/events";
// var events;


// var access_token = null;


class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: 0
    };

    //var response = this.props.getAllUsers();
    //console.log('this is the constructor for landing');
    //this.change = this.change.bind(this);

  }



  // encodeGetParams = p => 
  // Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");


  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/skus"); //if they are not an admin, get redirected to skus.
    }
  }

  componentWillReceiveProps(nextProps) {
    var response = this.props.getAllUsers();
    // console.log("this is the response for the getAll Users: " +response);
    if (response != null){
      this.setState({
        user : 1
      });
    }
  }



// async onRadioBtnClick() {
//   //this.setState({  });
//   let authURI = OAUTH_URL +'?'+this.encodeGetParams(params);
//     console.log("this is the authURI: "+authURI);
//   await this.checkAccessToken(authURI);

//   //decodeURIComponent
//   console.log("this is the parse "+querystring.parse(window.location.hash));

//   //window.location.href = authURI;
//   await console.log("this is the hash: "+window.location.hash);
//   //let hash = window.location.hash;
//   //access_token = this.getAccessToken();
//   console.log('this is access_token'+access_token);

//   //access_token = this.getAccessToken();
//   console.log('this is access_token2 '+access_token);

// }


  onChange = () => {
    //console.log("something is changing on change");
    // var response = this.props.getAllUsers();
    // this.setState({
    //   user : 1
    // }
      
    // );
    //this.setState(this.state)
  }

//   async getAccessToken () {
//     console.log("access_token: "+ access_token);
//    var url = window.location.href;
//    var regex = new RegExp("access_token" + "(=([^&#]*)|&|#|$)"),
//    results = regex.exec(url);
//    if (results == null) return 0;
//    return results[2];
// }



//  async checkAccessToken (authURI) {
//   access_token = await this.getAccessToken();
//   console.log(access_token);
//   if (!access_token) {
//       //window.location.replace(OAUTH_URL + this.getQueryString());
//       window.location.replace(authURI)
//       //access_token = await this.getAccessToken();
//       console.log(access_token);
//       console.log("this is the hash: "+window.location.hash);

//   }
// }

  loginLocalComp(){
      return (
        <div className="col s6">
        
          <Link
            to="/login"
            style={{
              width: "140px",
              borderRadius: "3px",
              letterSpacing: "1.5px"
            }}
            className="btn btn-large btn-flat waves-effect hoverable white black-text"
          >
          Log In Local User
          </Link>
          </div>
        );
  }

  loginDukeComp(){
    return (
      <div className="col s6">
        <Link
          to={"/loginDuke"}
          style={{
            width: "140px",
            borderRadius: "3px",
            letterSpacing: "1.5px"
          }}
          className="btn btn-large btn-flat waves-effect hoverable white black-text"
        >
        Log In With NetID
        </Link>
        </div>
      );
}

  switchLanding = (param) => {
    console.log("this is the param: "+param);

    switch(param){
      case true:
        return (<div className="col s6">
        <Link
          to="/login"
          style={{
            width: "140px",
            borderRadius: "3px",
            letterSpacing: "1.5px"
          }}
          className="btn btn-large btn-flat waves-effect white black-text"
        >
          Log In
        </Link>
      </div>);
      case false:

        // return  (
        //   <div>
        //   <Link
        //   to="/adminregister"
        //   onClick={this.onChange}
        //   style={{
        //     width: "140px",
        //     borderRadius: "3px",
        //     letterSpacing: "1.5px"
        //   }}
        //   className="btn btn-large waves-effect waves-light hoverable blue accent-3"
        // >
        //   Register New Admin
        // </Link>
        // </div>
        // );
    }
  };

  render() {   
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Meta</b> Alligators
            </h4>
            <br />
            {/* {this.switchLanding(adminHasInit().isValid)}     */}
            {this.loginLocalComp()}
            {this.loginDukeComp()}
            {/* <Button color="primary" 
          onClick={() => this.onRadioBtnClick()} 
          >Continue to DukeLogin</Button> */}

          </div>
        </div>
      </div>
    );
  }
}

Landing.propTypes = {
  getAllUsers: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { getAllUsers }
)(withRouter(Landing));