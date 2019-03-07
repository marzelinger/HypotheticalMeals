// Calculations.js

import SubmitRequest from '../../helpers/SubmitRequest';

const dateRanges =  [
    //start jan 1 2010
    { 'startdate': "2010-01-01", 'enddate': "2010-12-31"},
    { 'startdate': "2011-01-01", 'enddate': "2011-12-31"},
    { 'startdate': "2012-01-01", 'enddate': "2012-12-31"},
    { 'startdate': "2013-01-01", 'enddate': "2013-12-31"},
    { 'startdate': "2014-01-01", 'enddate': "2014-12-31"},
    { 'startdate': "2015-01-01", 'enddate': "2015-12-31"},
    { 'startdate': "2016-01-01", 'enddate': "2016-12-31"},
    { 'startdate': "2017-01-01", 'enddate': "2017-12-31"},
    { 'startdate': "2018-01-01", 'enddate': "2018-12-31"},
    { 'startdate': "2019-01-01", 'enddate': "2019-12-31"}
    //end jan1 2019
];


export default class Calculations{

    constructor(props) {

        this.state = {
            dateRanges: [
                //start jan 1 2010
                { 'startdate': "2010-01-01", 'enddate': "2010-12-31"},
                { 'startdate': "2011-01-01", 'enddate': "2011-12-31"},
                { 'startdate': "2012-01-01", 'enddate': "2012-12-31"},
                { 'startdate': "2013-01-01", 'enddate': "2013-12-31"},
                { 'startdate': "2014-01-01", 'enddate': "2014-12-31"},
                { 'startdate': "2015-01-01", 'enddate': "2015-12-31"},
                { 'startdate': "2016-01-01", 'enddate': "2016-12-31"},
                { 'startdate': "2017-01-01", 'enddate': "2017-12-31"},
                { 'startdate': "2018-01-01", 'enddate': "2018-12-31"},
                { 'startdate': "2019-01-01", 'enddate': "2019-12-31"}
                //end jan1 2019
            ],
        }
    }


    //need to calculate total revenue, average revenue per case
    //add up all the sales*price for each record to get the total rev
    //avg revenue per case
    //total revenue/num cases
    //sales = #cases sold
    //price = price per case
    static async getTenYRSalesData(skus, cust_str){
        let tenYRSKUsdata = {
            skus: []
        }
        if (skus.length>0){
            for (let s = 0; s<skus.length; s++){
                // //need to go through all the prodlines. and then through all the skus.
                var curSkuData = [];
                var cur_ten_yr_sum = 0;
                var cur_ten_yr_sales = 0;
                var cur_ten_yr_avg_case = 0;
                for(let yr = 0; yr<dateRanges.length; yr++){
                    let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', skus[s]._id, 
                    dateRanges[yr]['startdate'], dateRanges[yr]['enddate'], 0, 0);
                    if(datares.success){
                        console.log("this is the dateres: "+JSON.stringify(datares));
                        var curRowData = await Calculations.getSalesTotalPerYear(datares.data);
                        console.log("this is the curRowData: "+JSON.stringify(curRowData));
                        cur_ten_yr_sum += curRowData.yr_revenue;
                        cur_ten_yr_sales += curRowData.yr_sales;
                        cur_ten_yr_avg_case += curRowData.yr_avg_rev_per_case;
                        curSkuData.push({ yr: yr, salesData: curRowData });
                    }

                }
                cur_ten_yr_avg_case = cur_ten_yr_avg_case/10;
                var {skuTotalData} = this.calcTotalData(skus[s], cur_ten_yr_sum, cur_ten_yr_sales, cur_ten_yr_avg_case);
                tenYRSKUsdata.skus.push({sku: skus[s]._id, skuData: curSkuData, totalData: skuTotalData});

                console.log("cur ten yr: "+ JSON.stringify(tenYRSKUsdata));
            }
        }
        return tenYRSKUsdata;
    }


    static getSalesTotalPerYear(records) {
        var total_rev = 0;
        var total_cases = 0;
        var avg_rev_per_case = 0;
        console.log("records in calcs "+JSON.stringify(records));
        for (let rec = 0; rec<records.length; rec++){
            total_cases +=records[rec].sales;
            total_rev += (records[rec].sales * records[rec].ppc);
        }
        if(total_cases!=0){
            avg_rev_per_case = total_rev/total_cases;
        }
        console.log("total rev: "+total_rev + " avg per case: "+avg_rev_per_case);
        return { yr_revenue: total_rev, yr_avg_rev_per_case: avg_rev_per_case, yr_sales: total_cases};
    }



    static async calcTotalData(sku, tenYRrev, tenYRsales, tenYRcaseavg){
        var sum_yearly_rev = 0;
        var avg_manu_run_size = 0; //find the run size for all the activities for this sku and then divide by the number of activities
        var ingr_cost_per_case = 0;
        var avg_manu_setup_cost_per_case = 0;
        var manu_run_cost_per_case = 0;
        var total_COGS_per_case = 0;
        var avg_rev_per_case = 0; // = revenue sum / numsales
        var avg_profit_per_case = 0; // = avg_rev - cogs
        var profit_marg = 0;


    }









  }
