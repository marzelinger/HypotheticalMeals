// /models/handlers/IngredientHandler.js
// Riley

import Ingredient from '../databases/ingredient';

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
            var new_skus = req.body.skus;
            var new_comment = req.body.comment;
            if(!new_ingredient_name || ! new_ingredient_num || !new_pkg_size || !new_pkg_cost) {
                return res.json({
                    success: false, error: 'You must provide all required fields'
                });
            }

            let conflict = await Ingredient.find({ name : new_ingredient_name});
            let conflict2 = await Ingredient.find({ num: new_ingredient_num});
            if(conflict.length > 0 || conflict2.length > 0){
                return res.json({ success: false, error: 'CONFLICT'});
            }
            
            ingredient.name = new_ingredient_name;
            ingredient.num = new_ingredient_num;
            ingredient.vendor_info = new_vendor_info;
            ingredient.pkg_size = new_pkg_size;
            ingredient.pkg_cost = new_pkg_cost;
            ingredient.skus = new_skus;
            ingredient.comment = new_comment; 

            let new_ingredient = await ingredient.save();
            return res.json({ success: true, data: new_ingredient});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getIngredientsPag(req, res, next){
        var perPage = 4;
        var page = req.params.page || 1;
        console.log("this is in the pagination handler");
        
        try{
            console.log("this is in the pagination handler");

        // Ingredient.find( { createdOn: { $lte: request.createdOnBefore } } )
        // .limit( 10 )
        // .sort( '-createdOn' )
        let cur_ingredients = await Ingredient.find({})
        .skip((perPage*page) - perPage)
        .limit(perPage).sort( '1' )
        return res.json({ success: true, data: cur_ingredients});
        }
        catch(err){
            return res.json({success: false, error: err});
        }
        

        // Ingredient.find({})
        //           .skip((perPage*page) - perPage)
        //           .limit(perPage)
        //           .exec(function(err, ingredients){
        //               Ingredient.count().exec(function(err, count){
        //                 console.log("this ingredient.count"+res);

        //                 if (err) return next(err)
        //                 // res.render('main/ingredientspag', {
        //                 //     ingredients: ingredients,
        //                 //     current: page,
        //                 //     pages: Math.ceil(count/perPage)
        //                 // })
        //                 res.json({
        //                     ingredients: ingredients,
        //                     current: page,
        //                     pages: Math.ceil(count/perPage)
        //                 })

        //                 console.log("this is the res.json"+res);
        //               })
        //           })
    }
    // static async updateIngredientByID(req, res){
    //     try {
    //         var target_id = req.params.ingredient_id;
    //         if (!target_id) {
    //             return res.json({ success: false, error: 'No ingredient name provided'});
    //         }
    //         var new_ingredient_name = req.body.name;
    //         var new_ingredient_num = req.body.num;
    //         var new_vendor_info = req.body.vendor_info;
    //         var new_pkg_size = req.body.pkg_size;
    //         var new_pkg_cost = req.body.pkg_cost;
    //         var new_skus = req.body.skus;
    //         var new_comment = req.body.comment;

    //         let updated_ingredient = await Ingredient.findOneAndUpdate({ _id: target_id},
    //             {$set: {name: new_ingredient_name, num : new_ingredient_num, vendor_info: new_vendor_info, pkg_size : new_pkg_size,
    //                  pkg_cost : new_pkg_cost, skus : new_skus, comment: new_comment}}, {upsert: true, new: true});
            
    //         if(!updated_ingredient){
    //             return res.json({
    //                 success: true, error: 'This document does not exist'
    //             });
    //         }
    //         return res.json({
    //             success: true, data: updated_ingredient
    //         });    
    //     }
    //     catch (err) {
    //         return res.json({ success: false, error: err});
    //     }
    // }



    // static async getIngredientByID(req, res){
    //     try {
    //         var target_id = req.params.ingredient_id;
    //         let to_return = await Ingredient.find({ _id : target_id});
    //         if(to_return.length == 0) return res.json({ success: false, error: '404'});
    //         return res.json({ success: true, data: to_return});
    //     } catch (err) {
    //         return res.json({ success: false, error: err});
    //     }
    // }

    // static async deleteIngredientByID(req, res){
    //     try{
    //         var target_id = req.params.ingredient_id;
    //         let to_remove = await Ingredient.findOneAndDelete({ _id: target_id});
    //         if(!to_remove){
    //             return res.json({ success: false, error: '404'});
    //         }
    //         return res.json({ success: true, data: to_remove});
    //     } catch (err){
    //         return res.json({ success: false, error: err});
    //     }
    // }

    // static async getIngredientByKeyword(req, res){
    //     try{
    //         var search_str = req.body.search_str;
    //         let results = await Ingredient.find( {$text: {$search: search_str } } );
    //         console.log(results);
    //         if (results.length == 0) return res.json({success: false, error: '404'})
    //         return res.json({ success: true, data: results});
    //     }
    //     catch (err) {
    //         return res.json({ success: false, error: err});
    //     }
    // }

    // static async getIngredientByNameSubstring(req, res){
    //     try{
    //         var search_substr = req.body.search_substr;
    //         let results = await Ingredient.find({ name: { $regex: search_substr, $options: 'i' } });
    //         if (results.length == 0) return res.json({success: false, error: '404'})
    //         return res.json({ success: true, data: results});
    //     }
    //     catch (err) {
    //         return res.json({ success: false, error: err});
    //     }
    // }

    // static async getSkusByIngredientID(req, res){
    //     try{
    //         var target_id = req.params.ingredient_id;
    //         console.log("this is the target_id: "+target_id)
    //         let ingredient = await Ingredient.find({ _id : target_id }).populate('skus');
    //         console.log("this is the ingredients "+ingredient);

    //         if (ingredient.length == 0) return res.json({success: false, error: '404'})
    //         return res.json({ success: true, data: ingredient[0].skus});
    //     }
    //     catch (err) {
    //         return res.json({ success: false, error: err});
    //     }
    // }

}

export default IngredientHandler;