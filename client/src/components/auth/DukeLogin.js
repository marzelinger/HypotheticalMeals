import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginDukeUser } from "../../actions/authActions";
import classnames from "classnames";
import { Button } from 'reactstrap';
const querystring = require('querystring');

const OAUTH_URL = "https://oauth.oit.duke.edu/oauth/authorize.php";

var client_id = "meta-alligators";
const params = {
  client_id: "meta-alligators",
  client_secret: "zHMB4Sl*o*Awu*mjZv$VEa+fX=QACLIWuRNWyNe@kNtTYLd*4E",
  redirect_uri: "http://localhost:3000/loginDuke",
  response_type: "token",
  state: 7777,
  scope: "basic"
};

var netidtoken = null;

class DukeLogin extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      errors: {},
      netIDAuth: false
    };
  }

  componentDidMount() {
    // If logged in and user navigates to dukelogin page, should redirect them to skus
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/skus");
    }
    this.getNetIDToken();

  }

getNetIDToken(){
  if(window.location.hash.length>0){
    netidtoken = querystring.parse(window.location.hash.substring(1)).access_token;
    console.log("this is the netidtoken2: "+netidtoken);
    if(netidtoken){
      this.setState({ netIDAuth: true});
      this.getNetIDIdentity();
    }
  }
}

getNetIDIdentity(){
  const userData = {
    username: this.state.username,
    password: this.state.password
  };
  this.props.loginDukeUser(this.state.userData, netidtoken, client_id);
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

async onRadioBtnClick() {
  let authURI = OAUTH_URL +'?'+this.encodeGetParams(params);
  console.log("this is the authURI: "+authURI);
  window.location.replace(authURI);
}

encodeGetParams = p => 
  Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");


render() {
    const { errors } = this.state;
return (
      <div className="container">
        <div style={{ marginTop: "4rem" }} className="row">
          <div className="col s8 offset-s2">
          {/* {this.state.netIDAuth ? (
            <Link
            to={"/skus"}
               >
          </Link>
          ) :
          ( */}
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
  loginDukeUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { loginDukeUser }
)(DukeLogin);