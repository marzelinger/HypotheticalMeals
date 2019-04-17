// Calculations.js

import SubmitRequest from '../../helpers/SubmitRequest';
import UnitConversion from '../../helpers/UnitConversion';

export default class Calculations{
    //need to calculate total revenue, average revenue per case
    //add up all the sales*price for each record to get the total rev
    //avg revenue per case
    //total revenue/num cases
    //sales = #cases sold
    //price = price per case

    static async getProdLineSalesData (tenYRSKUdata) {
        // console.log("tenYrSKUDATA here: "+JSON.stringify(tenYRSKUdata));
        //need to go through each sku and get the total for each year.
        //need to go through each sku, add the total for that year to the yearTOTAL
        let prodLineData = {
            yearData: [],
            totalData: 0

        };
        var total = 0;
        if(tenYRSKUdata!=undefined){
            if(tenYRSKUdata.skus!=undefined){
                console.log("skus length: "+JSON.stringify(tenYRSKUdata.skus.length));
                for(let sku = 0; sku<tenYRSKUdata.skus.length; sku++){
                    //                tenYRSKUsdata.skus.push({sku: skus[s], skuData: curSkuData, totalData: skuTotalData});
                    var skuLine = tenYRSKUdata.skus[sku];
                    var curSKUData = skuLine.skuData;
                    console.log(" curSKUData: "+JSON.stringify(curSKUData));

                    //go through the ten years.
                    if(curSKUData!=undefined){
                        //     curSkuData.push({ yr: years[yr], salesData: curRowData });
                        //go through and add this data into my current prodLineData.
                        for(let y = 0; y<curSKUData.length; y++){
                            if(prodLineData.yearData.length<10){
                                //haven't gotten all ten spots in yet.

                                prodLineData.yearData.push({
                                    yr: curSKUData[y].yr,
                                    yr_total_rev: curSKUData[y].salesData.revenue
                                });
                                console.log(" prodLineData: "+JSON.stringify(prodLineData));

                            }
                            else{
                                //the first ten added:
                                prodLineData.yearData[y].yr_total_rev += curSKUData[y].salesData.revenue
                                console.log(" prodLineData in second else: "+JSON.stringify(prodLineData));
                            }
                        }
                    }
                }
                console.log("is undefined");
                if(prodLineData.yearData!=undefined){
                    for(let d = 0; d<prodLineData.yearData.length; d++){
                        total+= prodLineData.yearData[d].yr_total_rev
                        console.log(" total: "+JSON.stringify(total));

                    }
                    prodLineData.totalData = total;
                }
            }
        }
        return prodLineData;
    }

