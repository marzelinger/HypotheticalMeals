// /models/handlers/IngredientHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import sku from '../databases/sku';

class IngredientHandler{

    // Creates an ingredient in the Database
    // If the Ingredient exists, return error if it exists
    static async createIngredient(req, res){
        try {
            var ingredient = new Ingredient();
            var new_ingredient_name = req.body.name;
            var new_ingredient_num = req.body.ingredient_num;
            var new_vendor_info = req.vendor_info;
            var new_pkg_size = req.pkg_size;
            var new_pkg_cost = req.pkg_cost;
            var new_skus = req.skus;
            var new_comment = req.comment;
            if(!new_ingredient_name || ! new_ingredient_num || !pkg_size || !pkg_cost) {
                return res.json({
                    success: false, error: 'You must provide all required fields'
                });
            }

            let conflict = await ingredients.find({ ingredient_name : new_ingredient_name});
            if(conflict.length > 0){
                return res.json({ success: false, error: 'CONFLICT'});
            }

            ingredient.name = new_ingredient_name;
            ingredient.ingredient_num = new_ingredient_num;
            ingredient.vendor_info = new_vendor_info;
            ingredient.pkg_size = new_pkg_size;
            ingredient.pkg_cost = new_pkg_cost;
            ingredient.skus = new_skus;
            ingredient.comment = new_comment; 

            let new_ingredient = await ingredient.save();
            return res.json({ success: true, data: new_ingredient});
        }
        catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async updateIngredientByName(req, res){
        try {
            var target_name = req.params.ingredient_name;
            if (!target_name) {
                return res.json({ success: false, error: 'No ingredient name provided'});
            }
            var new_ingredient_num = req.body.ingredient_num;
            var new_vendor_info = req.body.vendor_info;
            var new_pkg_size = req.body.pkg_size;
            var new_pkg_cost = req.body.pkg_cost;
            var new_skus = req.body.skus;
            var new_comment = req.body.comment;
            let updated_ingredient = await Ingredients.findOneAndUpdate({ name: target_name},
                {$set: {ingredient_num: new_ingredient_num, vendor_info: new_vendor_info, pkg_size : new_pkg_size,
                     pkg_count : new_pkg_cost, skus : new_skus, comment: new_comment}}, {new: true});
            if(!updated_ingredient){
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }         
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getAllIngredients(req, res){
        try{
            let all_ingredients = await Ingredient.find();
            return res.json({ success: true, data: all_ingredients});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getIngredientByName(req, res){
        try {
            target_name = req.params.ingredient_name;
            let to_return = await Ingredient.find({ name : target_name});

            if(to_return.length == 0) return res.json({ success: false});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async deleteIngredientByName(req, res){
        try{
            var target_name = req.params.ingredient_name;
            let to_remove = await Ingredient.findOneAndDelete({ name: target_name});
            if(!to_remove){
                return res.json({ success: false, error: '404'});
            }
            return res.json({ success: true, data: to_remove});
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    // Filtering APIs
    static async getAllIngredientsByKeyword(req, res){
        var query = {};
        if (req.body.name !== "") { query.name = req.body.name}
        try{
            let all_ingredients = await Ingredient.find({ query });
            return res.json({ success: true, data: all_ingredients});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}

export default IngredientHandler;