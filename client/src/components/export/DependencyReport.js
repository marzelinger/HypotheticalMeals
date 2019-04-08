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
    var finalData = [];
    const rows = [];
    var skulabel = [];
    skulabel.push("SKU#");
    skulabel.push("Name");
    skulabel.push("Case UPC");
    skulabel.push("Unit UPC");
    skulabel.push("Unit size");
    skulabel.push("Count per case");
    skulabel.push("PL Name");
    skulabel.push("Formula#");
    skulabel.push("Formula factor");
    skulabel.push("ML Shortnames");
    skulabel.push("Rate");
    skulabel.push("Mfg setup cost");
    skulabel.push("Mfg run cost");
    skulabel.push("Comment");
    var inglabel = [];
    inglabel.push("Ingr#");
    inglabel.push("Name");
    inglabel.push("Vendor Info");
    inglabel.push("Size");
    inglabel.push("Cost");
    inglabel.push("Comment");
    var ingBIG = [];
    var skuBIG = [];
    ingBIG.push("INGREDIENT");
    skuBIG.push("SKUS");

    for(let ing = 0; ing<count ; ing++){
        var curData = ingredients[ing];
        var dataLine = [];
        rows.push(ingBIG);
        rows.push(inglabel);
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.vendor_info);
        dataLine.push(curData.pkg_size);
        dataLine.push(curData.pkg_cost);
        dataLine.push(curData.comment);
        rows.push(dataLine);

        var res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, 
          "_", curData._id, "_", currentPage, pageSize, "_", "_");

        if (!res.success) {
          this.setState({ error: res.error });
        }
        else {
          var resData = res.data;
        if(resData.length>0){
          rows.push(skuBIG);
          rows.push(skulabel);
        }
          for(let s = 0; s<resData.length; s++){
          var curSku = [];
          var curSkuObj = resData[s];
          console.log("curSkuObj: "+JSON.stringify(curSkuObj));
          curSku.push(curSkuObj.num);
          curSku.push(curSkuObj.name);
          curSku.push(curSkuObj.case_upc);
          curSku.push(curSkuObj.unit_upc);
          curSku.push(curSkuObj.unit_size);
          curSku.push(curSkuObj.cpc);
          curSku.push(curSkuObj.prod_line.name);
          curSku.push(curSkuObj.formula.num);
          curSku.push(curSkuObj.scale_factor);
          var ml_names = "";
          if(curSkuObj.manu_lines!=undefined){
            ml_names+="\"";
            for (let m = 0; m<curSkuObj.manu_lines.length; m++){
                console.log("manu_line: "+curSkuObj.manu_lines[m]);
                var manu = await SubmitRequest.submitGetManufacturingLineByID(curSkuObj.manu_lines[m]);
                console.log("manu: "+JSON.stringify(manu));
                if(manu.success){
                    if(manu.data!=undefined){
                        var sn = manu.data[0].short_name;
                        ml_names+=""+sn;

                        if(m!=curSkuObj.manu_lines.length-1){
                            ml_names+=",";
                        }
                    }
                }
            }
            ml_names+="\"";
          }
          curSku.push(ml_names);
          curSku.push(curSkuObj.manu_rate);
          curSku.push(curSkuObj.setup_cost);
          curSku.push(curSkuObj.run_cpc);
          curSku.push(curSkuObj.comment);
          rows.push(curSku);
        }
      }

    }    

    let csvContent = "";
    for(let r = 0; r<rows.length; r++){

      let row = rows[r];
      if(row.length>0){
        let curRow = row[0];
        for (let c = 1; c<row.length; c++){
         curRow+=","+row[c];
        }
      csvContent += curRow + "\r\n";
    }
    }
    fileDownload(csvContent, fileTitle+'.csv');
};

render() {
return (
              <div className = "depbutton hoverable"
              onClick={this.onExportSimpleClick}
              primary={true}
              onClick={this.onExportDependencyReport}
               >
              Dependency Report
               </div>
    );
  }
}