    static async getTenYRSalesData(skus, cust_str, dateRanges, years){
        let tenYRSKUsdata = {
            skus: [],
            skuQueued: false
        }
        var queued = false;

        var len = dateRanges.length;
        var start = dateRanges[0].startdate;
        var end = dateRanges[len-1].enddate;

        // var format_date = this.formatDate(start, end);
        var start_date = new Date(start);
        start_date.setHours(start_date.getHours() + 8);
        var end_date = new Date(end)
        end_date.setHours(end_date.getHours() + 8);
        if (skus.length>0){
            for (let s = 0; s<skus.length; s++){
                console.log("sku status: "+skus[s].status);
                if(skus[s].status==="queued") {
                    console.log("IN IFFFF STATEMENT");
                    queued = true;
                }
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
                        await curSkuData.push({ yr: years[yr], salesData: curRowData });
                    }

                }
                cur_ten_yr_avg_case = cur_ten_yr_avg_case/10;
                var skuTotalData = await this.calcTotalData(skus[s], cur_ten_yr_rev, cur_ten_yr_sales, cur_ten_yr_avg_case, start_date.toISOString(), end_date.toISOString());
                tenYRSKUsdata.skus.push({sku: skus[s], skuData: curSkuData, totalData: skuTotalData});
            }
        }
        tenYRSKUsdata.skuQueued = queued;
        return tenYRSKUsdata;
    }

    static async getSalesTotals(records) {

        // console.log("these are the records.")
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

        var avg_rev_per_case_round = Math.round((avg_rev_per_case*100))/100;
        var revenue_round = Math.round((total_rev*100))/100;

        return { 
            revenue: total_rev, 
            avg_rev_per_case: avg_rev_per_case, 
            sales: total_cases, 
            rev_round: revenue_round, 
            avg_rev_per_case_round: avg_rev_per_case_round
        };
    }


    static checkValLength(val){
        var val_str = ""+val;
        var split_val = val_str.split(".");
        if(split_val.length==2){
            if (split_val[1].length>5){
                //want to round.
                return Math.round((val*100000))/100000;
            }
        }
        return val;
    }

    static checkPriceLength(val){
        var val_str = ""+val;
        var split_val = val_str.split(".");
        if(split_val.length==2){
            if (split_val[1].length==1){
                //want to round.
                return val+""+0;
            }
            if (split_val[1].length==0){
                //want to round.
                return val+""+0+""+0;
            }
        }
        return val;
    }

    static async formatDate(start_date, end_date){

        console.log("START DATE: "+start_date);
        console.log("END DATE: "+ end_date);

        
        var start = new Date(start_date);
        start.setHours(start.getHours() + 8);
        var end = new Date(end_date)
        end.setHours(end.getHours() + 8);
        // await this.setState({
        //     start_date: start.toISOString(),
        //     duration: total,
        //     end_date: end_date.toISOString()
        // })

                
        console.log("START TRANSFORMED: "+JSON.stringify(start));
        console.log("END transform; "+JSON.stringify(end));
        

        var data = {
            start : start,
            end: end
        }
        return data;


    }

    static async getAvgManuRunSize(sku, start_date, end_date){
        var avg_manu_run_size = sku.manu_rate * 10;
        var tot_cases = 0;
        console.log("start date in GETAVG: "+JSON.stringify(start_date));
        console.log("end date IN GETAVG: "+JSON.stringify(end_date));

        //get all the activities for that sku
        //get the quantities and then find the average
        var res = await SubmitRequest.submitGetManufacturingActivitiesBySKU(sku._id, start_date, end_date);
        console.log("this is the response here in get avg: "+JSON.stringify(res));
        if(res.success){
            console.log("res success HERE");
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
        // console.log("this is the unit_string: "+unit_string);
        var str = ""+unit_string;
        let match = str.match('^([0-9]+(?:[\.][0-9]{0,10})?|\.[0-9]{1,10}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|' + 
                                      'floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$')
        if (match === null) {
            return { success: false, error: 'Incorrect String Format'}
        }
        // console.log("this is the match: "+ match);
        let val = match[1]
        let unit = match[2]
        return {val: val, unit: unit};
    }

    static async getIngrCostPerCase(sku){
        var ingr_cost_per_case = 0;
        console.log("this is the sku: "+JSON.stringify(sku));
        console.log("this is the name: "+JSON.stringify(sku.name));

        if(sku.formula!=undefined){
            console.log("sku formula exists");

            if(sku.formula.ingredients!=undefined){
                console.log("sku form ingredients exists");
                for(let ing = 0; ing<sku.formula.ingredients.length; ing++){
                    console.log("ing num: "+ing);

                    var ing_cost = sku.formula.ingredients[ing].pkg_cost;
                    console.log("ing_cost: "+ing_cost);

                    var ing_pkg_size = sku.formula.ingredients[ing].pkg_size;
                    console.log("ing_pkg_size: "+ing_pkg_size);

                    var form_ingredient_quant = sku.formula.ingredient_quantities[ing];
                    console.log("form_ingredient_quant: "+form_ingredient_quant);



                    var ing_parse = await this.parseUnitVal(ing_pkg_size);
                    console.log("ing_parse: "+JSON.stringify(ing_parse));

                    var ing_pkg_size_val = ing_parse.val;
                    console.log("ing_pkg_size_val: "+ing_pkg_size_val);

                    //need to convert the formula ingredient quantity to the ingredient pckg size unit.
                    //get the ingredient_pckg_size unit
                    var conversionFuncObj = UnitConversion.getConversionFunction(ing_pkg_size);
                    console.log("this is conversion func obj"+JSON.stringify(conversionFuncObj));
                    var converted_form = conversionFuncObj.func(form_ingredient_quant);
                    console.log("converted_form"+JSON.stringify(converted_form));

                    var form_parse = await this.parseUnitVal(converted_form);
                    console.log("form_parse"+JSON.stringify(form_parse));
                    if (!form_parse.val) return 0;

                    var form_ing_val = form_parse.val;
                    console.log("form_ing_val"+JSON.stringify(form_ing_val));

                    
                    ingr_cost_per_case +=(ing_cost/ing_pkg_size_val) * form_ing_val;
                }
            }
        }
        console.log("INGR CPC: "+ingr_cost_per_case)
        if (ingr_cost_per_case==NaN) return 0;
        return ingr_cost_per_case;
    }

    static async calcTotalData(sku, totalTimeRev, totalTimeSales, tenYRcaseavg, start, end){

        // console.log("sku here: "+JSON.stringify(sku));
        // console.log("sku here: "+JSON.stringify(sku));


       
        var sum_yearly_rev = totalTimeRev;
        var avg_manu_run_size = await this.getAvgManuRunSize(sku, start, end); //find the run size for all the activities for this sku and then divide by the number of activities
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
            profit_marg = ((avg_rev_per_case/total_COGS_per_case)-1)*100;
        }


        // console.log("a: "+ sum_yearly_rev);

        sum_yearly_rev = Math.round((sum_yearly_rev*100))/100;
        // console.log("aa: "+ sum_yearly_rev);
        // console.log("b: "+ ingr_cost_per_case);


        ingr_cost_per_case = Math.round((ingr_cost_per_case*100))/100;

        // console.log("bb: "+ ingr_cost_per_case);



        avg_manu_setup_cost_per_case = Math.round((avg_manu_setup_cost_per_case*100))/100;

        manu_run_cost_per_case = Math.round((manu_run_cost_per_case*100))/100;

        total_COGS_per_case = Math.round((total_COGS_per_case*100))/100;

        avg_rev_per_case = Math.round((avg_rev_per_case*100))/100;

        avg_profit_per_case = Math.round((avg_profit_per_case*100))/100;

        profit_marg = Math.round(profit_marg);


        avg_manu_run_size = Math.round((avg_manu_run_size*100))/100;







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
