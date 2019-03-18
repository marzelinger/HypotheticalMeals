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
    //end dec 31 2019
];


export default class Calculations{
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
                var cur_ten_yr_rev = 0;
                var cur_ten_yr_sales = 0;
                var cur_ten_yr_avg_case = 0;
                for(let yr = 0; yr<dateRanges.length; yr++){

                    let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', skus[s]._id, 
                    dateRanges[yr]['startdate'], dateRanges[yr]['enddate'], 0, 0);
                    if(datares.success){
                        var curRowData = await this.getSalesTotals(datares.data);
                        cur_ten_yr_rev += curRowData.revenue;
                        cur_ten_yr_sales += curRowData.sales;
                        cur_ten_yr_avg_case += curRowData.avg_rev_per_case;
                        await curSkuData.push({ yr: yr, salesData: curRowData });
                    }

                }
                cur_ten_yr_avg_case = cur_ten_yr_avg_case/10;
                var skuTotalData = await this.calcTotalData(skus[s], cur_ten_yr_rev, cur_ten_yr_sales, cur_ten_yr_avg_case);
                tenYRSKUsdata.skus.push({sku: skus[s], skuData: curSkuData, totalData: skuTotalData});
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
                var curRowData = await this.getSalesTotals(datares.data);
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
        for (let rec = 0; rec<records.length; rec++){
            total_cases +=records[rec].sales;
            total_rev += (records[rec].sales * records[rec].ppc);
        }
        if(total_cases!=0){
            avg_rev_per_case = total_rev/total_cases;
        }
        return { revenue: total_rev, avg_rev_per_case: avg_rev_per_case, sales: total_cases};
    }

    static async getAvgManuRunSize(sku){
        var avg_manu_run_size = sku.manu_rate * 10;
        var tot_cases = 0;
        //get all the activities for that sku
        //get the quantities and then find the average
        var res = await SubmitRequest.submitGetManufacturingActivitiesBySKU(sku);
        if(res.success){
            if(res.data.length>0){
                var manu_activities = res.data;
                //manu activities exist
                for (let act = 0; act<manu_activities.length; act ++){
                    tot_cases += manu_activities[act].quantity;
                }
                avg_manu_run_size = tot_cases/manu_activities.length;
                return avg_manu_run_size;
            }
        }
        return avg_manu_run_size;
    }

    static async parseUnitVal(unit_string){
        console.log("this is the unit_string: "+unit_string);
        var str = ""+unit_string;
        let match = str.match('^([0-9]+(?:[\.][0-9]{0,10})?|\.[0-9]{1,10}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|' + 
                                      'floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$')
        if (match === null) {
            return { success: false, error: 'Incorrect String Format'}
        }
        console.log("this is the match: "+ match);
        let val = match[1]
        let unit = match[2]
        return {val: val, unit: unit};
    }

    static async getIngrCostPerCase(sku){
        var ingr_cost_per_case = 0;
        console.log("this is the sku: "+JSON.stringify(sku));
        if(sku.formula.ingredients!=undefined){
            for(let ing = 0; ing<sku.formula.ingredients.length; ing++){
                var ing_cost = sku.formula.ingredients[ing].pkg_cost;
                console.log("ing quant; "+sku.formula.ingredients[ing].pkg_size);
                console.log("form ing quant; "+sku.formula.ingredient_quantities[ing]);

                var ingr_parse = await this.parseUnitVal(sku.formula.ingredients[ing].pkg_size);
                //var {ing_pkg_size, unit} = this.parseUnitVal(sku.formula.ingredients[ing].pkg_size);
                var ing_pkg_size = ingr_parse.val;
                console.log('this is the ingr-parse; '+JSON.stringify(ingr_parse));
                console.log("ingpackage: "+ing_pkg_size);
                var form_parse = await this.parseUnitVal(sku.formula.ingredient_quantities[ing]);
                //var {form_quant, unit} = this.parseUnitVal(sku.formula.ingredient_quantities[ing]);
                var form_quant = form_parse.val;
                console.log('this is the formparse; '+JSON.stringify(form_parse));

                console.log("form_quant; "+form_quant);
                
                ingr_cost_per_case +=(ing_cost/ing_pkg_size) * form_quant;
            }
        }
        console.log("INGR CPC: "+ingr_cost_per_case)
        return ingr_cost_per_case;
    }

    static async calcTotalData(sku, totalTimeRev, totalTimeSales, tenYRcaseavg){

       
        var sum_yearly_rev = totalTimeRev;
        var avg_manu_run_size = await this.getAvgManuRunSize(sku); //find the run size for all the activities for this sku and then divide by the number of activities
        var ingr_cost_per_case = await this.getIngrCostPerCase(sku);
        var avg_manu_setup_cost_per_case = 0;
        if(avg_manu_run_size!=0){
            avg_manu_setup_cost_per_case = sku.setup_cost/avg_manu_run_size;
        }//manufacturing setup cost/avg_manu_runsize
        var manu_run_cost_per_case = sku.run_cpc; 
        var total_COGS_per_case = ingr_cost_per_case+avg_manu_setup_cost_per_case+manu_run_cost_per_case; // sum of ingredient cost, manufacturing setup cost, manufacturing run cost for sku divided to give a cost per case
        var avg_rev_per_case = 0;
        if(totalTimeSales!=0){
            avg_rev_per_case = sum_yearly_rev/totalTimeSales; 
        }
        var avg_profit_per_case = avg_rev_per_case - total_COGS_per_case; // = avg_rev - cogs
        var profit_marg = 0;

        if(total_COGS_per_case!=0){
            profit_marg = (avg_rev_per_case/total_COGS_per_case)-1;
        }
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
