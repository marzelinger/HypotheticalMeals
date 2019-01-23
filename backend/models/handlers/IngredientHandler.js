// /models/handlers/IngredientHandler.js
// Riley

import Ingredient from '../databases/ingredient';

class IngredientHandler{

    static createIngredient(req, res){
        const { ingredient_name, ingredient_num, vendor_info, pkg_size, pkg_cost, 
            skus, comment } = req.body;
        Ingredient.find({ name: 'White Rice' }, (err, ingredients) => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true, data: ingredients });
        });
    }
    static updateIngredientByID(req, res){
    }
    static getAllIngredients(req, res){
        Ingredient.find((err, ingredients) => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true, data: ingredients });
          });
    }
    static getIngredientByID(req, res){
    }
    static deleteIngredientByID(req, res){
    }

}

export default IngredientHandler;