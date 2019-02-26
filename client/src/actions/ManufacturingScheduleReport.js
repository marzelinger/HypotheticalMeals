import SubmitRequest from '../helpers/SubmitRequest';

var fileDownload = require('js-file-download');


export const exportManuScheduleReport = async (reportData) => {
    console.log("this is the reportData: "+JSON.stringify(reportData));
    var manu_line_id = reportData.manu_line._id;
    var duration = reportData.duration;
    var start_date = reportData.start_date;

    console.log("this is the manuline")

    var end_date = reportData.end_date; //TODO

//     //want to go through and get all the m
//     //This schedule should show the sequence of manufacturing tasks with all available
// information (SKU details, formula/ingredient details, case quantity, start/end time
//     and date, and duration in hours).
//need to get all manu activities for this line, that have been schedule and that are within the duration
//and start date.
    let res = await SubmitRequest.submitGetManufacturingActivitiesForReport(reportData);
    //console.log("this is the manu_activities: "+JSON.stringify(res));
    if(res.success){
        // console.log("length in Num activities: "+res.data.length);
        // for (let i = 0; i<res.data.length; i++){
        //     console.log("this is start date: "+res.data[i].start);
        // }
        console.log("start: "+start_date);
        console.log("enddate; "+end_date);
        console.log("duration: "+duration);
        console.log("complete_acti: "+JSON.stringify(res.data.complete_activities));
        console.log("beginning_cut: "+JSON.stringify(res.data.beginning_cut));
        console.log("ending_cut: "+JSON.stringify(res.data.ending_cut));
        console.log("allcut: "+JSON.stringify(res.data.all_cut));
    }


}
