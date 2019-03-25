import SubmitRequest from '../helpers/SubmitRequest';
import { splitIngQuantity} from "./splitIngQuantity";
import Calculations from "../components/SalesReport/Calculations";
import UnitConversion from "../helpers/UnitConversion";

var fileDownload = require('js-file-download');
//The former should be fine: name, number, and quantity/unit for ingredients.
const html2canvas = require('html2canvas');
const jsPDF = require('jspdf');

    export const exportManuScheduleReport = async (manuData) => {
        // console.log("making the manu report in export manu schedule report: ");
        
        
        let res = await SubmitRequest.submitGetManufacturingActivitiesForReport(manuData);
        if(res.success){
            console.log("this is the res: "+JSON.stringify(res));

            // console.log("complete_acti: "+JSON.stringify(res.data.complete_activities));
            // console.log("beginning_cut: "+JSON.stringify(res.data.beginning_cut));
            // console.log("ending_cut: "+JSON.stringify(res.data.ending_cut));
            // console.log("allcut: "+JSON.stringify(res.data.all_cut));
            //createManuReport(manuData, res.data);
            let calculations = await doCalcs(manuData, res.data.complete_activities);
            // let calculations = {}
            // console.log("this is the CALCULATIONS; "+JSON.stringify(calculations));
            return { reportData : {
                complete: res.data.complete_activities,
                beg_cut: res.data.beginning_cut,
                end_cut: res.data.ending_cut,
                all_cut: res.data.all_cut,
                summation: calculations
                }
            };
        } 
        else{
            console.log("error in the manureport");
            return {};
        } 
    }

    export const doCalcs = async (manuData, activitites) => {
        var ingSUMmap = new Map();
        if(activitites.length==0) return [];
        var calculations =[];
        for(let act = 0; act<activitites.length; act++){
            var curAct = activitites[act];
            var sku = curAct.sku;
            if(sku !=undefined){
                var numIngs=0;
                if(sku.formula!=undefined){
                    if(sku.formula.ingredients!= undefined){
                        numIngs = sku.formula.ingredients.length;
                    }
                }

                for (let ing = 0; ing<numIngs; ing++){
                    var ing_pkg_size = sku.formula.ingredients[ing].pkg_size;
                    console.log("ing_pkg_size: "+JSON.stringify(ing_pkg_size));

                    var form_ingredient_quant = sku.formula.ingredient_quantities[ing];
                    console.log("form_ingredient_quant: "+JSON.stringify(form_ingredient_quant));

                    var ing_parse = await Calculations.parseUnitVal(ing_pkg_size);
                    console.log("ing_parse: "+JSON.stringify(ing_parse));

                    var ing_pkg_size_val = ing_parse.val;
                    var ing_pkg_size_unit = ing_parse.unit;
                    console.log("ing_pkg_size_val: "+JSON.stringify(ing_pkg_size_val));

                    //need to convert the formula ingredient quantity to the ingredient pckg size unit.
                    //get the ingredient_pckg_size unit
                    var conversionFuncObj = UnitConversion.getConversionFunction(ing_pkg_size);
                    console.log("this is conversion func obj"+JSON.stringify(conversionFuncObj));
                    console.log("form_ingredient_quant: "+form_ingredient_quant);
                    var converted_form = conversionFuncObj.func(form_ingredient_quant);
                    console.log("converted_form: "+JSON.stringify(converted_form));

                    var form_parse = await Calculations.parseUnitVal(converted_form);
                    var form_ing_val = form_parse.val;
                    var form_ing_unit = form_parse.unit;
                    console.log("form_ing_val: "+JSON.stringify(form_ing_val));

                    //form_ing_val is the correct unit number to now multiply by the 
                    console.log("scale_factor: "+sku.scale_factor);
                    console.log("quant: "+curAct.quantity);


                    var cur_ing_sum = Number(form_ing_val)*Number(sku.scale_factor)*Number(curAct.quantity);
                    console.log("cur_ing_sum: "+JSON.stringify(cur_ing_sum));
                    //convert the form quant to the ing pckg size unit and then you add the num to the 
                    //now want to add each ing into the map
                    //map is key =ing value = [sum, num packages]
                    //map_val[0] = sum
                    //map_val[1] = num_pckg
                    //console.log("sku: "+JSON.stringify(sku));
                    if(ingSUMmap.has(sku.formula.ingredients[ing].name)){
                        //want to add the values together.
                        console.log("ing_name: "+sku.formula.ingredients[ing].name);
                        var map_val = ingSUMmap.get(sku.formula.ingredients[ing].name);
                        console.log("map_val: "+JSON.stringify(map_val));

                        var map_ing_parse = await Calculations.parseUnitVal(map_val[0]);
                        console.log("map_ing_parse: "+JSON.stringify(map_ing_parse));
                        var new_sum = Number(cur_ing_sum) + Number(map_ing_parse.val);
                        console.log("new_sum: "+new_sum);


                        var new_num_pckg = Number(new_sum)/Number(ing_pkg_size_val);
                        console.log("new_num_pckg: "+new_num_pckg);


                        var new_map_val = [new_sum+" "+form_ing_unit, new_num_pckg];
                        console.log("new_map_val: "+new_map_val);
                        ingSUMmap.set(sku.formula.ingredients[ing].name, new_map_val);
                        // console.log("in the map stuff");
                        console.log("map current: "+ingSUMmap);

                    }
                    else{
                        var new_num_pckg = Number(cur_ing_sum)/Number(ing_pkg_size_val);
                        console.log("new_num_pckg2: "+new_num_pckg);
                        var new_map_val = [cur_ing_sum+" "+form_ing_unit, new_num_pckg];
                        console.log("new_map_val2: "+JSON.stringify(new_map_val));

                        ingSUMmap.set(sku.formula.ingredients[ing].name, 
                            new_map_val);
                    }
                }
            }
        }
        var ingNames = [];
        var ingTots = [];
        var ingPckgCounts = []
        console.log("keys2: "+ingSUMmap.keys());
        console.log("vals3: "+ingSUMmap.values());

        for(let [k,v] of ingSUMmap){
            console.log("key: "+k);
            console.log("vals: "+JSON.stringify(v));
            ingNames.push(k);
            ingTots.push(v[0]);
            //ingPckgCounts.push(Math.round((v[1]*100))/100);
            ingPckgCounts.push(v[1]);

        }

        return {summation: {
                ingredientNames: ingNames,
                ingredientQuantities: ingTots,
                ingredientPckgCounts: ingPckgCounts
                    }
            };
    }



















