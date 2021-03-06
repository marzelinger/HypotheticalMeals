import DataStore from '../helpers/DataStore'
import SubmitRequest from '../helpers/SubmitRequest';
var fileDownload = require('js-file-download');

export const exportSKUS = async (dataIN, fileTitle)  => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    label.push("SKU#");
    label.push("Name");
    label.push("Case UPC");
    label.push("Unit UPC");
    label.push("Unit size");
    label.push("Count per case");
    label.push("PL Name");
    label.push("Formula#");
    label.push("Formula factor");
    label.push("ML Shortnames");
    label.push("Rate");
    label.push("Mfg setup cost");
    label.push("Mfg run cost");
    label.push("Comment");
    rows.push(label);
    for(let i = 0; i<count ; i++){
        var half_sku = dataIN[i];
        var curResponse = await SubmitRequest.submitGetSkuByID(half_sku._id);
        if(curResponse.success){
            var curData = curResponse.data[0];
            var dataLine = [];
            console.log('curData: '+JSON.stringify(curData));
            dataLine.push(curData.num);
            dataLine.push(curData.name);
            dataLine.push(curData.case_upc);
            dataLine.push(curData.unit_upc);
            dataLine.push(curData.unit_size);
            dataLine.push(curData.cpc);
            dataLine.push(curData.prod_line['name']);
            dataLine.push(curData.formula['num']);
            dataLine.push(curData.scale_factor);
            var ml_names = "";
            if(curData.manu_lines!=undefined){

                    ml_names+="\"";
                    for (let m = 0; m<curData.manu_lines.length; m++){
                        console.log("manu_line: "+curData.manu_lines[m]);
                        var manu = await SubmitRequest.submitGetManufacturingLineByID(curData.manu_lines[m]);
                        console.log("manu: "+JSON.stringify(manu));
                        if(manu.success){
                            if(manu.data!=undefined){
                                var sn = manu.data[0].short_name;
                                ml_names+=""+sn;
        
                                if(m!=curData.manu_lines.length-1){
                                    ml_names+=",";
                                }
                            }
                        }
                    }
                    ml_names+="\"";
            }
            dataLine.push(ml_names);
            dataLine.push(curData.manu_rate);
            dataLine.push(curData.setup_cost);
            dataLine.push(curData.run_cpc);
            dataLine.push(curData.comment);
            rows.push(dataLine);
        }   
    } 
        let csvContent = "";
        rows.forEach(function(rowArray){
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        }); 
        fileDownload(csvContent, fileTitle+'.csv');
    
}

export const exportFormulas = (dataIN, fileTitle)  => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    label.push("Formula #");
    label.push("Name");
    label.push("Ingr#");
    label.push("Quantity");
    label.push("Comment");
    rows.push(label);

    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        console.log("this is the form: "+JSON.stringify(curData));
        if(curData.ingredients== undefined){
            console.log("no ingredients in this form");
            var dataLine = [];
            dataLine.push(curData.num);
            dataLine.push(curData.name);
            dataLine.push("\"\"");
            dataLine.push("\"\"");
            dataLine.push(curData.comment);
            rows.push(dataLine);

        }
        else if(curData.ingredients!=undefined){
            if(curData.ingredients.length==0){
                console.log("no ingredients in this form");
                var dataLine = [];
                dataLine.push(curData.num);
                dataLine.push(curData.name);
                dataLine.push("\"\"");
                dataLine.push("\"\"");
                dataLine.push(curData.comment);
                rows.push(dataLine);
            }
            else {
                for(let k = 0; k<curData.ingredients.length; k++){
                    console.log("here is the loop:");
                    var dataLine = [];
                    dataLine.push(curData.num);
                    dataLine.push(curData.name);
                    dataLine.push(curData.ingredients[k].num);
                    dataLine.push(curData.ingredient_quantities[k]);
                    if(k==0){
                        dataLine.push(curData.comment);
                    }
                    else{
                        dataLine.push("\"\"");
                    }
                    rows.push(dataLine);
                    console.log("this is the rows: "+rows);
                }
            }
        }
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
    label.push("Package Quantity");
    label.push("Unit Quantity");
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
        dataLine.push(currData.pckgQuant);
        dataLine.push(currData.unitQuantity);
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
    fileDownload(csvContent, fileTitle+'.csv');
}



