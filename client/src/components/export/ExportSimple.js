import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Constants from '../../resources/Constants'

import { exportSKUS, exportIngredients, exportProdLines, exportCalculator, exportFormulas, exportSalesReport, exportManuGoal } from "../../actions/exportActions";
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


  async onExportSimpleClick(e){
    console.log(this.props.data)
    if(this.props.data!=undefined){
    e.preventDefault();
    
    switch(this.props.fileTitle){
      case ("skus"):
        await exportSKUS(this.props.data, this.props.fileTitle);
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
    if (this.props.fileTitle.substring(this.props.fileTitle.length, this.props.fileTitle.length - 5) === '_goal'){
      exportManuGoal(this.props.data, this.props.fileTitle);
    }
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
  auth: PropTypes.object.isRequired,
  disabled: PropTypes.string
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { exportSKUS, exportIngredients, exportProdLines }
)(ExportSimple);