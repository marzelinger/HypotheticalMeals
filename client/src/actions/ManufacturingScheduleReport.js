import SubmitRequest from '../helpers/SubmitRequest';
import { splitIngQuantity} from "./splitIngQuantity";

var fileDownload = require('js-file-download');
//The former should be fine: name, number, and quantity/unit for ingredients.
const html2canvas = require('html2canvas');
const jsPDF = require('jspdf');

export const exportManuScheduleReport = async (manuData) => {
    // console.log("making the manu report in export manu schedule report: ");
    
    
    let res = await SubmitRequest.submitGetManufacturingActivitiesForReport(manuData);
    if(res.success){

        // console.log("complete_acti: "+JSON.stringify(res.data.complete_activities));
        // console.log("beginning_cut: "+JSON.stringify(res.data.beginning_cut));
        // console.log("ending_cut: "+JSON.stringify(res.data.ending_cut));
        // console.log("allcut: "+JSON.stringify(res.data.all_cut));
        //createManuReport(manuData, res.data);
        // let calculations = doCalcs(manuData, res.data.complete_activities);
        let calculations = {}
        // console.log("this is the CALCULATIONS; "+JSON.stringify(calculations));
        return { reportData : {
            complete: res.data.complete_activities,
            beg_cut: res.data.beg_cut,
            end_cut: res.data.end_cut,
            all_cut: res.data.all_cut,
            summation: calculations
        }
        }
    } 
    else{
        console.log("error in the manureport");
        return {};
    } 
}

export const doCalcs = (manuData, activitites) => {
    var ingSUMmap = new Map();
    if(activitites.length==0) return [];
    var calculations =[];
    for(let act = 0; act<activitites.length; act++){
        var curAct = activitites[act];
        var skudata = curAct.sku;
        if(skudata !=undefined){
        var numIngs=0;
        if(skudata.formula!=undefined){
            if(skudata.formula.ingredients!= undefined){
                numIngs = skudata.formula.ingredients.length;
            }
        }

        for (let ing = 0; ing<numIngs; ing++){

            var curIng = skudata.formula.ingredients[ing];
            // console.log("this is the current ing: "+ JSON.stringify(curIng));
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

    }
    var ingNames = [];
    var ingTots = [];
    for( var k in ingSUMmap){
        ingNames.push(k);
        ingTots.push(ingSUMmap.get(k));
        // console.log("this is the INGNAMES; "+JSON.stringify(ingNames));
        // console.log("this is the ingTOTS; "+JSON.stringify(ingTots));
    }

    return {summation: {
            ingredientNames: ingNames,
            ingredientQuantities: ingTots
    }
}
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