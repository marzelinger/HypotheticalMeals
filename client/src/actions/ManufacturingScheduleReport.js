import SubmitRequest from '../helpers/SubmitRequest';

var fileDownload = require('js-file-download');


export const exportManuScheduleReport = async (reportData) => {
    console.log("this is the reportData: "+JSON.stringify(reportData));
    var manu_line_id = reportData.manu_line._id;
    var duration = reportData.duration;
    var start_date = reportData.start_date;

    var end_date = 0; //TODO

//     //want to go through and get all the m
//     //This schedule should show the sequence of manufacturing tasks with all available
// information (SKU details, formula/ingredient details, case quantity, start/end time
//     and date, and duration in hours).
//need to get all manu activities for this line, that have been schedule and that are within the duration
//and start date.
    let res = await SubmitRequest.submitGetManufacturingActivitiesForReport(manu_line_id,start_date,end_date);

    console.log("this is the manu_activities: "+JSON.stringify(res));

}
