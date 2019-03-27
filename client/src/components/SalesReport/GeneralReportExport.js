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
        //add the pl header and name
        var plName = [];
        plName.push(cur_pl.name);
        rows.push(plHeader);
        rows.push(plName);
        var cur_skus = cur_pl_row.tenYRSKUdata.skus;
        for(let s = 0; s<cur_skus.length; s++){
            var cur_sku_row = cur_pl_row.tenYRSKUdata.skus[s];
            var cur_sku = cur_sku_row.sku;
            var cur_sku_data = cur_sku_row.skuData;
            var cur_sku_totals = cur_sku_row.totalData;

            //push the sku header
            rows.push(sku_header);
            //push the sku info
            var sku_line = [];
            sku_line.push(cur_sku.num);
            sku_line.push(cur_sku.name);
            sku_line.push(cur_sku.case_upc);
            sku_line.push(cur_sku.unit_upc);
            sku_line.push(cur_sku.unit_size);
            sku_line.push(cur_sku.cpc);
            sku_line.push(cur_sku.setup_cost);
            sku_line.push(cur_sku.run_cpc);
            rows.push(sku_line);
            //push records header
            rows.push(records_header);
            for (let y = 0; y<cur_sku_data.length; y++){
                var cur_yr = cur_sku_data[y].yr;
                var cur_sales_data = cur_sku_data[y].salesData;
                var cur_rev_rounded = cur_sales_data.rev_round;
                var avg_rev_per_case_round = cur_sales_data.avg_rev_per_case_round;
                var record_line = [];
                record_line.push(cur_yr);
                record_line.push(cur_rev_rounded);
                record_line.push(avg_rev_per_case_round);
                rows.push(record_line);

            }

            rows.push(totals_header);
            var tot_line = [];
            tot_line.push(cur_sku_totals.sum_yearly_rev);
            tot_line.push(cur_sku_totals.avg_manu_run_size);
            tot_line.push(cur_sku_totals.ingr_cost_per_case);
            tot_line.push(cur_sku_totals.avg_manu_setup_cost_per_case);
            tot_line.push(cur_sku_totals.manu_run_cost_per_case);
            tot_line.push(cur_sku_totals.total_COGS_per_case);
            tot_line.push(cur_sku_totals.avg_rev_per_case);
            tot_line.push(cur_sku_totals.avg_profit_per_case);
            tot_line.push(cur_sku_totals.profit_marg);
            rows.push(tot_line);
        }
    }
 
    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, fileTitle+'.csv');
}
