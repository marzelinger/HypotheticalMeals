import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { exportSimpleData } from "../../actions/exportActions";
class ExportSimple extends Component {

  constructor() {
    super();

    this.onExportSimpleClick = this.onExportSimpleClick.bind(this);

    this.state = {
      data: []
    };
  }


  onExportSimpleClick(e){
    e.preventDefault();
    this.props.exportSimpleData(this.props.data);
  };
render() {
    const { user } = this.props.auth;
return (
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem"
              }}
              onClick={this.onExportSimpleClick}
              className="btn btn-small waves-effect waves-light hoverable blue accent-3"
            >
              Export
            </button>
    );
  }
}
ExportSimple.propTypes = {
  exportSimpleData: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { exportSimpleData }
)(ExportSimple);