//THIS WORKS DO NOT EDIT JUST IN CASE.
export const createManuReport = (reportData, data) => {
    const rows = [];
    // console.log("this is the data.complete_act: "+JSON.stringify(data.complete_activities));
    var complete = data.complete_activities;
    var beg_cut = data.beginning_cut; //will be empty?
    var end_cut = data.ending_cut;
    var all_cut = data.all_cut;
    var header = [];
    var ingSUMmap = new Map();
    header.push("Manufacturing Schedule Report for "+new Date(reportData.start_date) +" to "+new Date(reportData.end_date)+" (Duration "+reportData.duration+" hour(s)) on Manufacturing Line: "+ reportData.manu_line.short_name);
    rows.push(header);
    rows.push(["\r\n"]);

    var numActs = complete.length;
    for(let act = 0; act<numActs; act++){
        var manulabel= [];
        var curAct = complete[act];
        // console.log("this is the curAct: "+JSON.stringify(curAct));

        var curStart = new Date(curAct.start);
        //var curEnd = getEndTime(curStart, curAct.duration);
        var curEnd = new Date(curAct.start);
        curEnd.setMilliseconds(curEnd.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));

        // console.log("this is the curstart and end: "+ curStart +"    "+curEnd);
        var manuIndex = act+1;
        rows.push(["\r\n"]);
        manulabel.push("("+manuIndex+") Manufacturing Activity from "+ curStart+" to "+curEnd+" with Duration of "+curAct.duration+ " hour(s) to produce "+curAct.quantity+" case(s).");
        rows.push(manulabel);
        rows.push(skuHeader());
        var skuline = [];
        var skudata = curAct.sku;
        // console.log("this is the current sku: "+ JSON.stringify(skudata));

        skuline.push(skudata.num);
        skuline.push(skudata.name);
        if(skudata.formula!=undefined){
            if(skudata.formula.num != undefined){
                skuline.push(skudata.formula.num);
            }
            else {
                skuline.push("");

            }
        }
        else{
            skuline.push("");

        }
        skuline.push(skudata.scale_factor);
        rows.push(skuline);
        var numIngs=0;
        if(skudata.formula!=undefined){
            if(skudata.formula.ingredients!= undefined){
                numIngs = skudata.formula.ingredients.length;
                rows.push(ingHeader());
            }
        }

        for (let ing = 0; ing<numIngs; ing++){
            var curIng = skudata.formula.ingredients[ing];
            // console.log("this is the current ing: "+ JSON.stringify(curIng));
            var ingLine = [];
            ingLine.push(skudata.formula.ingredients[ing].name);
            ingLine.push(skudata.formula.ingredient_quantities[ing]);
            rows.push(ingLine);

            var {ingQuant, ingMeas} = splitIngQuantity(skudata.formula.ingredient_quantities[ing]);

            //now want to add each ing into the map
            //map is key =ing value = sum
            if(ingSUMmap.has(skudata.formula.ingredients[ing].name)){
                //want to add the values together.
                var {ingFromMap, ingMeasMap} = splitIngQuantity(ingSUMmap.get(skudata.formula.ingredients[ing].name));
                var tot = ingFromMap + ingQuant*curAct.quantity;
                ingSUMmap.set(skudata.formula.ingredients[ing].name, tot+""+ingMeas);
                // console.log("in the map stuff");
                // console.log("this is the tot; "+tot);

            }
            else{ //TODO DOUBLE CHECK THIS SUMMATION AFTER BELAL'S STUFF
                ingSUMmap.set(skudata.formula.ingredients[ing].name, 
                    ingQuant*curAct.quantity+""+ingMeas);
                    // console.log("in the map 3");

            }
        }

    }
    // console.log("isummation??? ");
    rows.push(["\r\n"]);
    rows.push(["This is the Summation of All Ingredients in This Timespan"]);    
    rows.push(ingHeader());
    // console.log("the keyset is: "+JSON.stringify(ingSUMmap.keys));
    //var summationData = getSummationData(data,reportData);
    for( var k in ingSUMmap){
        console.log("in the map with key: "+(k));
        var ingLabel = []
        ingLabel.push(k);
        ingLabel.push(ingSUMmap.get(k));
        rows.push(ingLabel);
    }


    if(all_cut.length>0){
        rows.push(["\r\n"]);
        rows.push(["The Following Activities Began Before the Timespan and Ended After the Timespan"]);
        rows.push(getBadActivities(all_cut));
    }

    if(beg_cut.length>0){
        rows.push(["\r\n"]);
        rows.push(["The Following Activities Began Before the Timespan and Ended During the Timespan"]);
        rows.push(getBadActivities(beg_cut));
    }

    if(end_cut.length>0){
        rows.push(["\r\n"]);
        rows.push(["The Following Activities Began During the Timespan and Ended After the Timespan"]);
        rows.push(getBadActivities(end_cut));
    }

    
   


    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, "Manufacturing Schedule Report For "+reportData.manu_line.short_name+'.csv');

}


