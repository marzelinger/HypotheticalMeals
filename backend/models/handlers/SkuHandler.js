// /models/handlers/SkuHandler.js
// Belal and Riley

import SKU from '../databases/sku';
import Manu_Activity from '../databases/manu_activity';

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
            var new_comment = req.body.comment;
            var new_formula = req.body.formula
            var new_scale_factor = req.body.scale_factor
            var new_manu_lines = req.body.manu_lines
            var new_manu_rate = req.body.manu_rate
            var new_setup_cost = req.body.setup_cost
            var new_run_cpc = req.body.run_cpc

            if(!new_name || !new_sku_num || !new_case_upc || !new_unit_upc || !new_unit_size || !new_cpc || !new_prod_line ||
                !new_formula || !new_scale_factor || ! new_manu_rate || !new_setup_cost || !new_run_cpc){
                return res.json({
                    success: false, error: 'You must provide all required fields'
                });
            }
            // if (new_ingredients.length !== new_ingredient_quantities.length) {
            //     return res.json({
            //         success: false, error: "Ingredient quantities don't match ingredients list"
            //     });
            // }
            // SkuHandler.checkForZeroQtys(new_ingredients, new_ingredient_quantities);


            let conflict1 = await SKU.find({ num : new_sku_num });
            let conflict2 = await SKU.find({ case_upc : new_case_upc });
            if(conflict1.length > 0){
                 return res.json({ success: false, error: 'Conflict: SKU#'});
            }
            if(conflict2.length > 0){
                 return res.json({ success: false, error: 'Conflict: Case UPC'});
            }

            sku.name = new_name;
            sku.num = new_sku_num;
            sku.case_upc = new_case_upc;
            sku.unit_upc = new_unit_upc;
            sku.unit_size = new_unit_size;
            sku.cpc = new_cpc;
            sku.prod_line = new_prod_line;
            sku.comment = new_comment;
            sku.formula = new_formula
            sku.scale_factor = new_scale_factor
            sku.manu_lines = new_manu_lines
            sku.manu_rate = new_manu_rate
            sku.setup_cost = new_setup_cost
            sku.run_cpc = new_run_cpc
            let new_sku = await sku.save();
            // console.log('Sku added to database');
            return res.json({ success: true, data: new_sku});
        }
        catch (err) {
            console.log(err)
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
            // console.log('trying to update')
            var target_id = req.params.sku_id;
            if (!target_id) {
                return res.json({ success: false, error: 'No sku id provided' });
            }
            // console.log('here')
            var new_name = req.body.name;
            var new_sku_num = req.body.num;
            var new_case_upc = req.body.case_upc;
            var new_unit_upc = req.body.unit_upc;
            var new_unit_size = req.body.unit_size;
            var new_cpc = req.body.cpc;
            var new_prod_line = req.body.prod_line;
            var new_comment = req.body.comment;
            var new_formula = req.body.formula
            var new_scale_factor = req.body.scale_factor
            var new_manu_lines = req.body.manu_lines
            var new_manu_rate = req.body.manu_rate
            var new_setup_cost = req.body.setup_cost
            var new_run_cpc = req.body.run_cpc
            // SkuHandler.checkForZeroQtys(new_ingredients, new_ingredient_quantities);

            let conflict = await SKU.find({ num: new_sku_num });
            if(conflict.length > 0 && conflict[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT: SKU# already exists'});
            
            let conflict2 = await SKU.find({ case_upc: new_case_upc });
            if(conflict2.length > 0 && conflict2[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT: Case UPC already exists'});

            let updated_sku = await SKU.findOneAndUpdate({ _id : target_id},
                {$set: {name : new_name, num : new_sku_num, case_upc : new_case_upc, unit_upc : new_unit_upc,
                        unit_size : new_unit_size, cpc: new_cpc, prod_line: new_prod_line,
                        comment : new_comment, formula : new_formula, scale_factor : new_scale_factor, 
                        manu_lines : new_manu_lines, manu_rate : new_manu_rate, setup_cost : new_setup_cost,
                        run_cpc : new_run_cpc}}, {upsert : true, new : true});
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
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }

    static async getAllSkus(req, res){
        try {
            let all_skus = await SKU.find().populate('formula').populate({
                path: 'formula',
                populate: { path: 'ingredients' }
              }).populate('prod_line');
            return res.json({ success: true, data: all_skus});
        }
        catch (err) {
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }

    static async getSkuByID(req, res){
        try {
            var target_id = req.params.sku_id;
            // console.log("this is the targetid: "+target_id);

            let to_return = await SKU.find({ _id : target_id });
            // console.log("this is the to_return: "+to_return);
            if(to_return.length == 0) return res.json({ success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusByProdLine(req, res){
        try {
            var target_prod = req.params.prod_line_id;
             console.log("this is the targetprod: "+target_prod);

            let to_return = await SKU.find({ prod_line : target_prod });
             console.log("this is the to_return: "+to_return);
            if(to_return.length == 0) return res.json({ success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }



    static async deleteSkuByID(req, res){
        try{
            var target_id = req.params.sku_id;
            let to_remove = await SKU.findOneAndDelete({ _id : target_id});
            let actRes = await Manu_Activity.find({ sku : { _id : to_remove._id }}) 
            if (actRes.length > 0){
                await actRes.map(async (act) => {
                    let act_res = await Manu_Activity.findOneAndDelete({ _id : act._id })
                })
            }
            if(!to_remove){
                return res.json({ success: false, error: '404'});
            }
            return res.json({ success: true, data: to_remove});
        } catch (err) {
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }

    static async getIngredientsBySkuID(req, res){
        try{
            var target_id = req.params.sku_id;
            let response = await SKU.find({ _id : target_id }).populate('formula').populate({
                path: 'formula',
                populate: { path: 'ingredients' }
              });
            let sku = response[0];
            // console.log(response);
            return res.json({ success: true, data: sku});
        }
        catch (err) {
            console.log(err);
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusBySkuNumer(req, res){
        try{
            var target_num = req.params.sku_num;
            let sku = await SKU.find({ num: target_num });
            if (sku.length == 0) return res.json({success: false, error: '404'})
            return res.json({ success: true, data: sku[0]});
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
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }
}

export default SkuHandler;