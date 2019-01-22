// /models/handlers/SkuHandler.js
// Belal and Riley

import SKU from './../databases/sku';

class SkuHandler{

    static updateSkuByID(req, res){
        const { sku_ID_param } = req.params;
        if (!sku_ID_param) {
            return res.json({ success: false, error: 'No sku id provided' });
        }
        SKU.findById(sku_ID_param, (error, sku) => {
            if (error) return res.json({ success: false, error });
            const { sku_ID, name, case_upc, unit_upc, unit_size, cpc, 
                prod_line, ingredients, comment } = req.body;
            if (sku_id) skue.sku_id = sku_id;
            if (name) sku.name = name;
            if (case_upc) sku.case_upc = case_upc;
            if (unit_upc) sku.unit_upc = unit_upc;
            if (unit_size) sku.unit_size = unit_size;
            if (cpc) sku.cpc = cpc;
            if (prod_line) sku.prod_line = prod_line;
            if (ingredients) sku.ingredients = ingredients;
            if (comment) sku.comment = comment;
            sku.save(error => {
            if (error) return res.json({ success: false, error });
            return res.json({ success: true });
            });
        });
    }

    static getAllSkus(req, res){
        SKU.find((err, skus) => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true, data: skus });
          });
    }
}

export default SkuHandler;