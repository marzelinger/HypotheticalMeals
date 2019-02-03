import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { exportSimpleData, exportSKUS, exportIngredients, exportProdLines, exportCalculator } from "../../actions/exportActions";
class ExportSimple extends Component {

  constructor() {
    super();

    this.onExportSimpleClick = this.onExportSimpleClick.bind(this);

    this.state = {
      data: [],
      fileTitle: ""
    };
  }


  onExportSimpleClick(e){
    e.preventDefault();
    console.log("this is the fileTitle"+this.props.fileTitle);
    
    switch(this.props.fileTitle){
      case ("skus"):
        exportSKUS(this.props.data, this.props.fileTitle);
        break;
      case("calculator"):
        exportCalculator(this.props.data, this.props.fileTitle);
        break;
      case ("ingredients"):
        exportIngredients(this.props.data, this.props.fileTitle);
        break;
      case ("productLines"): //TODO WHAT IS THE ACTUAL SYNTAX HERE
        exportProdLines(this.props.data, this.props.fileTitle);
        break;
    }

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
  exportSKUS:PropTypes.func.isRequired,
  exportIngredients:PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { exportSimpleData, exportSKUS, exportIngredients, exportProdLines }
)(ExportSimple);