export const exportReportSKUs = (addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items, fileType ) => {
    const rows = [];
    var fileLabel = [];
    var noAdd = [];
    noAdd.push("No " + fileType +" Added ");
    var noUp = [];
    noUp.push("No " + fileType +" Updated ");
    var noIgn = [];
    noIgn.push("No " + fileType +" Ignored ");


    fileLabel.push("SKU#");
    fileLabel.push("Name");
    fileLabel.push("Case UPC");
    fileLabel.push("Unit UPC");
    fileLabel.push("Unit size");
    fileLabel.push("Count per case");
    fileLabel.push("Product Line Name");
    fileLabel.push("Comment"); 

    if(added_items.length>0){
    rows.push(addedLabel);
    rows.push(fileLabel);
    }
    else{
        rows.push(noAdd);
    }
    for (let a = 0; a<added_items.length; a++){
        var curAdd = added_items[a];
        var addLine = [];
        addLine.push(curAdd.num);
        addLine.push(curAdd.name);
        addLine.push(curAdd.case_upc);
        addLine.push(curAdd.unit_upc);
        addLine.push(curAdd.unit_size);
        addLine.push(curAdd.cpc);
        addLine.push(curAdd.prod_line.name);
        addLine.push(curAdd.comment);
        rows.push(addLine);
    }

    if(updated_items.length>0){
        rows.push(updatedLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noUp);
        }
    for (let u = 0; u<updated_items.length; u++){
        var curUp = updated_items[u];
        var upLine = [];
        upLine.push(curUp.num);
        upLine.push(curUp.name);
        upLine.push(curUp.case_upc);
        upLine.push(curUp.unit_upc);
        upLine.push(curUp.unit_size);
        upLine.push(curUp.cpc);
        upLine.push(curUp.prod_line.name);
        upLine.push(curUp.comment);
        rows.push(upLine);
    }

    if(ignored_items.length>0){
        rows.push(ignoredLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noIgn);
        }
    for (let i = 0; i<ignored_items.length; i++){
        var curIgn = ignored_items[i];
        var ignLine = [];
        ignLine.push(curIgn.num);
        ignLine.push(curIgn.name);
        ignLine.push(curIgn.case_upc);
        ignLine.push(curIgn.unit_upc);
        ignLine.push(curIgn.unit_size);
        ignLine.push(curIgn.cpc);
        ignLine.push(curIgn.prod_line.name);
        ignLine.push(curIgn.comment);
        rows.push(ignLine);
    }
    return rows;
}

export const exportReportIngredients = (addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items , fileType) => {
    const rows = [];
    var fileLabel = [];


    var noAdd = [];
    noAdd.push("No " + fileType +" Added ");
    var noUp = [];
    noUp.push("No " + fileType +" Updated ");
    var noIgn = [];
    noIgn.push("No " + fileType +" Ignored ");

    fileLabel.push("Ingr#");
    fileLabel.push("Name");
    fileLabel.push("Vendor Info");
    fileLabel.push("Size");
    fileLabel.push("Cost");
    fileLabel.push("Comment");


    if(added_items.length>0){
        rows.push(addedLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noAdd);
        }
    for (let a = 0; a<added_items.length; a++){
        var curAdd = added_items[a];
        var addLine = [];
        addLine.push(curAdd.num);
        addLine.push(curAdd.name);
        addLine.push(curAdd.vendor_info);
        addLine.push(curAdd.pkg_size);
        addLine.push(curAdd.pkg_cost);
        addLine.push(curAdd.comment);
        rows.push(addLine);
    }
    if(updated_items.length>0){
        rows.push(updatedLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noUp);
        }
    for (let u = 0; u<updated_items.length; u++){
        var curUp = updated_items[u];
        var upLine = [];
        upLine.push(curUp.num);
        upLine.push(curUp.name);
        upLine.push(curUp.vendor_info);
        upLine.push(curUp.pkg_size);
        upLine.push(curUp.pkg_cost);
        upLine.push(curUp.comment);
        rows.push(upLine);
    }

    if(ignored_items.length>0){
        rows.push(ignoredLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noIgn);
        }
    for (let i = 0; i<ignored_items.length; i++){
        var curIgn = ignored_items[i];
        var ignLine = [];
        ignLine.push(curIgn.num);
        ignLine.push(curIgn.name);
        ignLine.push(curIgn.vendor_info);
        ignLine.push(curIgn.pkg_size);
        ignLine.push(curIgn.pkg_cost);
        ignLine.push(curIgn.comment);
        rows.push(ignLine);
    }
    return rows;

}

