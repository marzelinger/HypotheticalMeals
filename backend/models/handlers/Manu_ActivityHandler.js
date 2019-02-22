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
            var new_end = req.body.end
            var new_duration = new_sku.manu_rate * new_quantity;
            var new_error = req.body.error;
            var new_manu_line = req.body.manu_line;
            console.log(req.body);
            if(!new_sku || !new_quantity){
                return res.json({
                    success: false, error: 'You must provide a sku and quantity'
                });
            }
            manu_activity.quantity = new_quantity;
            manu_activity.sku = new_sku;
            manu_activity.scheduled = new_scheduled;
            manu_activity.start = new_start;
            manu_activity.end = new_end;
            manu_activity.duration = new_duration;
            manu_activity.error = new_error;
            manu_activity.manu_line = new_manu_line;
            let new_manu_activity = await manu_activity.save();
            return res.json({ success: true, data: new_manu_activity});
        }
        catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async updateManufacturingActivitiesEnable(req, res) {
        try {
            var target_ids = req.body.ids;
            if(!target_ids){
                return res.json({ success: false, error: 'No manufacturing actvity named provided'});
            }
            var new_enable = !req.body.enable;
            let updated_manu_activity = await Manu_Activity.updateMany({_id: { $in: target_ids }}, {$set: {orphaned: new_enable}})
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
            console.log(err);
            return res.json({ success: false, error: err});
        }

    }

    static async updateManufacturingActivityByID(req, res){
        try {
            var target_id = req.params.manu_activity_id;
            if(!target_id){
                return res.json({ success: false, error: 'No manufacturing actvity named provided'});
            }
            var new_sku = req.body.sku;
            var new_quantity = req.body.quantity;
            var new_scheduled = req.body.scheduled || false
            var new_start = req.body.start
            var new_end = req.body.end
            var new_duration = new_sku * new_quantity;
            var new_error = req.body.error;
            var new_manu_line = req.body.manu_line;
            let updated_manu_activity = await Manu_Activity.findOneAndUpdate({_id : target_id},
                {$set: {sku: new_sku, quantity: new_quantity, scheduled: new_scheduled, start: new_start, 
                    end: new_end, duration: new_duration, error: new_error, manu_line: new_manu_line}}, 
                    {upsert: true, new: true});
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
            return res.json({ success: false, error: err});
        }
    }

    static async getAllManufacturingActivities(req, res){
        try {
            let all_manu_activities = await Manu_Activity.find().populate('sku').populate('manu_line').populate({
                path: 'sku',
                populate: { path: 'ingredients' }
              })
            // all_manu_activities.data.sku.populate('ingredients');
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