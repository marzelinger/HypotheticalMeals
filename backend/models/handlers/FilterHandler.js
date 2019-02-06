// /models/handlers/FilterHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';

class FilterHandler{

    static async getIngredientsByFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var sort_field = req.params.sort_field;
            var sku_ids = req.params.sku_ids;
            if (sku_ids !== undefined && sku_ids !== "_"){
                sku_ids = sku_ids.replace(/\s/g, "").split(',');
                let skus = await SKU.find({ _id : { $in : sku_ids } });
                if (skus.length == 0) return res.json({success: true, data: []})
                skus.map(sku => sku.ingredients.map(ing => ids.push(ing._id)));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$or: [{name: { $regex: keyword , $options: "$i"}}, {pkg_size:{ $regex: keyword , $options: "$i"}}, {vendor_info: { $regex: keyword , $options: "$i"}}, {comment: { $regex: keyword , $options: "$i"}}]}); 
            }
            //ADDED FOR THE PAGINATION STUFF    
            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);
            //console.log('this is the currentpage: '+currentPage);
            //console.log('this is the pageSize: '+pageSize);
            //console.log('this is the query length: '+and_query.length);
            let results = (and_query.length === 0) ? await Ingredient.find().skip(currentPage*pageSize).limit(pageSize).populate('skus').sort(sort_field) : await Ingredient.find( {$and: and_query }).skip(currentPage*pageSize).limit(pageSize).populate('skus').sort(sort_field).skip(currentPage*pageSize).limit(pageSize);

            //console.log('this is the results: '+results);


            // this.data.slice(this.state.currentPage *this.state.pageSize, 
            //     (this.state.currentPage +1) * this.state.pageSize)


            // let results = (and_query.length === 0) ? await Ingredient.find( ).populate('skus').sort(sort_field) : 
            //                                          await Ingredient.find( {$and: and_query }).populate('skus').sort(sort_field);
            
            if (results.length == 0) return results = [];
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusByFilter(req, res){
        try{
            console.log(req);
            var and_query = [];
            var ids = [];
            var sort_field = req.params.sort_field;
            var ingredient_ids = req.params.ingredient_ids;
            if (ingredient_ids !== undefined && ingredient_ids !== "_"){
                ingredient_ids = ingredient_ids.replace(/\s/g, "").split(',');
                let skus = await SKU.find({ ingredients : {$in : ingredient_ids } });
                skus.map(sku => ids.push(sku._id));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$or: [{name: { $regex: keyword , $options: "$i"}}, {unit_size: { $regex: keyword , $options: "$i"}}, {comment: { $regex: keyword , $options: "$i"}}]}); 
            }

            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);

            var prod_line_ids = req.params.prod_line_ids;
            if (prod_line_ids !== undefined && prod_line_ids !== "_"){
                prod_line_ids = prod_line_ids.replace(/\s/g, "").split(',');
                and_query.push({ prod_line: prod_line_ids }); 
            }
            console.log(and_query)
            let results = (and_query.length === 0) ? await SKU.find( ).skip(currentPage*pageSize).limit(pageSize).populate('ingredients').populate('prod_line').sort(sort_field) : 
                                                     await SKU.find( {$and: and_query }).skip(currentPage*pageSize).limit(pageSize).populate('ingredients').populate('prod_line').sort(sort_field);
            if (results.length == 0) results = [];
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}
export default FilterHandler;