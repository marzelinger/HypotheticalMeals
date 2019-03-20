var fileDownload = require('js-file-download');

export const exportGeneralReport = (dataIN, fileTitle)  => {

    //need to go through like this
    //pl 1 : Product Line , pl_name
    //sku 1: Sku header
    //sku 1: sku information
    //records header
    // record yr 0
    //..
    // record yr 9
    // total header
    //total data
    const rows = [];

    var plHeader = [];
    plHeader.push("Product Line Name");

    var sku_header = [];
    sku_header.push("SKU#");
    sku_header.push("Name");
    sku_header.push("Case UPC");
    sku_header.push("Unit UPC");
    sku_header.push("Unit Size");
    sku_header.push("Count per Case");
    sku_header.push("Setup Cost");
    sku_header.push("Run Cost per Case");

    var records_header = [];
    records_header.push("Year");
    records_header.push("Total Revenue");
    records_header.push("Average Revenue Per Case");

    var totals_header = [];
    totals_header.push("Sum of Yearly Revenues");
    totals_header.push("Average Manufacturing Run Size");
    totals_header.push("Ingredient Cost Per Case");
    totals_header.push("Average Manufacturing Setup Cost Per Case");
    totals_header.push("Manufacturing Run Cost Per Case");
    totals_header.push("Total COGS Per Case");
    totals_header.push("Average Revenue Per Case");
    totals_header.push("Average Profit Per Case");
    totals_header.push("Proft Margin");

    var prodlines = dataIN.length;
    for(let pl = 0; pl<prodlines; pl++){
        //then go in the 
        var cur_pl_row = dataIN[pl];
        var cur_pl = cur_pl_row.prod_line;
        var cur_ten_yr_data = cur_pl_row.tenYRSKUdata;

        rows.push()

        var cur_skus = cur_pl_row.tenYRSKUdata.skus;
        for(let s = 0; s<cur_skus.length; s++){
            var cur_sku_row = cur_pl_row.tenYRSKUdata.skus[s];
            var cur_sku = cur_sku_row.sku;
            var cur_sku_data = cur_sku_row.skuData;
            var cur_sku_totals = cur_sku_row.totalData;


            // var dataLine = [];
            // dataLine.push(curData.num);
            // dataLine.push(curData.name);
            // dataLine.push(curData.case_upc);
            // dataLine.push(curData.unit_upc);
            // dataLine.push(curData.unit_size);
            // dataLine.push(curData.cpc);
            // dataLine.push(curData.prod_line.name);
            // dataLine.push(curData.comment);
            // rows.push(dataLine);













        }


    }











    // rows.push(label);
    // for(let i = 0; i<count ; i++){
    //     var curData = dataIN[i];
    //     var dataLine = [];
    //     dataLine.push(curData.num);
    //     dataLine.push(curData.name);
    //     dataLine.push(curData.case_upc);
    //     dataLine.push(curData.unit_upc);
    //     dataLine.push(curData.unit_size);
    //     dataLine.push(curData.cpc);
    //     dataLine.push(curData.prod_line.name);
    //     dataLine.push(curData.comment);
    //     rows.push(dataLine);
    // }    
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');
}
