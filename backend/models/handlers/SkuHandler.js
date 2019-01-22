// /models/handlers/SkuHandler.js
// Belal and Riley

import SKU from './../databases/sku';

class SkuHandler{

    static updateSkuByID(req, res){
        const { sku_ID } = req.params;
        if (!sku_ID) {
            return res.json({ success: false, error: 'No sku id provided' });
        }
        SKU.findById(sku_ID, (error, sku) => {
            if (error) return res.json({ success: false, error });
            const { sku_num, name, case_upc, unit_upc, unit_size, cpc, 
                prod_line, ingredients, comment } = req.body;
            if (name) sku.name = name;
            if (sku_num) skue.sku_num = sku_num;
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