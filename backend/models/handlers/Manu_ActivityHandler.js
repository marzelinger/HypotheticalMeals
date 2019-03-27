// /models/handlers/Manu_GoalHandler.js
// Riley

import Manu_Activity from '../databases/manu_activity';

class Manu_ActivityHandler{

    static async createManufacturingActivity(req, res){
        try {
            var manu_activity = new Manu_Activity();
            var new_sku = req.body.sku;
            var new_quantity = req.body.quantity;
            var new_scheduled = req.body.scheduled || false
            var new_start = req.body.start
            var new_duration = Math.round(new_quantity / new_sku.manu_rate);
            var new_manu_line = req.body.manu_line;
            var new_overwritten = false;
            var new_orphaned= false;
            var new_over_deadline = false;
            //for now.. check assumption on piazza
            var new_unscheduled_enabled = false;
            if(!new_sku || !new_quantity){
                return res.json({
                    success: false, error: 'You must provide a sku and quantity'
                });
            }
            manu_activity.quantity = new_quantity;
            manu_activity.sku = new_sku;
            manu_activity.scheduled = new_scheduled;
            manu_activity.start = new_start;
            manu_activity.duration = new_duration;
            manu_activity.manu_line = new_manu_line;
            manu_activity.over_deadline = new_over_deadline;
            manu_activity.orphaned = new_orphaned;
            manu_activity.overwritten = new_overwritten;
            manu_activity.unscheduled_enabled = new_unscheduled_enabled;
            let new_manu_activity = await manu_activity.save();
            return res.json({ success: true, data: new_manu_activity});
        }
        catch (err){
            return res.json({ success: false, error: err});
        }
    }

    // static async updateManufacturingActivitiesEnable(req, res) {
    //     try {
    //         var target_ids = req.body.ids;
    //         if(!target_ids){
    //             return res.json({ success: false, error: 'No manufacturing actvity named provided'});
    //         }
    //         var new_enable = !req.body.enable;
    //         let updated_manu_activity = await Manu_Activity.updateMany({_id: { $in: target_ids }}, {$set: {orphaned: new_enable}})
    //         if(!updated_manu_activity){
    //             return res.json({
    //                 success: true, error: 'This document does not exist'
    //             });
    //         }
    //         return res.json({
    //             success: true, data: updated_manu_activity
    //         })
    //     }
    //     catch (err) {
    //         console.log(err);
    //         return res.json({ success: false, error: err});
    //     }

    // }

