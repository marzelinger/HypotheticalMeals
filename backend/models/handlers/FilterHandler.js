// /models/handlers/FilterHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';

class FilterHandler{

    static async getIngredientsByFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var id = req.body.ingredient_id;
            if (id !== undefined){
                let sku = await SKU.find({ _id : id });
                if (sku.length == 0) return res.json({success: false, error: '404 SKU'})
                sku[0].ingredients.map(ing => ids.push(ing._id));
                if (ids.length !== 0){
                    and_query.push( {_id: { $in: ids } } );
                }
            }
            var keyword = req.body.keyword;
            if (keyword !== "" && keyword !== undefined){
                and_query.push({$text: { $search: keyword } }); 
            }
            let results = await Ingredient.find( {$and: and_query });
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
            var id = req.body.sku_id;
            if (id !== undefined){
                let ingredient = await Ingredient.find({ _id : id });
                if (ingredient.length == 0) return res.json({success: false, error: '404 Ingredient'})
                ingredient[0].skus.map(sku => ids.push(sku._id));
                if (ids.length !== 0){
                    and_query.push( {_id: { $in: ids } } );
                }
            }
            var keyword = req.body.keyword;
            if (keyword !== "" && keyword !== undefined){
                and_query.push({$text: { $search: keyword } }); 
            }
            let results = await SKU.find( {$and: and_query });
            if (results.length == 0) return res.json({success: false, error: '404 Keyword'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}
export default FilterHandler;