export const exportReportProdLines = (addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items , fileType) => {
    const rows = [];
    var fileLabel = [];  
    fileLabel.push("Name");




    var noAdd = [];
    noAdd.push("No " + fileType +" Added ");
    var noUp = [];
    noUp.push("No " + fileType +" Updated ");
    var noIgn = [];
    noIgn.push("No " + fileType +" Ignored ");

    if(added_items.length>0){
        rows.push(addedLabel);
        rows.push(fileLabel);
    }
    else{
        rows.push(noAdd);
    }

    for (let a = 0; a<added_items.length; a++){
        var curAdd = added_items[a];
        var addLine = [];
        addLine.push(curAdd.name);
        rows.push(addLine);
    }

    if(updated_items.length>0){
        rows.push(updatedLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noUp);
        }
    for (let u = 0; u<updated_items.length; u++){
        var curUp = updated_items[u];
        var upLine = [];
        upLine.push(curUp.name);
        rows.push(upLine);
    }

    if(ignored_items.length>0){
        rows.push(ignoredLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noIgn);
        }
    for (let i = 0; i<ignored_items.length; i++){
        var curIgn = ignored_items[i];
        var ignLine = [];
        ignLine.push(curIgn.name);
        rows.push(ignLine);
    }
    return rows;

}

export const exportReportFormulas = (addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items , fileType) => {
    // var fileLabel = [];
    // fileLabel.push("Name");
    // fileLabel.push("Number");
    // fileLabel.push("Case UPC");
    // fileLabel.push("Unit UPC");
    // fileLabel.push("Unit Size");
    // fileLabel.push("Count per Case");
    // fileLabel.push("Product Line Name");
    // fileLabel.push("Comment"); 
    const rows = [];



    var noAdd = [];
    noAdd.push("No " + fileType +" Added ");
    var noUp = [];
    noUp.push("No " + fileType +" Updated ");
    var noIgn = [];
    noIgn.push("No " + fileType +" Ignored ");

    var fileLabel = [];
    fileLabel.push("SKU#");
    fileLabel.push("Name");
    fileLabel.push("Case UPC");
    fileLabel.push("Unit UPC");
    fileLabel.push("Unit size");
    fileLabel.push("Count per case");
    fileLabel.push("Product Line Name");
    fileLabel.push("Comment"); 

    if(added_items.length>0){
    rows.push(addedLabel);
    rows.push(fileLabel);
    }
    else{
        rows.push(noAdd);
    }
    for (let a = 0; a<added_items.length; a++){
        var curAdd = added_items[a];
        var addLine = [];
        addLine.push(curAdd.num);
        addLine.push(curAdd.name);
        addLine.push(curAdd.case_cpc);
        addLine.push(curAdd.unit_upc);
        addLine.push(curAdd.unit_size);
        addLine.push(curAdd.cpc);
        addLine.push(curAdd.prod_line.name);
        addLine.push(curAdd.comment);
        rows.push(addLine);
    }

    if(updated_items.length>0){
        rows.push(updatedLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noUp);
        }
    for (let u = 0; u<updated_items.length; u++){
        var curUp = updated_items[u];
        var upLine = [];
        upLine.push(curUp.num);
        upLine.push(curUp.name);
        upLine.push(curUp.case_cpc);
        upLine.push(curUp.unit_upc);
        upLine.push(curUp.unit_size);
        upLine.push(curUp.cpc);
        upLine.push(curUp.prod_line.name);
        upLine.push(curUp.comment);
        rows.push(upLine);
    }

    if(ignored_items.length>0){
        rows.push(ignoredLabel);
        rows.push(fileLabel);
        }
        else{
            rows.push(noIgn);
        }
    for (let i = 0; i<ignored_items.length; i++){
        var curIgn = ignored_items[i];
        var ignLine = [];
        ignLine.push(curIgn.num);
        ignLine.push(curIgn.name);
        ignLine.push(curIgn.case_cpc);
        ignLine.push(curIgn.unit_upc);
        ignLine.push(curIgn.unit_size);
        ignLine.push(curIgn.cpc);
        ignLine.push(curIgn.prod_line.name);
        ignLine.push(curIgn.comment);
        rows.push(ignLine);
    }
    return rows;

}

