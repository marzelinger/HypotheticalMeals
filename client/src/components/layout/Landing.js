import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getAllUsers } from "../../actions/authActions";

const adminHasInit = require("../auth/adminHasInit");

class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: 0
    };
    console.log("this is user state: " +this.state.user);

    var response = this.props.getAllUsers();
    console.log('this is the constructor for landing');
    this.change = this.change.bind(this);
   // console.log("this is the response for the getAll Users: " +sessionStorage.getItem('firstAdminCreated'));
    // if (response != null){
    //   this.setState({
    //     user : 1
    //   });
    // }
      //console.log("this is the response data: " +response.data.data.length);

    

  }

  change(){
    var response = this.props.getAllUsers();

    this.setState = {
      user: 0
    }
  }


  componentDidMount() {
    console.log("trying to mount the adminregister" +this.props.history);
    var response = this.props.getAllUsers();
    console.log("this is the response for the getAll Users: " +response);
    this.setState(this.state.users);
  }

  componentWillReceiveProps(nextProps) {
    var response = this.props.getAllUsers();
    console.log("this is the response for the getAll Users: " +response);
    if (response != null){
      this.setState({
        user : 1
      });
    }
  }



  onChange = () => {
    console.log("something is changing on change");
    var response = this.props.getAllUsers();
    this.setState({
      user : 1
    }
      
    );
    //this.setState(this.state)
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
          onClick={this.onChange}
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
    var response = this.props.getAllUsers();
   
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
            {this.switchLanding(adminHasInit().isValid)}    
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
