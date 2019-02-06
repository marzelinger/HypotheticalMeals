import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import classnames from "classnames";
const currentUserIsAdmin = require("./currentUserIsAdmin");

var userIsAdmin = false;

class Register extends Component {
  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      errors: {}
    };
  }

  componentDidMount() {
    console.log("trying to mount the register" +this.props.history);

    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated && !currentUserIsAdmin().isValid) {
      this.props.history.push("/skus"); //if they are not an admin, get redirected to skus.
      console.log("mounted" +this.props.history);
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
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2,
      privileges: []
    };
    console.log(e);
    console.log(this.state);
    console.log(this.props.history);
    console.log(this.props);
    console.log(newUser);

    if(currentUserIsAdmin().isValid){
      this.props.registerUser(newUser, this.props.history); 
    }
    else{
      console.log("person trying to register user when non admin");
    }
  };




render() {
    const { errors } = this.state;
return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">

            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Register</b> New User Below
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.name}
                  error={errors.name}
                  id="name"
                  type="text"
                  className={classnames("", {
                    invalid: errors.name
                  })}
                />
                <label htmlFor="name">Name</label>
                <span className="red-text">{errors.name}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  className={classnames("", {
                    invalid: errors.email
                  })}
                />
                <label htmlFor="email">Email</label>
                <span className="red-text">{errors.email}</span>
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