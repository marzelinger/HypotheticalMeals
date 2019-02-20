import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";
import classnames from "classnames";
import { Button } from 'reactstrap';
const querystring = require('querystring');

const OAUTH_URL = "https://oauth.oit.duke.edu/oauth/authorize.php";
//const OAUTH_URL = "https://oauth.oit.duke.edu/oauth/authorize.php";

// const response_type = "token";
// const redirect_uri = "http://localhost:3000";
// const scope = "basic";
// const state = "7777";
// const client_id = "meta-alligators";
// const client_secret = "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E";

const params = {
  client_id: "meta-alligators",
  client_secret: "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E",
  redirect_uri: "http://localhost:3000",
  response_type: "token",
  state: 7777,
  scope: "basic"
};

var access_token = null;


class DukeLogin extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      errors: {}
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to skus
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/skus");
    }
  }



componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/skus"); // push user to skus when they login
    }
if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }
onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };
  
onSubmit = e => {
    e.preventDefault();
const userData = {
      username: this.state.username,
      password: this.state.password
    };
  this.props.loginUser(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
  };

 async getAccessToken () {
    console.log("access_token: "+ access_token);
   var url = window.location.href;
   var regex = new RegExp("access_token" + "(=([^&#]*)|&|#|$)"),
   results = regex.exec(url);
   if (results == null) return 0;
   return results[2];
}

 async checkAccessToken (authURI) {
  access_token = await this.getAccessToken();
  console.log(access_token);
  if (!access_token) {
      //window.location.replace(OAUTH_URL + this.getQueryString());
      window.location.replace(authURI)
  }
}

// getQueryString () {
//    return "?" + $.param({
//        response_type: 'token',
//        redirect_uri: 'http://localhost:3000/login',
//        client_id: 'meta-alligators',
//        scope: 'basic events:event:update',
//        state: 11291
//    });
// }

async onRadioBtnClick() {
  //this.setState({  });
  let authURI = OAUTH_URL +'?'+this.encodeGetParams(params);
    console.log("this is the authURI: "+authURI);
  await this.checkAccessToken(authURI);

  //decodeURIComponent
  console.log("this is the parse "+querystring.parse(window.location.hash));

  //window.location.href = authURI;
  await console.log("this is the hash: "+window.location.hash);
  //let hash = window.location.hash;
  //access_token = this.getAccessToken();
  console.log('this is access_token'+access_token);

  //access_token = this.getAccessToken();
  console.log('this is access_token2 '+access_token);



}

encodeGetParams = p => 
  Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");


render() {
    const { errors } = this.state;
return (
      <div className="container">
        <div style={{ marginTop: "4rem" }} className="row">
          <div className="col s8 offset-s2">
          {/* <Redirect to="/skus" /> */}
          {/* <Redirect to = {OAUTH_URL}/> */}
          <Button color="primary" 
          onClick={() => this.onRadioBtnClick()} 
          >Continue to DukeLogin</Button>

          </div>
        </div>
      </div>
    );
  }
}
DukeLogin.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { loginUser }
)(DukeLogin);