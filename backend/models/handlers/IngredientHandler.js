// /models/handlers/IngredientHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';
import Formula from '../databases/formula';

class IngredientHandler{

    // Creates an ingredient in the Database
    // If the Ingredient exists, return error if it exists
    static async createIngredient(req, res){
        try {
            var ingredient = new Ingredient();
            var new_ingredient_name = req.body.name;
            var new_ingredient_num = req.body.num;
            var new_vendor_info = req.body.vendor_info;
            var new_pkg_size = req.body.pkg_size;
            var new_pkg_cost = req.body.pkg_cost;
            var new_sku_count = req.body.sku_count;
            var new_comment = req.body.comment;
            if(!new_ingredient_name || ! new_ingredient_num || !new_pkg_size || !new_pkg_cost) {
                return res.json({
                    success: false, error: 'You must provide all required fields'
                });
            }

            let conflict = await Ingredient.find({ name : new_ingredient_name});
            let conflict2 = await Ingredient.find({ num: new_ingredient_num });
            if(conflict.length > 0 || conflict2.length > 0){
                return res.json({ success: false, error: 'CONFLICT'});
            }
            
            ingredient.name = new_ingredient_name;
            ingredient.num = new_ingredient_num;
            ingredient.vendor_info = new_vendor_info;
            ingredient.pkg_size = new_pkg_size;
            if(await this.findUnit(new_pkg_size == -1)) return res.json({ success: false, error: "Please enter one of the following units: oz, lb, ton, g, kg, floz, pt, qt, gal, mL, L, count"});
            ingredient.pkg_cost = new_pkg_cost;
            ingredient.sku_count = new_sku_count;
            ingredient.comment = new_comment; 

            let new_ingredient = await ingredient.save();
            return res.json({ success: true, data: new_ingredient});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async findUnit(ingredient_pkg_size){
        if(/^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (oz|lb|ton|g|kg)$/.test(ingredient_pkg_size)) return 1;
        if(/^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (floz|pt|qt|gal|ml|l)$/.test(ingredient_pkg_size)) return 2;
        if(/^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (count)$/.test(ingredient_pkg_size)) return 3;
        return -1;
    }

    static async updateIngredientByID(req, res){
        try {
            var target_id = req.params.ingredient_id;
            if (!target_id) {
                return res.json({ success: false, error: 'No ingredient name provided'});
            }
            var new_ingredient_name = req.body.name;
            var new_ingredient_num = req.body.num;
            var new_vendor_info = req.body.vendor_info;
            var new_pkg_size = req.body.pkg_size;
            if(await this.findUnit(new_pkg_size) == -1) return res.json({ success: false, error: "Please enter one of the following units: oz, lb, ton, g, kg, floz, pt, qt, gal, mL, L, count"});
            var new_pkg_cost = req.body.pkg_cost;
            var new_sku_count = req.body.sku_count
            var new_comment = req.body.comment;

            let conflict = await Ingredient.find({ num : new_ingredient_num });
            if(conflict.length > 0 && conflict[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT'});
            
            let conflict2 = await Ingredient.find({ name : new_ingredient_name});
            if(conflict2.length > 0 && conflict2[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT'});

            let updated_ingredient = await Ingredient.findOneAndUpdate({ _id: target_id},
                {$set: {name: new_ingredient_name, num : new_ingredient_num, vendor_info: new_vendor_info, pkg_size : new_pkg_size,
                     pkg_cost : new_pkg_cost, sku_count: new_sku_count, comment: new_comment}}, {upsert: true, new: true});
            
            if(!updated_ingredient){
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
            return res.json({
                success: true, data: updated_ingredient
            });    
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

    static async getIngredientByID(req, res){
        try {
            var target_id = req.params.ingredient_id;
            let to_return = await Ingredient.find({ _id : target_id});
            if(to_return.length == 0) return res.json({ success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async deleteIngredientByID(req, res){
        try{
            var target_id = req.params.ingredient_id;

            let all_formulas = await Formula.find();
            for(var i = 0; i < all_formulas.length; i++){
                var curr_formula = all_formulas[i];
                var curr_ingrs_array = curr_formula.ingredients;
                for(var j = 0; j < curr_ingrs_array.length; j++){
                    if(curr_ingrs_array[j]._id == target_id){
                        return res.json({ success: false, error: "This ingredient is still tied to a formula"});
                    }
                }
            }

            let skus = await SKU.find({ ingredients : target_id });
            skus.map(async (sku) => {
                let ind = sku.formula.ingredients.indexOf(target_id);
                sku.formula.ingredients.splice(ind, 1);
                sku.formula.ingredient_quantities.splice(ind, 1);
                await SKU.findOneAndUpdate({ _id : sku._id},
                    {$set: {ingredients : sku.formula.ingredients, ingredient_quantities: sku.formula.ingredient_quantities}}, 
                    {upsert : true, new : true});
            })
            
            let to_remove = await Ingredient.findOneAndDelete({ _id: target_id});
            if(!to_remove) return res.json({ success: true, error: '404'});
            return res.json({ success: true, data: to_remove });
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getIngredientsByNameSubstring(req, res){
        try{
            var search_substr = req.params.search_substr;
            let results = await Ingredient.find({ name: { $regex: search_substr, $options: 'i' } });
            if (results.length == 0) return res.json({success: false, error: '404'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

}

export default IngredientHandler;