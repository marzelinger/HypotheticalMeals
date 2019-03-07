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
                for(let yr = 0; yr<dateRanges.length; yr++){
                    let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', skus[s]._id, 
                    dateRanges[yr]['startdate'], dateRanges[yr]['enddate'], 0, 0);
                    if(datares.success){
                        console.log("this is the dateres: "+JSON.stringify(datares));
                        var curRowData = await Calculations.getSalesTotalPerYear(datares.data);
                        console.log("this is the curRowData: "+JSON.stringify(curRowData));
                        curSkuData.push({ yr: yr, salesData: curRowData });
                    }

                }
                tenYRSKUsdata.skus.push({sku: skus[s]._id, skuData: curSkuData});
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
        return { yr_revenue: total_rev, yr_avg_rev_per_case: avg_rev_per_case};
    }










  }