export const getBadActivities = (data) =>{
    var rows = [];
    var numActs = data.length;

    for(let act = 0; act<numActs; act++){
        var manulabel= [];
        var curAct = data[act];

        var curStart = new Date(curAct.start);
        var curEnd = new Date(curAct.start);
        curEnd.setMilliseconds(curEnd.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));
        var manuIndex = act+1;
        rows.push(["\r\n"]);
        manulabel.push("("+manuIndex+") Manufacturing Activity from "+ curStart+" to "+curEnd+" with Duration of "+curAct.duration+ " hour(s) to produce "+curAct.quantity+" case(s).");
        rows.push(manulabel);
    }

    return rows;

}

export const skuHeader = () => {
    var label = [];
    label.push("SKU#");
    label.push("Name");
    label.push("Formula#");
    label.push("Formula Factor");
    return label;

}

export const ingHeader = () => {
    var label = [];
    label.push("Ingr#");
    label.push("Quantity");
    return label;

}

// export const exportSKUS = (dataIN, fileTitle)  => {
//     var count = dataIN.length;
//     const rows = [];
//     var label = skuHeader();
//     rows.push(label);
//     for(let i = 0; i<count ; i++){
//         var curData = dataIN[i];
//         var dataLine = [];
//         dataLine.push(curData.num);
//         dataLine.push(curData.name);
//         if(curData.formula != null ){
//             if(curData.formula.num != null){
//                 dataLine.push(curData.formula.num);
//             }
//             else{
//                 dataLine.push("");

//             }
//         }
//         else{
//             dataLine.push("");

//         }
//         dataLine.push(curData.scale_factor);
//         rows.push(dataLine);
//     }    
//     let csvContent = "";
//     rows.forEach(function(rowArray){
//         let row = rowArray.join(",");
//         csvContent += row + "\r\n";
//      }); 
//     fileDownload(csvContent, fileTitle+'.csv');
// }