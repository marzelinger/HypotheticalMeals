import SubmitRequest from '../helpers/SubmitRequest';

var fileDownload = require('js-file-download');
//The former should be fine: name, number, and quantity/unit for ingredients.



export const exportManuScheduleReport = async (reportData) => {
    let res = await SubmitRequest.submitGetManufacturingActivitiesForReport(reportData);
    if(res.success){

        console.log("complete_acti: "+JSON.stringify(res.data.complete_activities));
        console.log("beginning_cut: "+JSON.stringify(res.data.beginning_cut));
        console.log("ending_cut: "+JSON.stringify(res.data.ending_cut));
        console.log("allcut: "+JSON.stringify(res.data.all_cut));
        createManuReport(reportData, res.data);

    } 
    else{
        console.log("error in the manureport");
    } 
}

export const createManuReport = (reportData, data) => {
    const rows = [];
    console.log("this is the data.complete_act: "+JSON.stringify(data.complete_activities));
    var complete = data.complete_activities;
    var beg_cut = data.beginning_cut; //will be empty?
    var end_cut = data.ending_cut;
    var all_cut = data.all_cut;
    var header = [];
    header.push("Manufacturing Schedule Report for "+new Date(reportData.start_date) +" to "+new Date(reportData.end_date)+" (Duration "+reportData.duration+" hour(s)) on Manufacturing Line: "+ reportData.manu_line.short_name);
    rows.push(header);
    var numActs = complete.length;
    for(let act = 0; act<numActs; act++){
        var manulabel= [];
        var curAct = complete[act];
        console.log("this is the curAct: "+JSON.stringify(curAct));

        var curStart = new Date(curAct.start);
        var curEnd = getEndTime(curStart, curAct.duration);
        console.log("this is the curstart and end: "+ curStart +"    "+curEnd);
        var iLab = act+1;
        rows.push(["\r\n"]);
        manulabel.push("("+iLab+") Manufacturing Activity from "+ curStart+" to "+curEnd+" with Duration of "+curAct.duration+ " hour(s) to produce "+curAct.quantity+" case(s).");
        rows.push(manulabel);
        rows.push(skuHeader());
        var skuline = [];
        var skudata = curAct.sku;
        console.log("this is the current sku: "+ JSON.stringify(skudata));

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
            console.log("this is the current ing: "+ JSON.stringify(curIng));
            var ingLine = [];
            ingLine.push(skudata.formula.ingredients[ing].name);
            ingLine.push(skudata.formula.ingredient_quantities[ing]);
            rows.push(ingLine);
        }

    }

    let csvContent = "";
    rows.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
     }); 
    fileDownload(csvContent, "Manufacturing Schedule Report For "+reportData.manu_line.short_name+'.csv');

}

export const getEndTime = (start, dur) => {
    var curEnd = new Date(start);
    // var startHour = curEnd.getHours();
    // var firstDay = 18-startHour; //how much can be accomplished in first day.
    // if (firstDay>dur){
    //     return curEnd.setHours(curEnd.getHours+dur);
    // }
    // //can't finish all in first day.
    // var new_dur = dur-firstDay;
    // curEnd.setHours(curEnd.getHours()+firstDay+6+8);
    // var numDays = Math.floor(new_dur/10);
    // var extraHours = new_dur%10;
    var numDays = Math.floor(dur/10);
    var extraHours = dur%10;

    curEnd.setDate(curEnd.getDate() + numDays);
    curEnd.setHours(curEnd.getHours() + extraHours);
    return curEnd;

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