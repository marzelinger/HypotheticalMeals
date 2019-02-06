import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import * as Constants from '../../resources/Constants';
import SubmitRequest from '../../helpers/SubmitRequest'

var fileDownload = require('js-file-download');

const currentPage = 0;
const pageSize = 0;


export default class DependencyReport extends Component {

  constructor() {
    super();

    this.onExportDependencyReport = this.onExportDependencyReport.bind(this);

    this.state = {
      data: [],
      fileTitle: "",
    };
  }


  onExportDependencyReport(e){
    e.preventDefault();
    this.loadDataFromServerForReport(this.props.data, );   
      };


//Users shall be able to create a tabular report showing a 
//set of ingredients (the selection of which follows the 
//same rules as the “view options” described in req 2.1.2). 
//For each ingredient, all SKUs made with the ingredient shall be shown. 
async loadDataFromServerForReport(ingredients){

    var fileTitle = "Ingredient_Dependency_Report";
    var count = ingredients.length;
    console.log("this is how many ingredients there are: "+count);
    var finalData = [];
    for(let ing = 0; ing<count ; ing++){
        var curData = ingredients[ing];
        var dataLine = [];
        finalData.push("INGREDIENTS");
        finalData.push("\r");
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.vendor_info);
        dataLine.push(curData.pkg_size);
        dataLine.push(curData.pkg_cost);
        dataLine.push(curData.comment);
        finalData.push("\r\n");
        finalData.push(dataLine);
        console.log("this is the dataline: "+dataLine);
        var res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, 
          "_", curData._id, "_", currentPage, pageSize, "_");
        console.log("this is the res: "+res);

        if (!res.success) {
          this.setState({ error: res.error });
        }
        else {
          var resData = res.data;
          console.log("this is the skuData: "+resData);
          console.log('this is the res.data.length: '+resData.length);
          console.log("this is the skuData string: "+JSON.stringify(resData));
        for(let s = 0; s<resData.length; s++){
          var curSku = [];
          var curSkuObj = resData[s];
          finalData.push("SKUS");
          curSku.push(curSkuObj.num);
          console.log("this is the num: "+curSkuObj.num);
          curSku.push(curSkuObj.name);
          curSku.push(curSkuObj.case_cpc);
          curSku.push(curSkuObj.unit_upc);
          curSku.push(curSkuObj.unit_size);
          curSku.push(curSkuObj.cpc);
          curSku.push(curSkuObj.prod_line.name);
          console.log("this is the prod: "+curSkuObj.prod_line.name);
          console.log("this is the prod string: "+JSON.stringify(curSkuObj.prod_line));


          curSku.push(curSkuObj.comment);
          finalData.push("\r\n");
          console.log("this is the curSku: "+curSku);
          finalData.push(curSku);
          finalData.push("\r\n");
          console.log("this is the skuData: "+finalData);
        }
      }


        //console.log("this is the ingSkus: "+ ingSKUs);

        //finalData.push(ingSKUs);
        console.log("this is the finalData: "+ finalData);
        //finalData.push("\r\n");
    }    
    fileDownload(finalData, fileTitle+'.csv');
};

render() {
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