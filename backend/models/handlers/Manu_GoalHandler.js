// /models/handlers/Manu_GoalHandler.js
// Riley

import Manu_Goal from '../databases/manu_goal';
import IngredientHandler from './IngredientHandler';

class Manu_GoalHandler{

    static async createManufacturingGoal(req, res){
        try {
            var manu_goal = new Manu_Goal();
            var new_name = req.body.name;
            var new_user = req.body.user;
            if(!new_name || !new_user){
                return res.json({
                    success: false, error: 'You must provide a name and ID'
                });
            }
            let conflict = await Manu_Goal.find({ name : new_name, user: new_user});
            if(conflict.length > 0){
                return res.json({ success: false, error: 'CONFLICT'});
            }

            manu_goal.name = new_name;
            manu_goal.user = new_user;
            let new_manu_goal = await manu_goal.save();
            return res.json({ success: true, data: new_manu_goal});
        }
        catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async updateManufacturingGoalByName(req, res){
        try {
            var target_name = req.params.manu_goal_name;
            if(!target_name){
                return res.json({ success: false, error: 'No manufacturing goal named provided'});
            }
            var new_name = req.body.new_name;
            var new_skus = req.body.skus;
            var curr_user = req.body.user;
            let updated_manu_goal = await Manu_Goal.findOneAndUpdate({name: target_name, user: curr_user},
                {$set: {name: new_name, skus: new_skus}}, {new: true});
            if(!updated_manu_goal){
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getAllManufacturingGoals(req, res){
        try {
            let all_manu_goals = await Manu_Goal.find();
            return res.json({ success: true, data: all_manu_goals});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getManufacturingGoalByName(req, res){
        try {
            var target_name = req.params.manu_goal_name;
            var curr_user = req.body.user;
            let to_return = await Manu_Goal.find({ name: target_name, user: curr_user});

            if(to_return.length == 0) return res.json({success: false});
            return res.json({ success: true, data: to_return});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async deleteManufacturingGoalByName(req, res){
        try {
            var target_name = req.params.manu_goal_name;
            var curr_user = req.body.user;
            let to_remove = await Manu_Goal.findOneAndDelete({ name: target_name, user: curr_user});
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