export const exportImportReport = (added_items, updated_items, ignored_items, fileType)  => {
    var addedLabel = [];
    addedLabel.push("Added "+ fileType);
    var updatedLabel = [];
    updatedLabel.push("Updated "+fileType);
    var ignoredLabel = [];
    ignoredLabel.push("Ignored "+ fileType);
    var rows = [];
    var fileTitle = "";
    switch(fileType){
        case ("SKUs"):
            rows = exportReportSKUs(addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items, fileType);
            fileTitle = "skus";
            break;
        case("Ingredients"):
            rows = exportReportIngredients(addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items, fileType);
            fileTitle = "ingredients";
            break;
        case ("Formulas"):
            rows = exportReportFormulas(addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items, fileType);
            fileTitle = "formulas";
            break;
        case ("Product Line"): 
            rows = exportReportProdLines(addedLabel, updatedLabel, ignoredLabel,added_items, updated_items, ignored_items, fileType);
            fileTitle = "product_lines";
        break;
      }
        
        let csvContent = "";
        rows.forEach(function(rowArray){
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
         }); 
        fileDownload(csvContent, fileTitle+'.csv');
}

export const exportSalesReport = (dataIN, fileTitle) => {
    var count = dataIN.length;
    const rows = [];
    var label = [];
    let { item_properties, item_property_labels } = DataStore.getSkuSaleReportData()
    label.push(item_property_labels);
    rows.push(label);
    for(let i = 0; i<count ; i++){
        var curData = dataIN[i];
        var dataLine = [];
        for (let j = 0; j < item_properties.length; j++) {
            if (item_properties[j] === 'year' || item_properties[j] === 'week'){
                dataLine.push(curData['date'][item_properties[j]])
            }
            else if (item_properties[j] === 'revenue') {
                dataLine.push(parseInt(curData.sales) * parseFloat(curData.ppc))
            }
            else dataLine.push(curData[item_properties[j]])
        }
        rows.push(dataLine);
    }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');

}

export const exportManuGoal = (dataIN, fileTitle) => {
    console.log('yo')
    var count = dataIN.length;
    const rows = [];
    var label = [];
    let { item_properties, item_property_labels } = DataStore.getManuGoalDataExportData()
    label.push(item_property_labels);
    rows.push(label);
    for(let i = 0; i<count ; i++){
        console.log(curData)
        var curData = dataIN[i];
        var dataLine = [];
        for (let j = 0; j < item_properties.length; j++) {
            if (item_properties[j] === 'name' || item_properties[j] === 'num' || item_properties[j] === 'unit_size' || 
                item_properties[j] === 'cpc' || item_properties[j] === 'manu_rate'){
                dataLine.push(curData.sku[item_properties[j]])
            }
            else dataLine.push(curData[item_properties[j]])
        }
        rows.push(dataLine);
    }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');
}