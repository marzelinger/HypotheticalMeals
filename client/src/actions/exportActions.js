var fileDownload = require('js-file-download');

export const exportSimpleData = (dataIN, fileTitle) => dispatch => {

    console.log("fileTitle: "+fileTitle);
    console.log("fileTitle.length: "+fileTitle.length);
};

//Users shall be able to create a tabular report showing a 
//set of ingredients (the selection of which follows the 
//same rules as the “view options” described in req 2.1.2). 
//For each ingredient, all SKUs made with the ingredient shall be shown. 
export const exportDependencyReport = (ingredients) => {
    var fileTitle = "Ingredient_Dependency_Report";
    var count = ingredients.length;
    var finalData = [];

    //to start let's simply show the ingredient followed by it's SKUs
    //ie
    //ingredient
    //sku
    //sku
    //sku
    //ingredient
    //sku
    //sku
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
        for(let s = 0; s<ingSKUS; s++){
            //need to make a call to the db for each
            //SKU number
            //router.get('/skus/:sku_id', (req, res) => SkuHandler.getSkuByID(req, res));
            console.log("in the double for loop of skus s: "+ s);
            console.log('this is the skusid: '+ curData.skus[s]);
            fetch('/api/skus/'+curData.skus[s], { method: 'GET' })
            .then(data => data.json())
            .then((res) => {
            if (!res.success) this.setState({ error: res.error });
            else 
            console.log("this is the sku obj.data: "+ res.data.data);
            var skuData = res.data;
            //make the sku row
            var skuLine = [];
            skuLine.push(skuData.num);
            console.log("this is the sku num: "+ skuData.num);

            skuLine.push(skuData.name);
            console.log("this is the sku name: "+ skuData.name);

            skuLine.push(skuData.case_cpc);
            console.log("this is the sku case-cpc: "+ skuData.case_cpc);

            skuLine.push(skuData.unit_upc);
            console.log("this is the sku unitupc: "+ skuData.unit_upc);

            skuLine.push(skuData.unit_size);

            skuLine.push(skuData.cpc);

            skuLine.push(skuData.prod_line);

            skuLine.push(skuData.comment);
            skuLine.push("\r\n");
            finalData.push(skuLine);
            });

        }
        finalData.push("\r\n");
    }    
    fileDownload(finalData, fileTitle+'.csv');

};


 export const exportSKUS = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    var finalData = [];
    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        var dataLine = [];
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.case_cpc);
        dataLine.push(curData.unit_upc);
        dataLine.push(curData.unit_size);
        dataLine.push(curData.cpc);
        dataLine.push(curData.prod_line);
        dataLine.push(curData.comment);
        dataLine.push("\r\n");
        finalData[i] = dataLine;
    }    
    fileDownload(finalData, fileTitle+'.csv');
}

export const exportIngredients = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    var finalData = [];
    console.log("this is the dataIN: "+dataIN);
    console.log("this is the dataIN[0]: "+dataIN[0]);
    console.log("this is the dataIN[0].num: "+dataIN[0].num);
    console.log("this is the ing stringify: "+ JSON.stringify(dataIN[0]));



    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        var dataLine = [];
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.vendor_info);
        dataLine.push(curData.pkg_size);
        dataLine.push(curData.pkg_cost);
        dataLine.push(curData.comment);
        dataLine.push("\r\n");
        finalData[i] = dataLine;
    }    
    fileDownload(finalData, fileTitle+'.csv');
}

export const exportCalculator = (dataIN, fileTitle) => {
    var count = dataIN.length;
    var finalData = [];
    for(let i = 0; i<count ; i++){
        var currData = dataIN[i];
        var dataLine = [];
        dataLine.push(currData.num);
        dataLine.push(currData.name);
        dataLine.push(currData.vendor_info);
        dataLine.push(currData.pkg_size);
        dataLine.push(currData.pkg_cost);
        dataLine.push(currData.comment);
        dataLine.push(currData.goalQuantity);
        dataLine.push("\r\n");
        finalData[i] = dataLine;
    }    
    fileDownload(finalData, fileTitle+'.csv');
}

export const exportProdLines = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    var finalData = [];
    for(let i = 0; i<count ; i++){
        console.log("here in the for loop");
        var curData = dataIN[i];
        console.log(curData);
        var dataLine = [];
        dataLine.push(curData.name);
        dataLine.push("\r\n");
        finalData[i] = dataLine;
    }    
    fileDownload(finalData, fileTitle+'.csv');
}