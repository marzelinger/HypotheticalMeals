// /models/handlers/FilterHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';

class FilterHandler{

    static async getIngredientsByFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var param_ids = req.params.sku_ids;
            if (param_ids !== undefined && param_ids !== "_"){
                param_ids = param_ids.replace(/\s/g, "").split(',');
                let skus = await SKU.find({ _id : { $in : param_ids } });
                if (skus.length == 0) return res.json({success: false, error: '404 SKU'})
                skus.map(sku => sku.ingredients.map(ing => ids.push(ing._id)));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$text: { $search: keyword } }); 
            }
            let results = (and_query.length === 0) ? await Ingredient.find( ) : 
                                               await Ingredient.find( {$and: and_query });
            if (results.length == 0) return res.json({success: false, error: '404 Keyword'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusByFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var param_ids = req.params.ingredient_ids;
            if (param_ids !== undefined && param_ids !== "_"){
                param_ids = param_ids.replace(/\s/g, "").split(',');
                let ingredients = await Ingredient.find({ _id : { $in : param_ids } });
                if (ingredients.length == 0) return res.json({success: false, error: '404 Ingredient'})
                ingredients.map(ing => ing.skus.map(sku => ids.push(sku._id)));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$text: { $search: keyword } }); 
            }
            var prod_line_id = req.params.prod_line_id;
            if (prod_line_id !== undefined && prod_line_id !== "_"){
                and_query.push({ prod_line: prod_line_id }); 
            }
            let results = (and_query.length === 0) ? await SKU.find( ) : 
                                                     await SKU.find( {$and: and_query });
            if (results.length == 0) return res.json({success: false, error: '404 Keyword'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

}
export default FilterHandler;