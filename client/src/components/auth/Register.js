import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import classnames from "classnames";
import { CustomInput, Form, FormGroup, Label } from 'reactstrap';
import AuthRoleValidation from "./AuthRoleValidation";
import * as Constants from '../../resources/Constants';

const currentUserUsername = require("./currentUserUsername");



class Register extends Component {
  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      username: "",
      password: "",
      password2: "",
      isNetIDLogin: false,
      roles: [],
      manu_lines: [],
      errors: {}
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated && !AuthRoleValidation.checkCurrentUserIsRole(Constants.admin)) {
      this.props.history.push("/skus"); //if they are not an admin, get redirected to skus.
    }

  }

componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }
onChange(e){
    this.setState({ [e.target.id]: e.target.value });
  };

onSubmit(e){
    e.preventDefault();
    const newUser = {
      username: this.state.username,
      password: this.state.password,
      password2: this.state.password2,
      isNetIDLogin: this.state.isNetIDLogin,
      roles: this.state.roles,
      manu_lines: this.state.manu_lines
    };

    // if(AuthRoleValidation.checkCurrentUserIsRole(Constants.admin)){
    //   this.props.registerUser(newUser, this.props.history); 
    // }
    // else{
    //   console.log("person trying to register user when non admin");
    // }
  };




render() {
    const { errors } = this.state;
return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
          <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Go Back
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Register</b> New User Below
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.username}
                  error={errors.username}
                  id="username"
                  type="text"
                  className={classnames("", {
                    invalid: errors.username
                  })}
                />
                <label htmlFor="name">Username</label>
                <span className="red-text">{errors.username}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password
                  })}
                />
                <label htmlFor="password">Password</label>
                <span className="red-text">{errors.password}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password2}
                  error={errors.password2}
                  id="password2"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password2
                  })}
                />
                <label htmlFor="password2">Confirm Password</label>
                <span className="red-text">{errors.password2}</span>
              </div>

              <FormGroup>
        </FormGroup>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem",
                    backgroundColor: "rgb(0, 188, 212)"
                  }}
                  type="submit"
                  className="hoverable"
                >
                  Register New User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { registerUser }
)(withRouter(Register));