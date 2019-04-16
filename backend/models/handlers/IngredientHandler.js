// /models/handlers/IngredientHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';
import Formula from '../databases/formula';
import UnitConversion from '../../../client/src/helpers/UnitConversion';

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

            var sanitized_ingr_unit = await UnitConversion.getCleanUnitForm(new_pkg_size);
            if(sanitized_ingr_unit.success == false) return res.json({ success: false, error: "Please enter a valid unit. Options are: oz, ounce, lb, pound, ton, g, gram, kg, kilogram, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count"});
            ingredient.pkg_size = sanitized_ingr_unit.data;

            var isValid = /^\s*\$?\s*([+-]?\d*\.?\d+)\D*$/.test(new_pkg_cost);
            if(!isValid) return res.json({ success: false, error: "Please enter a valid currency valid (i.e. $5.00, $ 5.00, 5.00 USD"});
            var cost_arr = new_pkg_cost.match(/^\s*\$?\s*([+-]?\d*\.?\d+)\D*$/);
            new_pkg_cost = cost_arr[1];

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

    static async updateIngredientByID(req, res){
  //      try {
            var target_id = req.params.ingredient_id;
            if (!target_id) {
                return res.json({ success: false, error: 'No ingredient name provided'});
            }

            let old_ingredient = await Ingredient.find({ _id : target_id});

            if(old_ingredient[0].pkg_size != req.body.pkg_size && old_ingredient[0].sku_count != 0) return res.json({ success: false, error: "Please do not change the package size of an ingredient tied to at least 1 formula"});

            var new_ingredient_name = req.body.name;
            var new_ingredient_num = req.body.num;
            var new_vendor_info = req.body.vendor_info;
            var new_pkg_size = req.body.pkg_size;

            var sanitized_ingr_unit = UnitConversion.getCleanUnitForm(new_pkg_size);
            if(sanitized_ingr_unit.success == false) return res.json({ success: false, error: "Please enter a valid unit. Options are: oz, ounce, lb, pound, ton, g, gram, kg, kilogram, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count"});
            new_pkg_size = sanitized_ingr_unit.data;

            var new_pkg_cost = req.body.pkg_cost + "";
            var isValid = /^\s*\$?\s*([+-]?\d*\.?\d+)\D*$/.test(new_pkg_cost);
            if(!isValid) return res.json({ success: false, error: "Please enter a valid currency valid (i.e. $5.00, $ 5.00, 5.00 USD"});
            var cost_arr = new_pkg_cost.match(/^\s*\$?\s*([+-]?\d*\.?\d+)\D*$/);
            new_pkg_cost = cost_arr[1];

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
 //       catch (err) {
  //          return res.json({ success: false, error: err});
   //     }
 //   }

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