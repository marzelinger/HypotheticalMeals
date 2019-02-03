// /models/handlers/FilterHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';
const {ObjectId} = require('mongodb');

class FilterHandler{

    static async getIngredientsByFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var sku_ids = req.params.sku_ids;
            if (sku_ids !== undefined && sku_ids !== "_"){
                sku_ids = sku_ids.replace(/\s/g, "").split(',');
                let skus = await SKU.find({ _id : { $in : sku_ids } });
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
            if (results.length == 0) return res.json({success: false, error: '404 Results'})
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
            var ingredient_ids = req.params.ingredient_ids;
            if (ingredient_ids !== undefined && ingredient_ids !== "_"){
                ingredient_ids = ingredient_ids.replace(/\s/g, "").split(',');
                let assoc_skus = [];
                console.log(ObjectId(ingredient_ids[0]))
                let skus = await SKU.find({ ingredients : ObjectId(ingredient_ids[0]) });
                console.log(skus)
                assoc_skus.push(skus)
                // ingredient_ids.map(async (ing_id) => {
                //     let skus = await SKU.find({ ingredients : ing_id });
                //     console.log(skus)
                //     assoc_skus.push(skus)
                // })
                console.log(skus);
                // let ingredients = await Ingredient.find({ _id : { $in : ingredient_ids } });
                // if (ingredients.length == 0) return res.json({success: false, error: '404 Ingredient'})
                // ingredients.map(ing => ing.skus.map(sku => ids.push(sku._id)));
                and_query.push( {_id: { $in: ingredient_ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$text: { $search: keyword } }); 
            }
            var prod_line_ids = req.params.prod_line_ids;
            console.log(prod_line_ids)
            if (prod_line_ids !== undefined && prod_line_ids !== "_"){
                prod_line_ids = prod_line_ids.replace(/\s/g, "").split(',');
                and_query.push({ prod_line: prod_line_ids }); 
            }
            let results = (and_query.length === 0) ? await SKU.find( ) : 
                                                     await SKU.find( {$and: and_query });
            if (results.length == 0) return res.json({success: false, error: '404 Results'})
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}
export default FilterHandler;