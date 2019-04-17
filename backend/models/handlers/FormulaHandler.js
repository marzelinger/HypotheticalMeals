// /models/handlers/FormulaHandler.js
// Riley

import Formula from '../databases/formula';
import SKU from '../databases/sku';
import Ingredient from '../databases/ingredient';
import UnitConversion from '../../../client/src/helpers/UnitConversion';

class FormulaHandler{

    // Creates an ingredient in the Database
    // If the Ingredient exists, return error if it exists
    static async createFormula(req, res){
        try {
            var formula = new Formula();
            var new_formula_name = req.body.name;
            var new_formula_num = req.body.num;
            var new_formula_ingredients = req.body.ingredients;
            var new_ingredient_quantities = req.body.ingredient_quantities;
            if(new_formula_ingredients.length != new_ingredient_quantities.length) return res.json({ success: false, error: 'Mismatch in parallel arrays'});
            for(var i = 0; i < new_formula_ingredients.length; i++){
                var curr_ingredient_quantity = new_ingredient_quantities[i];

                var sanitized_quantity = UnitConversion.getCleanUnitForm(curr_ingredient_quantity);
                if(sanitized_quantity.success == false) return res.json({ success: false, error: "Please check the units of ingredient " + i + " of this formula. Options are: oz, ounce, lb, pound, ton, g, gram, kg, kilogram, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count"});

                var curr_ingredient_id = new_formula_ingredients[i];
                var curr_ingredient_arr = await Ingredient.find({ _id: curr_ingredient_id });
                var curr_ingredient = curr_ingredient_arr[0];

                var typeOfUnit = await UnitConversion.getUnitType(curr_ingredient.pkg_size);
                var otherTypeOfUnit = await UnitConversion.getUnitType(curr_ingredient_quantity);
                if(otherTypeOfUnit == -1) return res.json({ success: false, error: "Please enter one of the following units: oz, lb, ton, g, kg, floz, pt, qt, gal, mL, L, count"});
                if(typeOfUnit != otherTypeOfUnit) return res.json({ success: false, error: 'Ingredient unit mismatch'});

            }

            var new_comment = req.body.comment;
            if(!new_formula_name || !new_formula_num){
                return res.json({
                    success: false, error: 'You must provide all required fields'
                });
            }

            let conflict = await Formula.find({ num: new_formula_num });
            if(conflict.length > 0){
                return res.json({ success: false, error: 'CONFLICT'});
            }
            
            formula.name = new_formula_name;
            formula.num = new_formula_num;
            formula.ingredients = new_formula_ingredients;
            formula.ingredient_quantities = new_ingredient_quantities;
            formula.comment = new_comment;

            let new_formula = await formula.save();
            return res.json({ success: true, data: new_formula});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async updateFormulaByID(req, res){
        try {
            var target_id = req.params.formula_id;
            if (!target_id) {
                return res.json({ success: false, error: 'Invalid formula ID provided'});
            }
            var new_formula_name = req.body.name;
            var new_formula_num = req.body.num;
            var new_formula_ingredients = req.body.ingredients;
            var new_ingredient_quantities = req.body.ingredient_quantities;
            var new_comment = req.body.comment;
            

            for(var i = 0; i < new_formula_ingredients.length; i++){
                var curr_ingredient_quantity = new_ingredient_quantities[i];

                var sanitized_quantity = UnitConversion.getCleanUnitForm(curr_ingredient_quantity);
                if(sanitized_quantity.success == false) return res.json({ success: false, error: "Pl2ease check the units of ingredient " + i + " of this formula. Options are: oz, ounce, lb, pound, ton, g, gram, kg, kilogram, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count"});

                var curr_ingredient_id = new_formula_ingredients[i];
                var curr_ingredient_arr = await Ingredient.find({ _id: curr_ingredient_id });
                var curr_ingredient = curr_ingredient_arr[0];

                var typeOfUnit = await UnitConversion.getUnitType(curr_ingredient.pkg_size);
                var otherTypeOfUnit = await UnitConversion.getUnitType(curr_ingredient_quantity);
                if(otherTypeOfUnit == -1) return res.json({ success: false, error: "Pl2ease enter one of the following units: oz, lb, ton, g, kg, floz, pt, qt, gal, mL, L, count"});
                if(typeOfUnit != otherTypeOfUnit) return res.json({ success: false, error: 'Ingredient unit mismatch'});
            }

            let conflict = await Formula.find({ num : new_formula_num });
            if(conflict.length > 0){
                for(var i = 0; i < conflict.length; i++){
                    if(conflict[i]._id != target_id) return res.json({ success: false, error: 'CONFLICT'});
                }
            }
            
            let updated_formula = await Formula.findOneAndUpdate({ _id: target_id},
                {$set: {name: new_formula_name, num : new_formula_num, ingredients: new_formula_ingredients, 
                     ingredient_quantities : new_ingredient_quantities, comment: new_comment}}, {upsert: true, new: true});
            
            if(!updated_formula){
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
            return res.json({
                success: true, data: updated_formula
            });    
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getAllFormulas(req, res){
        try{
            let all_formulas = await Formula.find();
            return res.json({ success: true, data: all_formulas});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getFormulaByID(req, res){
        try {
            var target_id = req.params.formula_id;
            let to_return = await Formula.find({ _id : target_id}).populate('ingredients');
            if(to_return.length == 0) return res.json({ success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async deleteFormulaByID(req, res){
        try{
            var target_id = req.params.formula_id;
            let skus = await SKU.find({ formula : target_id });
          /*  skus.map(async (sku) => {
                let ind = sku.ingredients.indexOf(target_id);
                sku.ingredients.splice(ind, 1);
                sku.ingredient_quantities.splice(ind, 1);
                await SKU.findOneAndUpdate({ _id : sku._id},
                    {$set: {ingredients : sku.ingredients, ingredient_quantities: sku.ingredient_quantities}}, 
                    {upsert : true, new : true});
            })*/
            if(skus.length >= 1) return res.json({ success: false, error: 'This formula is being used by one or more SKUs. You cannot delete a formula being used by a SKU.'});
            //console.log(target_id);
            let to_remove = await Formula.findOneAndDelete({ _id: target_id});
            if(!to_remove) return res.json({ success: true, error: '404'});
            return res.json({ success: true, data: to_remove });
        } catch (err){
            return res.json({ success: false, error: err});
        }
    }

    static async getFormulasByNameSubstring(req, res){
        try{
            var search_substr = req.params.search_substr;
            let results = await Formula.find({ name: { $regex: search_substr, $options: 'i' } });
            if (results.length == 0) return res.json({success: false, error: '404'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

}

export default FormulaHandler;