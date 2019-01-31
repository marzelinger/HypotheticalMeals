var fileDownload = require('js-file-download');

export const exportSimpleData = (dataIN, fileTitle) => dispatch => {

    console.log("fileTitle: "+fileTitle);
    console.log("fileTitle.length: "+fileTitle.length);
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