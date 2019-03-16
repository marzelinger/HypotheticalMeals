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
    //need to calculate total revenue, average revenue per case
    //add up all the sales*price for each record to get the total rev
    //avg revenue per case
    //total revenue/num cases
    //sales = #cases sold
    //price = price per case
    static async getTenYRSalesData(skus, cust_str){
        console.log("in calcs: skus are: "+JSON.stringify(skus));
        let tenYRSKUsdata = {
            skus: []
        }
        if (skus.length>0){
            for (let s = 0; s<skus.length; s++){
                // //need to go through all the prodlines. and then through all the skus.
                var curSkuData = [];
                var cur_ten_yr_rev = 0;
                var cur_ten_yr_sales = 0;
                var cur_ten_yr_avg_case = 0;
                for(let yr = 0; yr<dateRanges.length; yr++){
                    console.log("in calcs: yr: "+JSON.stringify(yr));

                    let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', skus[s]._id, 
                    dateRanges[yr]['startdate'], dateRanges[yr]['enddate'], 0, 0);
                    if(datares.success){
                        console.log("this is the dateres: "+JSON.stringify(datares));
                        var curRowData = await this.getSalesTotals(datares.data);
                        cur_ten_yr_rev += curRowData.revenue;
                        cur_ten_yr_sales += curRowData.sales;
                        cur_ten_yr_avg_case += curRowData.avg_rev_per_case;
                        await curSkuData.push({ yr: yr, salesData: curRowData });
                        console.log("this is the curSKUDATA: "+JSON.stringify(curSkuData));

                    }

                }
                cur_ten_yr_avg_case = cur_ten_yr_avg_case/10;
                //var {skuTotalData} = await this.calcTotalData(skus[s], cur_ten_yr_rev, cur_ten_yr_sales, cur_ten_yr_avg_case);
                var skuTotalData = {};
                console.log("cur skuTotal : "+ JSON.stringify(skuTotalData));

                tenYRSKUsdata.skus.push({sku: skus[s], skuData: curSkuData, totalData: skuTotalData});

                console.log("cur ten yr: "+ JSON.stringify(tenYRSKUsdata));
            }
        }
        return tenYRSKUsdata;
    }

    static async getSimpleSKUData(sku, cust_str){
        var curSkuData = [];
        var cur_ten_yr_rev = 0;
        var cur_ten_yr_sales = 0;
        var cur_ten_yr_avg_case = 0;
        for(let yr = 0; yr<dateRanges.length; yr++){
            let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', sku._id, 
                dateRanges[yr]['startdate'], dateRanges[yr]['enddate'], 0, 0);
            if(datares.success){
                console.log("this is the dateres: "+JSON.stringify(datares));
                var curRowData = await this.getSalesTotals(datares.data);
                console.log("this is the curRowData: "+JSON.stringify(curRowData));
                cur_ten_yr_rev += curRowData.revenue;
                cur_ten_yr_sales += curRowData.sales;
                cur_ten_yr_avg_case += curRowData.avg_rev_per_case;
                curSkuData.push({ yr: yr, salesData: curRowData });
            }

        }
        cur_ten_yr_avg_case = cur_ten_yr_avg_case/10;
        return {cur_ten_yr_rev: cur_ten_yr_rev, cur_ten_yr_sales: cur_ten_yr_sales, cur_ten_yr_avg_case : cur_ten_yr_avg_case};
    }

    static async getSalesTotals(records) {
        var total_rev = 0;
        var total_cases = 0;
        var avg_rev_per_case = 0;
        // console.log("records in calcs "+JSON.stringify(records));
        for (let rec = 0; rec<records.length; rec++){
            total_cases +=records[rec].sales;
            total_rev += (records[rec].sales * records[rec].ppc);
        }
        if(total_cases!=0){
            avg_rev_per_case = total_rev/total_cases;
        }
        console.log("total rev: "+total_rev + " avg per case: "+avg_rev_per_case);
        return { revenue: total_rev, avg_rev_per_case: avg_rev_per_case, sales: total_cases};
    }

    static async getAvgManuRunSize(sku){
        var avg_manu_run_size = 0;
        var tot_cases = 0;
        //get all the activities for that sku
        //get the quantities and then find the average
        var res = SubmitRequest.submitGetManufacturingActivitiesBySKU(sku);
        if(res.success){
            if(res.data.length>0){
                var manu_activities = res.data;
                //manu activities exist
                for (let act = 0; act<manu_activities.length; act ++){
                    tot_cases += manu_activities[act].quantity;
                }
                avg_manu_run_size = tot_cases/manu_activities.length;
            }
            else {
                //no manu activities with this
                //assume a one day 10 hour manufacturing duration to derive the avg run size.
                avg_manu_run_size = sku.manu_rate * 10;
            }
        }
        return avg_manu_run_size;
    }

    static async parseUnitVal(unit_string){
        let match = unit_string.match('^([0-9]+(?:[\.][0-9]{0,10})?|\.[0-9]{1,10}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|' + 
                                      'floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$')
        if (match === null) {
            return { success: false, error: 'Incorrect String Format'}
        }
        let val = match[1]
        let unit = match[2]
        return {val: val, unit: unit};
    }

    static async getIngrCostPerCase(sku){
        var ingr_cost_per_case = 0;
        if(sku.formula.ingredients!=undefined){
            for(let ing = 0; ing<sku.formula.ingredients.length; ing++){
                var ing_cost = sku.formula.ingredients[ing].pkg_cost;
                var {ing_pkg_size, unit} = this.parseUnitVal(sku.formula.ingredients[ing].pkg_size)
                var {form_quant, unit} = this.parseUnitVal(sku.formula.ingredient_quantities[ing]);
                ingr_cost_per_case +=(ing_cost/ing_pkg_size) * form_quant;
            }
        }
        return ingr_cost_per_case;
    }

    static async calcTotalData(sku, totalTimeRev, totalTimeSales, tenYRcaseavg){

       
        var sum_yearly_rev = totalTimeRev;
        var avg_manu_run_size = await this.getAvgManuRunSize(sku); //find the run size for all the activities for this sku and then divide by the number of activities
        var ingr_cost_per_case = await this.getIngrCostPerCase(sku);
        var avg_manu_setup_cost_per_case = sku.setup_cost/avg_manu_run_size;//manufacturing setup cost/avg_manu_runsize
        var manu_run_cost_per_case = sku.run_cpc; //isn't this already given to us?
        var total_COGS_per_case = ingr_cost_per_case+avg_manu_setup_cost_per_case+manu_run_cost_per_case; // sum of ingredient cost, manufacturing setup cost, manufacturing run cost for sku divided to give a cost per case
        var avg_rev_per_case = sum_yearly_rev/totalTimeSales; // = revenue sum / numsales 
        var avg_profit_per_case = avg_rev_per_case - total_COGS_per_case; // = avg_rev - cogs
        var profit_marg = (avg_rev_per_case/total_COGS_per_case)-1;
        console.log("these are the values; "+ sum_yearly_rev +"  "+ avg_manu_run_size+ "  "+ingr_cost_per_case+"  "
        +avg_manu_setup_cost_per_case);
        return {
            sum_yearly_rev : sum_yearly_rev,
            avg_manu_run_size : avg_manu_run_size,
            ingr_cost_per_case : ingr_cost_per_case,
            avg_manu_setup_cost_per_case : avg_manu_setup_cost_per_case,
            manu_run_cost_per_case : manu_run_cost_per_case,
            total_COGS_per_case : total_COGS_per_case,
            avg_rev_per_case : avg_rev_per_case,
            avg_profit_per_case : avg_profit_per_case,
            profit_marg : profit_marg
        }
    }









  }
