// /models/handlers/Manu_GoalHandler.js
// Riley

import Manu_Goal from '../databases/manu_goal';

class Manu_GoalHandler{

    static async createManufacturingGoal(req, res){
        try {
            var manu_goal = new Manu_Goal();
            var new_name = req.body.name;
            var new_user = req.body.user || "default_user";
            if(!new_name || !new_user){
                return res.json({
                    success: false, error: 'You must provide a name'
                });
            }
            let conflict = await Manu_Goal.find({ name : new_name, user: new_user});
            if(conflict.length > 0){
                console.log("?");
                return res.json({ success: false, error: 'CONFLICT'});
            }

            manu_goal.name = new_name;
            manu_goal.user = new_user;
            console.log("here");
            let new_manu_goal = await manu_goal.save();
            return res.json({ success: true, data: new_manu_goal});
        }
        catch (err){
            return res.json({ success: false, error: err});
        }
    }

    // 
    static async updateManufacturingGoalByID(req, res){
        try {
            var target_id = req.params.manu_goal_id;
            if(!target_id){
                return res.json({ success: false, error: 'No manufacturing goal named provided'});
            }
            var new_skus = req.body.skus;
            let updated_manu_goal = await Manu_Goal.findOneAndUpdate({_id : target_id},
                {$set: {skus: new_skus}}, {upsert: true, new: true});
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
            let all_manu_goals = await Manu_Goal.find({user: user_id});
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
            let to_return = await Manu_Goal.find({ _id : target_id, user:user_id});

            if(to_return.length == 0) return res.json({success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingGoalByIDSkus(req, res){
        try {
            console.log('here');
            var target_id = req.params.manu_goal_id;
            var user_id = req.params.user_id
            let to_return = await Manu_Goal.find({ _id : target_id, user: user_id}).populate('skus');

            if(to_return.length == 0) return res.json({success: false, error: '404'});
            return res.json({ success: true, data: to_return[0].skus});
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