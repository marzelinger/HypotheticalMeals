import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Constants from '../../resources/Constants'

import { exportSKUS, exportIngredients, exportProdLines, exportCalculator, exportFormulas, exportSalesReport } from "../../actions/exportActions";
import {exportGeneralReport} from '../SalesReport/GeneralReportExport';
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
      case ("formulas"):
        exportFormulas(this.props.data, this.props.fileTitle);
        break;
      case ("salesReport_sku"):
        exportSalesReport(this.props.data, this.props.fileTitle);
        break;
      case ("general_report"):
        exportGeneralReport(this.props.data, this.props.fileTitle);
        break;
    }

      };
render() {
    const { user } = this.props.auth;
return (
            <div className = "exportbutton hoverable"
              onClick={this.onExportSimpleClick}
              primary={true}
            >
              {this.props.name || 'Export'}
            </div>
    );
  }
}
ExportSimple.propTypes = {
  exportSKUS:PropTypes.func.isRequired,
  exportIngredients:PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { exportSKUS, exportIngredients, exportProdLines }
)(ExportSimple);