import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { exportDependencyReport} from "../../actions/exportActions";
class DependencyReport extends Component {

  constructor() {
    super();

    this.onExportDependencyReport = this.onExportDependencyReport.bind(this);

    this.state = {
      data: [],
      fileTitle: ""
    };
  }


  onExportDependencyReport(e){
    e.preventDefault();
    

      this.props.exportDependencyReport(this.props.data);
     
      };



render() {
    const { user } = this.props.auth;
return (
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1px",
                marginTop: "1rem"
              }}
              onClick={this.onExportDependencyReport}
              className="btn btn-small waves-effect waves-light hoverable blue accent-3"
            >
              Dependency Report
            </button>
    );
  }
}
DependencyReport.propTypes = {
  exportDependencyReport: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { exportDependencyReport}
)(DependencyReport);