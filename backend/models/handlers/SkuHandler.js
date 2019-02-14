// /models/handlers/SkuHandler.js
// Belal and Riley

import SKU from '../databases/sku';

class SkuHandler{

    static async createSku(req, res){
        try {
            var sku = new SKU();
            var new_name = req.body.name;
            var new_sku_num = req.body.num;
            var new_case_upc = req.body.case_upc;
            var new_unit_upc = req.body.unit_upc;
            var new_unit_size = req.body.unit_size;
            var new_cpc = req.body.cpc;
            var new_prod_line = req.body.prod_line;
            var new_ingredients = req.body.ingredients;
            var new_ingredient_quantities = req.body.ingredient_quantities;
            var new_comment = req.body.comment;

            if(!new_name || !new_sku_num || !new_case_upc || !new_unit_upc || !new_unit_size || !new_cpc || !new_prod_line){
                return res.json({
                    success: false, error: 'You must provide all required fields'
                });
            }
            if (new_ingredients.length !== new_ingredient_quantities.length) {
                return res.json({
                    success: false, error: "Ingredient quantities don't match ingredients list"
                });
            }
            SkuHandler.checkForZeroQtys(new_ingredients, new_ingredient_quantities);


            // let conflict1 = await SKU.find({ num : Number(new_sku_num) });
            // let conflict2 = await SKU.find({ case_upc : Number(new_case_upc) });
            // if(conflict1.length > 0){
            //     return res.json({ success: false, error: 'Conflict: SKU#'});
            // }
            // if(conflict2.length > 0){
            //     return res.json({ success: false, error: 'Conflict: Case UPC'});
            // }

            sku.name = new_name;
            sku.num = new_sku_num;
            sku.case_upc = new_case_upc;
            sku.unit_upc = new_unit_upc;
            sku.unit_size = new_unit_size;
            sku.cpc = new_cpc;
            sku.prod_line = new_prod_line;
            sku.ingredients = new_ingredients;
            sku.ingredient_quantities = new_ingredient_quantities;
            sku.comment = new_comment;
            let new_sku = await sku.save();
            console.log('Sku added to database');
            return res.json({ success: true, data: new_sku});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static checkForZeroQtys(new_items, new_quantities) {
        var toRemove = [];
        new_quantities.map((qty, index) => {if (parseInt(qty) <= 0) toRemove.push(index)});
        toRemove.map(ind => {
            new_items.splice(ind, 1);
            new_quantities.splice(ind, 1);
        });
    }

    static async updateSkuByID(req, res){
        try{
            console.log('trying to update')
            var target_id = req.params.sku_id;
            if (!target_id) {
                return res.json({ success: false, error: 'No sku id provided' });
            }
            console.log('here')
            var new_name = req.body.name;
            var new_sku_num = req.body.num;
            var new_case_upc = req.body.case_upc;
            var new_unit_upc = req.body.unit_upc;
            var new_unit_size = req.body.unit_size;
            var new_cpc = req.body.cpc;
            var new_prod_line = req.body.prod_line;
            var new_ingredient_quantities = req.body.ingredient_quantities;
            var new_comment = req.body.comment;
            var new_ingredients = req.body.ingredients;
            SkuHandler.checkForZeroQtys(new_ingredients, new_ingredient_quantities);

            let conflict = await SKU.find({ num: Number(new_sku_num) });
            if(conflict.length > 0 && conflict[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT'});
            
            let conflict2 = await SKU.find({ case_upc: Number(new_case_upc)});
            if(conflict2.length > 0 && conflict2[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT'});

            let updated_sku = await SKU.findOneAndUpdate({ _id : target_id},
                {$set: {name : new_name, num : new_sku_num, case_upc : new_case_upc, unit_upc : new_unit_upc,
                        unit_size : new_unit_size, cpc: new_cpc, prod_line: new_prod_line,
                        ingredients : new_ingredients, ingredient_quantities: new_ingredient_quantities, 
                        comment : new_comment}}, {upsert : true, new : true});
            if(!updated_sku) {
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
            return res.json({
                success: true, data: updated_sku
            });
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getAllSkus(req, res){
        try {
            let all_skus = await SKU.find().populate('ingredients').populate('prod_line');
            return res.json({ success: true, data: all_skus});
        }
        catch (err) {
            console.log('something is wrong');
            return res.json({ success: false, error: err});
        }
    }

    static async getSkuByID(req, res){
        try {
            var target_id = req.params.sku_id;
            console.log("this is the targetid: "+target_id);

            let to_return = await SKU.find({ _id : target_id });
            console.log("this is the to_return: "+to_return);
            if(to_return.length == 0) return res.json({ success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }


    static async deleteSkuByID(req, res){
        try{
            var target_id = req.params.sku_id;
            let to_remove = await SKU.findOneAndDelete({ _id : target_id});
            if(!to_remove){
                return res.json({ success: false, error: '404'});
            }
            return res.json({ success: true, data: to_remove});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getIngredientsBySkuID(req, res){
        try{
            var target_id = req.params.sku_id;
            let response = await SKU.find({ _id : target_id }).populate('ingredients');
            let sku = response[0];
            var { ingredients, ingredient_quantities } = sku;
            let adj_ingredients = [];
            for(var i = 0; i < ingredients.length; i ++){
                var new_ing = {
                    ...ingredients[i]._doc,
                    quantity: ingredient_quantities[i]
                }
                adj_ingredients.push(new_ing);
            }
            return res.json({ success: true, data: adj_ingredients, skuData: sku});
        }
        catch (err) {
            console.log(err);
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusBySkuKeyword(req, res){
        try{
            var target_id = req.params.sku_id;
            let sku = await SKU.find({ _id : target_id }).populate('ingredients');
            if (sku.length == 0) return res.json({success: false, error: '404'})
            return res.json({ success: true, data: sku[0].ingredients});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusByNameSubstring(req, res){
        try{
            var search_substr = req.params.search_substr;
            let results = await SKU.find({ name: { $regex: search_substr, $options: 'i' } });
            if (results.length == 0) return res.json({success: false, error: '404'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}

export default SkuHandler;