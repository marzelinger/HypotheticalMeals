import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getAllUsers } from "../../actions/authActions";



const adminHasInit = require("../auth/adminHasInit");

var firstAdminInit = false;


class Landing extends Component {

  state = {}

  constructor() {
    super();
    
    this.state = {};
  }


  componentDidMount() {
    console.log("trying to mount the adminregister" +this.props.history);
    var response = this.props.getAllUsers();
    this.setState(this.state);
  }
  onChange = () => {
    this.setState(this.state)
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

        return  (
          <div>
          <Link
          to="/adminregister"
          style={{
            width: "140px",
            borderRadius: "3px",
            letterSpacing: "1.5px"
          }}
          className="btn btn-large waves-effect waves-light hoverable blue accent-3"
        >
          Register New Admin
        </Link>
        </div>
        );
    }
  };





  render() {
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>blah</b> blahhhhhhhh
            </h4>
            <p className="flow-text grey-text text-darken-1">
              Blah Blah Blah Blah Food Yum
            </p>
            <br />
            <div> 
            {this.switchLanding(adminHasInit().isValid)}          
              </div>
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

//export default Landing;



// {
//   currentUserIsAdmin().isValid 
//   ? (
//   <div>
//   <Link
//   to="/register"
//   style={{
//     width: "140px",
//     borderRadius: "3px",
//     letterSpacing: "1.5px"
//   }}
//   className="btn btn-large waves-effect waves-light hoverable blue accent-3"
// >
//   Register New User
// </Link>
// </div>)
// : (<div/>)
// }




// class Landing extends Component {
//   render() {
//     return (
//       <div style={{ height: "75vh" }} className="container valign-wrapper">
//         <div className="row">
//           <div className="col s12 center-align">
//             <h4>
//               <b>blah</b> blahhhhhhhh
//             </h4>
//             <p className="flow-text grey-text text-darken-1">
//               Blah Blah Blah Blah Food Yum
//             </p>
//             <br />
//             <div className="col s6">
//               <Link
//                 to="/adminregister"
//                 style={{
//                   width: "140px",
//                   borderRadius: "3px",
//                   letterSpacing: "1.5px"
//                 }}
//                 className="btn btn-large waves-effect waves-light hoverable blue accent-3"
//               >
//                 Register First Admin
//               </Link>
//             </div>
//             <div className="col s6">
//               <Link
//                 to="/login"
//                 style={{
//                   width: "140px",
//                   borderRadius: "3px",
//                   letterSpacing: "1.5px"
//                 }}
//                 className="btn btn-large btn-flat waves-effect white black-text"
//               >
//                 Log In
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