    static async updateManufacturingActivityByID(req, res){
        try {
            var target_id = req.params.manu_activity_id;
            if(!target_id){
                return res.json({ success: false, error: 'No manufacturing actvity named provided'});
            }
            var new_sku = req.body.sku;
            var new_quantity = req.body.quantity;
            var new_scheduled = req.body.scheduled;
            var new_start = req.body.start
            var new_overwritten = req.body.overwritten
            if (new_overwritten) var new_duration = Math.round(req.body.duration);
            else var new_duration = Math.round(new_sku.manu_rate * new_quantity);
            var new_manu_line = req.body.manu_line;
            var new_orphaned= req.body.orphaned;
            var new_over_deadline = req.body.over_deadline;
            var new_unscheduled_enabled = req.body.unscheduled_enabled;
            let updated_manu_activity = await Manu_Activity.findOneAndUpdate({_id : target_id},
                {$set: {sku: new_sku, quantity: new_quantity, scheduled: new_scheduled, start: new_start, 
                    duration: new_duration, manu_line: new_manu_line, overwritten: new_overwritten,
                    orphaned: new_orphaned, over_deadline: new_over_deadline, unscheduled_enabled: new_unscheduled_enabled}}, 
                    {upsert: true, new: true}).populate('sku').populate('manu_line').populate({
                        path: 'sku',
                        populate: { path: 'formula' }
                      });
            if(!updated_manu_activity){
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
            return res.json({
                success: true, data: updated_manu_activity
            })
        }
        catch (err) {
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }

    static async getAllManufacturingActivities(req, res){
        try {
            let all_manu_activities = await Manu_Activity.find().populate('sku').populate('manu_line').populate({
                path: 'sku',
                populate: { path: 'formula' }
              })
            return res.json({ success: true, data: all_manu_activities});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingActivityByID(req, res){
        try {
            var target_id = req.params.manu_activity_id;
            let to_return = await Manu_Activity.find({ _id : target_id}).populate('sku').populate('manu_line').populate({
                path: 'sku',
                populate: { path: 'ingredients' }
              });

            if(to_return.length == 0) return res.json({success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingActivitiesBySKU(req, res){
        try {
            var target_sku_id = req.params.sku_id;
            var target_start_date = req.params.start;
            var target_end_date = req.params.end;
            var complete = [];
            let to_return = await Manu_Activity.find({ sku : target_sku_id, start: {$gte: target_start_date}}).populate('sku').populate('manu_line').populate({
                path: 'sku',
                populate: { path: 'ingredients' }
              });

            if(to_return.length == 0) {
                return res.json({success: false, error: '404'});
            }
            else{
                var givenSTART = new Date(target_start_date);
                var givenEND = new Date(target_end_date);
                for(let i = 0; i<to_return.length; i++){
                    var curAct = to_return[i];
                    var startAct = new Date(curAct.start);
                    var endAct = new Date(startAct);
                    endAct.setMilliseconds(endAct.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));
                    //startAct>=startRep && endAct=<endRep: complete
                    if(startAct>=givenSTART && endAct<=givenEND){
                        //WANT TO USE THIS ACTIVITIY.
                        complete.push(curAct);
                        continue;
                    }
                }
            }
            return res.json({ success: true, data: complete});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingActivitiesForReport(req, res){
        try{

            var target_manu_line_id = req.params.manu_line_id;
            var target_start_date = req.params.start_date;
            var target_end_date = req.params.end_date;
            var target_duration = req.params.duration;
            // let to_return = await Manu_Activity.find({ manu_line : target_manu_line_id , scheduled: true, start: {$gte: target_start_date, $lt: target_end_date}})
            let to_return = await Manu_Activity.find({ manu_line : target_manu_line_id , scheduled: true})
            .populate('sku').populate('manu_line').populate({
                path: 'sku',
                populate: { path: 'formula', populate: {path: 'ingredients'} }
            });
            // if(to_return.length == 0) {
            //     return res.json({success: false, error: '404'});
            // }
            // else{
                //to-return is the activities with starts between the start and end date.
                //go through each of these activities and if the start+duration of activity is less than our end,
                //classified as a good activity
                //if it overflows (ie, start is before end date, but duration has it going over) then put in bad data
                let complete_activities = [];
                let beginning_cut = [];
                let ending_cut = [];
                let all_cut = [];
                var startRep = new Date(target_start_date);
                var endRep = new Date(target_end_date);
                for(let i = 0; i<to_return.length; i++){
                    var curAct = to_return[i];
                    var startAct = new Date(curAct.start);
                    var endAct = new Date(startAct);
                    //var numDays = Math.floor(to_return[i].duration/10);
                    //var extraHours = to_return[i].duration%10;
                    // endAct.(endAct.getDate() + numDays);
                    endAct.setMilliseconds(endAct.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));
                    // var end_act = new Date(endAct);
                    var diffStart = startAct-startRep; //should be positive
                    var diffEnd = endRep-endAct; //the endRep should be greater than end of activity so should be positive

                    //if the startAct greater than the end Rep --> should not be included
                    //if the start report greater than end act --> should not be included.

                    //if start Act greater than start rep and end act less than end rep : complete
                    //if start act less than start report and end act greater than end rep: all sides cut
                    //if start act less than start report and endt act less than end rep: beginning cut
                    //if start act greater than start report and end act greater than end rep: end cut
                    //startAct<startRep && endAct=<endRep: beg cut 
                    //startAct<startRep && endAct>endRep: beg cut, end cut
                    //startAct>=startRep && endAct=<endRep: complete
                    //startAct>=startRep && endAct>endRep: end cut
                    console.log("START_REP: "+startRep);
                    console.log("END_REP: "+endRep);
                    console.log("START_ACT: "+startAct);
                    console.log("END_ACT: "+endAct);
                    console.log("COMPLETE: startAct>=startRep && endAct<=endRep"+ startAct>=startRep && endAct<=endRep);
                    console.log("COMPLETE: startAct>=startRep && endAct<=endRep"+ startAct>=startRep && endAct<=endRep);
                    
                    //SOMETHING WRONG IN END CUT
                    if(endAct<=startRep){
                        //this activity shouldn't be anywhere. happens before schedule.
                        continue;
                    }
                    else if(startAct>=endRep){
                        //this activity shouldn't be anywhere. happends after schedule.
                        continue;
                    }
                    else if(startAct>=startRep){
                        //The activity ends after the start of the report
                        //which is good
                        if(endAct<=endRep){
                            //activity ends before report ends
                            //complete here
                            console.log("comp");
                            complete_activities.push(curAct);
    
                            continue;

                        }
                        else if(endAct>endRep){
                            //the activity ends after the report
                            //end cut
                            console.log("end");

                            ending_cut.push(curAct);
                            // console.log("ending: "+ending_cut.length);
                        }
                    }
                    else if(startAct<startRep){
                        //the activity starts before the report does. bad
                        if(endAct<=endRep){
                            //the activity ends before report ends
                            //beginning cut
                            console.log("beg");

                            beginning_cut.push(curAct);
                            // console.log("begginging: "+beginning_cut.length);
                            continue;
                        }
                        else if(endAct>endRep){
                            //the activity ends after the report
                            //all cut
                                                   //this activity is larger than the span
                            console.log("all");

                            all_cut.push(curAct);
                            // console.log("allcut: "+all_cut.length);

                            continue;
                        }
                    }

                    
                    
                    
                    
                    
                    
                    
                    
                    
                    // if(diffEnd>=0 && diffStart>=0){
                    // // else if(startAct>=startRep && endAct<=endRep){

                    //     //this is a valid activity.
                    //     //the start is greater than the rep
                    //     //the end is less than the rep
                    //     console.log("comp");
                    //     complete_activities.push(curAct);

                    //     continue;
                    // }
                    // else if(diffEnd<0 && diffStart<0){
                    // // else if(startAct<startRep && endAct>endRep){

                    //     //this activity is larger than the span
                    //     console.log("all");

                    //     all_cut.push(curAct);
                    //     // console.log("allcut: "+all_cut.length);

                    //     continue;
                    // }
                    // else if(diffEnd<0 && diffStart>=0){
                    // // else if(startAct>=startRep && endAct>endRep){

                    //     // activity starts after report
                    //     //but tail cuttoff
                    //     console.log("end");

                    //     ending_cut.push(curAct);
                    //     // console.log("ending: "+ending_cut.length);

                    //     continue;
                    // }
                    // else if(diffEnd>=0 && diffStart<0){
                    // //var diffStart = startAct-startRep; //should be positive
                    // // var diffEnd = endRep-endAct;
                    // // else if(startAct<startRep && endAct<=endRep){
                    //     //activity starts before report,
                    //     //front cut
                    //     console.log("beg");

                    //     beginning_cut.push(curAct);
                    //     // console.log("begginging: "+beginning_cut.length);
                    //     continue;
                    // }
                    // // else if(startAct>endRep || startRep>EndAct){
                    // //     //this activity should not be included.
                    // //     complete_activities.push({});
                    // //     continue;
                    // // }
                }

            return res.json({ success: true, data: 
                    { complete_activities : complete_activities, 
                        beginning_cut: beginning_cut, 
                        ending_cut: ending_cut, 
                        all_cut:all_cut
                    }
                    });
        //}          
    } 
    catch (err){
            return res.json({ success: false, error: err});   
    }
}

    static async deleteManufacturingActivityByID(req, res){
        try {
            var target_id = req.params.manu_activity_id;
            let to_remove = await Manu_Activity.findOneAndDelete({ _id : target_id});
            if(!to_remove){
                return res.json({ success: false, error: '404'});
            }
            return res.json({ success: true, data: to_remove});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

}

export default Manu_ActivityHandler; 