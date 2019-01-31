var fileDownload = require('js-file-download');

export const exportSimpleData = (dataIN, fileTitle) => dispatch => {

    console.log("fileTitle: "+fileTitle);
    console.log("fileTitle.length: "+fileTitle.length);
};

//Users shall be able to create a tabular report showing a 
//set of ingredients (the selection of which follows the 
//same rules as the “view options” described in req 2.1.2). 
//For each ingredient, all SKUs made with the ingredient shall be shown. 
export const exportDependencyReport = (ingredients) => dispatch => {
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
            fetch('/api/skus/'+curData.skus[s], { method: 'GET' })
            .then(data => data.json())
            .then((res) => {
            if (!res.success) this.setState({ error: res.error });
            else 

            console.log("this is the sku obj: "+ res.data);
            });

        }

    }    
    //fileDownload(finalData, fileTitle+'.csv');

};


 export const exportSKUS = (dataIN, fileTitle) => dispatch => {
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

export const exportIngredients = (dataIN, fileTitle) => dispatch => {
    var count = dataIN.length;
    var finalData = [];
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

export const exportProdLines = (dataIN, fileTitle) => dispatch => {
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