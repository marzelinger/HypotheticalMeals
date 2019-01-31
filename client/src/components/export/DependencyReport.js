import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
var fileDownload = require('js-file-download');

export default class DependencyReport extends Component {

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
    this.loadDataFromServerForReport(this.props.data);
     
      };


//Users shall be able to create a tabular report showing a 
//set of ingredients (the selection of which follows the 
//same rules as the “view options” described in req 2.1.2). 
//For each ingredient, all SKUs made with the ingredient shall be shown. 
loadDataFromServerForReport = (ingredients) => {
    var fileTitle = "Ingredient_Dependency_Report";
    var count = ingredients.length;
    var finalData = [];
    for(let ing = 0; ing<count ; ing++){
        var curData = ingredients[ing];
        var dataLine = [];
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.vendor_info);
        dataLine.push(curData.pkg_size);
        dataLine.push(curData.pkg_cost);
        dataLine.push(curData.comment);
        dataLine.push("\r\n");
        finalData.push(dataLine);
        //var ingSKUS = curData.skus.length;
        console.log("this is the dataline: "+dataLine);
        //console.log("this is the ingSkus: "+ingSKUS);
        var ingSKUs = this.getSKUSbyIngId(curData._id);
        console.log("this is the ingSkus: "+ ingSKUs);

        finalData.push(ingSKUs);
        console.log("this is the finalData: "+ finalData);
        finalData.push("\r\n");
    }    
    fileDownload(finalData, fileTitle+'.csv');
};


getSKUSbyIngId = (ingID) => {
    console.log('this is the ingID: '+ ingID);
    var skuData = [];
    fetch('/api/skus_by_ingredient/'+ingID, { method: 'GET' })
    .then(data => data.json())
    .then((res) => {
      console.log("this is the response: "+res);

      if (!res.success) {
      this.setState({ error: res.error });
      }
      else {
        var resData = res.data;
        console.log("this is the skuData: "+resData);
        console.log("this is the skuData string: "+JSON.stringify(resData));
        for(let s = 0; s<resData.length; s++){
          var curSku = [];
          var curSkuObj = resData[s];
          curSku.push(curSkuObj.num);
          console.log("this is the num: "+curSkuObj.num);
          curSku.push(curSkuObj.name);
          curSku.push(curSkuObj.case_cpc);
          curSku.push(curSkuObj.unit_upc);
          curSku.push(curSkuObj.unit_size);
          curSku.push(curSkuObj.cpc);
          curSku.push(curSkuObj.prod_line);
          curSku.push(curSkuObj.comment);
          curSku.push("\r\n");
          console.log("this is the curSku: "+curSku);
          skuData.push(curSku);
          console.log("this is the skuData: "+skuData);
        }
        console.log("this is the skuLine: "+ curSku);
      }
    });
    return skuData;

}





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