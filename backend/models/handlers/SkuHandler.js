// /models/handlers/SkuHandler.js
// Belal and Riley

import SKU from './../databases/sku';
import Prod_LineHandler from './Prod_LineHandler';

class SkuHandler{

    static async createSku(req, res){
        try {
            var sku = new SKU();
            var new_name = req.body.name;
            var new_sku_num = req.body.sku_num;
            var new_case_upc = req.body.case_upc;
            var new_unit_upc = req.body.unit_upc;
            var new_unit_size = req.body.unit_size;
            var new_cpc = req.body.cpc;
            var new_prod_line = req.body.prod_line;
            var new_ingredients = req.body.ingredients;
            var new_comments = req.body.comments;
            if(!new_name || !new_sku_num || !new_case_upc || !new_unit_upc ||
                !new_unit_size || !new_cpc || !prod_line){
                   return res.json({
                       success: false, error: 'You must provide all required fields'
                   });
            }

            let conflict = await SKU.find({ sku_num : new_sku_num});
            if(conflict.length > 0){
                return res.json({ success: false, error: 'CONFLICT'});
            }

            sku.name = new_name;
            sku.sku_num = new_sku_num;
            sku.case_upc = new_case_upc;
            sku.unit_upc = new_unit_upc;
            sku.unit_size = new_unit_size;
            sku.cpc = new_cpc;
            sku.prod_line = new_prod_line;
            sku.ingredients = new_ingredients;
            sku.comments = new_comments;

            let new_sku = await sku.save();
            return res.json({ success: true, data: new_sku});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async updateSkuBySkuNum(req, res){
        try{
            var target_sku_num = req.params.sku_num;
            if (!target_sku_num) {
                return res.json({ success: false, error: 'No sku id provided' });
            }
            var new_name = req.body.name;
            var new_case_upc = req.body.case_upc;
            var new_unit_upc = req.body.unit_upc;
            var new_unit_size = req.body.unit_size;
            var new_cpc = req.body.cpc;
            var new_prod_line = req.body.prod_line;
            var new_ingredients = req.body.ingredients;
            var new_comments = req.body.comments;
            let updated_sku = await SKU.findOneAndUpdate({ sku_num : target_sku_num},
                {$set: {name : new_name, case_upc : new_case_upc, unit_upc : new_unit_upc,
                        unit_size : new_unit_size, cpc: new_cpc, prod_line: new_prod_line,
                        ingredients : new_ingredients, comments : new_comments}}, {new : true});
            if(!updated_sku) {
                return res.json({
                    success: true, error: 'This document does not exist'
                });
            }
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getAllSkus(req, res){
        try {
            let all_skus = await SKU.find();
            return res.json({ success: true, data: all_skus});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getSkuBySkuNum(req, res){
        try {
            target_sku_num = req.params.sku_num;
            let to_return = await SKU.find({ sku_num : target_sku_num});

            if(to_return.length == 0) return res.json({ success: false, error: '404'});
            return res.json({ success: true, data: to_return});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async deleteSkuBySkuNum(req, res){
        try{
            var target_sku_num = req.params.sku_num;
            let to_remove = await SKU.findOneAndDelete({ sku_num : target_sku_num});
            if(!to_remove){
                return res.json({ success: false, error: '404'});
            }
            return res.json({ success: true, data: to_remove});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}

export default SkuHandler;