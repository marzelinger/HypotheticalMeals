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

    //to start let's simply show the ingredient followed by it's SKUs
    //ie
    //ingredient
    //sku
    //ingredient
    //sku
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
        var ingSKUS = curData.skus.length;
        console.log("this is the dataline: "+dataLine);
        console.log("this is the ingSkus: "+ingSKUS);

        for(let s = 0; s<ingSKUS; s++){
            //need to make a call to the db for each
            //SKU number
            //router.get('/skus/:sku_id', (req, res) => SkuHandler.getSkuByID(req, res));
            var skuLine = [];
            var skuObj;
            console.log('this is the skusid: '+ curData.skus[s]);
            fetch('/api/skus/'+curData.skus[s], { method: 'GET' })
            .then(data => data.json())
            .then((res) => {
                console.log("in the then");
                if (!res.success) {
                    this.setState({ error: res.error });
                    console.log("there was an error: "+res.error);
                }
                else 

                console.log("this is the sku obj.data: "+ res.data.data);
                console.log("this is the sku obj.: "+ res.data);
                console.log("this is the sku stringify: "+ JSON.stringify(res.data[0]));
                var skuData = res.data[0];
                //make the sku row
                skuLine.push(skuData.num);
                skuLine.push(skuData.name);
                skuLine.push(skuData.case_cpc);
                skuLine.push(skuData.unit_upc);
                skuLine.push(skuData.unit_size);
                skuLine.push(skuData.cpc);
                skuLine.push(skuData.prod_line);
                skuLine.push(skuData.comment);
                skuLine.push("\r\n");
                console.log("this is the skuLine: "+ skuLine);
                //finalData.push(skuLine);
            });
            finalData.push(skuLine);
            console.log("this is the finalData: "+ finalData);
        }
        finalData.push("\r\n");
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