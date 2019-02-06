var fileDownload = require('js-file-download');

export const exportSKUS = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    label.push("SKU#");
    label.push("Name");
    label.push("Case UPC");
    label.push("Unit UPC");
    label.push("Unit size");
    label.push("Count per case");
    label.push("Product Line Name");
    label.push("Comment");
    rows.push(label);
    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        var dataLine = [];
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.case_cpc);
        dataLine.push(curData.unit_upc);
        dataLine.push(curData.unit_size);
        dataLine.push(curData.cpc);
        dataLine.push(curData.prod_line.name);
        dataLine.push(curData.comment);
        rows.push(dataLine);
    }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');
}

export const exportIngredients = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    label.push("Ingr#");
    label.push("Name");
    label.push("Vendor Info");
    label.push("Size");
    label.push("Cost");
    label.push("Comment");
    rows.push(label);
    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        var dataLine = [];
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.vendor_info);
        dataLine.push(curData.pkg_size);
        dataLine.push(curData.pkg_cost);
        dataLine.push(curData.comment);
        rows.push(dataLine);
    }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');

}

export const exportCalculator = (dataIN, fileTitle) => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    label.push("Number");
    label.push("Name");
    label.push("Vendor Info");
    label.push("Package Size");
    label.push("Package Cost");
    label.push("Comment");
    label.push("Goal Quantity");
    rows.push(label);
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
        rows.push(dataLine);
    }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');
}

export const exportProdLines = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    label.push("Name");
    rows.push(label);
    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        var dataLine = [];
        dataLine.push(curData.name);
        rows.push(dataLine);
    }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');}