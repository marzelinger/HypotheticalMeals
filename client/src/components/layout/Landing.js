import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getAllUsers } from "../../actions/authActions";



const adminHasInit = require("../auth/adminHasInit");

var firstAdminInit = false;


class Landing extends Component {


  constructor() {
    super();
    
    this.state = {};
  }


  componentDidMount() {
    console.log("trying to mount the adminregister" +this.props.history);
    //var response = this.props.getAllUsers();
    //console.log("this is the response from getAllUsers with specific: "+response.data.name);
    //console.log("in the component mounting of landing, local storage says firstAdminCreated is; "+localStorage.getItem("firstAdminCreated"));
//console.log("the length is : "+ res.data.data.length);

    // if(response.data.data.length>0){
    //   localStorage.setItem("firstAdminCreated", true);
    // }
    // else{
    //   localStorage.setItem("firstAdminCreated", false);
    // }

  }

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
            {
                !localStorage.getItem("firstAdminCreated")
                ? (
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
              )
              : (
              
            
            <div className="col s6">
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
            </div>
              )
              }
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
