// /models/handlers/Manu_GoalHandler.js
// Riley

import Manu_Goal from '../databases/manu_goal';

class Manu_GoalHandler{

    static async createManufacturingGoal(req, res){
        try {
            var manu_goal = new Manu_Goal();
            var new_name = req.body.name;
            var new_activities = req.body.activities;
            var new_user = req.body.user || "default_user";
            if(!new_name || !new_user){
                return res.json({
                    success: false, error: 'You must provide a name'
                });
            }
            
            let conflict = await Manu_Goal.find({ name : new_name, user: new_user, activities: new_activities});
            if(conflict.length > 0){
                return res.json({ success: false, error: 'Manufacturing Goal ' + new_name + ' exists for user ' + new_user});
            }

            manu_goal.name = new_name;
            manu_goal.user = new_user;
            manu_goal.activities = new_activities;
            manu_goal.enabled = false;
            let new_manu_goal = await manu_goal.save();
            return res.json({ success: true, data: new_manu_goal});
        }
        catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async updateManufacturingGoalByID(req, res){
        try {
            var target_id = req.params.manu_goal_id;
            if(!target_id){
                return res.json({ success: false, error: 'No manufacturing goal named provided'});
            }
            var new_activities = req.body.activities;
            var new_name = req.body.name;
            var new_enabled = req.body.enabled;
            let updated_manu_goal = await Manu_Goal.findOneAndUpdate({_id : target_id},
                {$set: {activities: new_activities, name: new_name, enabled: new_enabled}}, {upsert: true, new: true});
            if(!updated_manu_goal){
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
            return res.json({
                success: true, data: updated_manu_goal
            })
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getAllManufacturingGoals(req, res){
        try {
            var user_id = req.params.user_id;
            let all_manu_goals = await Manu_Goal.find({user: user_id}).populate('activities').populate({path: 'activities', populate: { path: 'sku' }});
            return res.json({ success: true, data: all_manu_goals});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingGoalByID(req, res){
        try {
            var target_id = req.params.manu_goal_id;
            var user_id = req.params.user_id;
            let to_return = await Manu_Goal.find({ _id : target_id, user:user_id}).populate('activities').populate({path: 'activities', populate: { path: 'sku' }});

            if(to_return.length == 0) return res.json({success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingGoalByUser(req, res){
        try {
            var target_id = req.params.manu_goal_id;
            var user_id = req.params.user_id;
            let to_return = await Manu_Goal.find({ _id : target_id, user:user_id});

            if(to_return.length == 0) return res.json({success: false, error: '404'}).populate('activities').populate({path: 'activities', populate: { path: 'sku' }});
            return res.json({ success: true, data: to_return});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingGoalByFilter(req, res){
        try {
            var name_substr = req.params.name_substr;
            var user_substr = req.params.user_substr;
            var user = req.params.user;
            var and_query = [];
            if(name_substr != '_'){
                and_query.push({name:{ $regex: name_substr , $options: "$i"}})
            }
            if(user_substr != '_'){
                and_query.push({user:{ $regex: user_substr , $options: "$i"}})
            }
            if(user != '_'){
                and_query.push({user: user});
            }
            let to_return = and_query.length == 0 ? await Manu_Goal.find().populate('activities').populate({path: 'activities', populate: { path: 'sku' }}) : await Manu_Goal.find({$and: and_query}).populate('activities').populate({path: 'activities', populate: { path: 'sku' }});;
            return res.json({ success: true, data: to_return});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingGoalByIDActivities(req, res){
        try {
            var target_id = req.params.manu_goal_id;
            var user_id = req.params.user_id
            let to_return = await Manu_Goal.find({ _id : target_id, user: user_id}).populate('activities').populate('sku').populate({path: 'activities', populate: { path: 'sku' }});
            if(to_return.length == 0) return res.json({success: false, error: '404'});
            return res.json({ success: true, data: to_return[0]});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async deleteManufacturingGoalByID(req, res){
        try {
            var target_id = req.params.manu_goal_id;
            let to_remove = await Manu_Goal.findOneAndDelete({ _id : target_id});
            if(!to_remove){
                return res.json({ success: false, error: '404'});
            }
            return res.json({ success: true, data: to_remove});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

}

export default Manu_GoalHandler;