// /models/handlers/IngredientHandler.js
// Riley

import Ingredient from '../databases/ingredient';

class IngredientHandler{

    // Creates an ingredient in the Database
    // If the Ingredient exists, return error if it exists
    static createIngredient(req, res){
        const ingredient = new Ingredient();
        const { ingredient_name, ingredient_num, vendor_info, pkg_size, pkg_cost, 
            skus, comment } = req.body;
        Ingredient.find({ ingredient_name : ingredient_name }, (err, curr_ingredient) => {
            if (err) return res.json({ success: false, error: err });
            if (curr_ingredient.length != 0) {
                return res.json({ success: true, error: '422' });
            }
            ingredient.ingredient_name = ingredient_name;
            ingredient.ingredient_num = ingredient_num;
            ingredient.vendor_info = vendor_info;
            ingredient.pkg_size = pkg_size;
            ingredient.pkg_cost = pkg_cost;
            ingredient.skus = skus;
            ingredient.comment = comment;
            //error on successful POST
            ingredient.save(err => {
                if (err) return res.json({ success: false, error: err });
                return res.json({ success: true, data: ingredient });
            });
            return res.json({ success: true, data: ingredient });
            
        });
    }
    static updateIngredientByID(req, res){
    }

    // Gets all Ingredients in the database
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