// /models/handlers/FilterHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';
import User from '../databases/User';
import printFuncBack from '../../printFuncBack';
import Formula from '../databases/formula';

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
                skus.map(sku => sku.formula.ingredients.map(ing => ids.push(ing._id)));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$or: [{name: { $regex: keyword , $options: "$i"}}, 
                {num: { $regex: keyword , $options: "$i"}}]}); 
            }
            //ADDED FOR THE PAGINATION STUFF    
            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);
            let results = (and_query.length === 0) ? 
                await Ingredient.find().skip(currentPage*pageSize).limit(pageSize).populate('skus').sort(sort_field)
                    .collation({locale: "en_US", numericOrdering: true}) : 
                await Ingredient.find( {$and: and_query }).skip(currentPage*pageSize).limit(pageSize).populate('skus')
                    .sort(sort_field).skip(currentPage*pageSize).limit(pageSize).collation({locale: "en_US", numericOrdering: true});



            // this.data.slice(this.state.currentPage *this.state.pageSize, 
            //     (this.state.currentPage +1) * this.state.pageSize)


            // let results = (and_query.length === 0) ? await Ingredient.find( ).populate('skus').sort(sort_field) : 
            //                                          await Ingredient.find( {$and: and_query }).populate('skus').sort(sort_field);
            
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
            var sort_field = req.params.sort_field;
            var ingredient_ids = req.params.ingredient_ids;
            console.log(ingredient_ids);
            if (ingredient_ids !== undefined && ingredient_ids !== "_"){
                ingredient_ids = ingredient_ids.replace(/\s/g, "").split(',');
                let formulas = await Formula.find({ ingredients : {$in : ingredient_ids } });
                var formula_string = "";

                for(var i = 0; i < formulas.length; i++){
                    var obj = formulas[i]
                    console.log(obj._id);
                    formula_string = formula_string + obj._id + ",";
                }
                formula_string = formula_string.substring(0,formula_string.length-1);
                console.log(formula_string);
                let skus = await SKU.find({ formula : {$in : formula_string } });
                console.log(skus.length);
                skus.map(sku => ids.push(sku._id));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$or: [{name: { $regex: keyword , $options: "$i"}}, 
                {num: { $regex: keyword , $options: "$i"}}, {case_upc: { $regex: keyword , $options: "$i"}},
                {unit_upc: { $regex: keyword , $options: "$i"}}]}); 
            }

            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);

            var prod_line_ids = req.params.prod_line_ids;
            if (prod_line_ids !== undefined && prod_line_ids !== "_"){
                prod_line_ids = prod_line_ids.replace(/\s/g, "").split(',');
                and_query.push({ prod_line: prod_line_ids }); 
            }

            var formula_id = req.params.formula_id;
            var formula_ids = [];
            if (formula_id !== undefined && formula_id != "_"){
                formula_ids.push(formula_id);
                let skus = await SKU.find({ formula : {$in : formula_ids } });
                skus.map(sku => ids.push(sku._id));
                and_query.push( {_id: { $in: ids } } );
            }
            let results = (and_query.length === 0) ? await SKU.find( ).skip(currentPage*pageSize).limit(pageSize)
                                                        .populate('formula').populate('prod_line').sort(sort_field)
                                                        .collation({locale: "en_US", numericOrdering: true}) : 
                                                     await SKU.find( {$and: and_query }).skip(currentPage*pageSize)
                                                        .limit(pageSize).populate('formula').populate('prod_line')
                                                        .sort(sort_field).collation({locale: "en_US", numericOrdering: true});
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async getUsersByFilter(req, res){
        try{
            printFuncBack('in the getUsersByFilter');
            var and_query = [];
            var ids = [];
            var sort_field = req.params.sort_field;
            var user_ids = req.params.ingredient_ids;
            if (user_ids !== undefined && user_ids !== "_"){
                // user_ids = user_ids.replace(/\s/g, "").split(',');
                // let skus = await SKU.find({ ingredients : {$in : ingredient_ids } });
                // skus.map(sku => ids.push(sku._id));
                // and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                // and_query.push({$or: [{username: { $regex: keyword , $options: "$i"}}, 
                // {privileges: { $regex: keyword , $options: "$i"}}, 
                // {admin_creator: { $regex: keyword , $options: "$i"}},
                // {comment: { $regex: keyword , $options: "$i"}}]}); 
            }
            printFuncBack('this is the and_query: '+and_query);

            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);
            let results = (and_query.length === 0) ? await User.find( ).skip(currentPage*pageSize).limit(pageSize)
                                                        .populate('users').sort(sort_field)
                                                        .collation({locale: "en_US", numericOrdering: true}) : 
                                                     await User.find( {$and: and_query }).skip(currentPage*pageSize)
                                                        .limit(pageSize).populate('users')
                                                        .sort(sort_field).collation({locale: "en_US", numericOrdering: true});
            printFuncBack('this is the results: '+results);
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }

        
    }
    static async getFormulasbyFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var sort_field = req.params.sort_field;
            var ingredient_ids = req.params.ingredient_ids;
            if (ingredient_ids !== undefined && ingredient_ids !== "_"){
                ingredient_ids = ingredient_ids.replace(/\s/g, "").split(',');
                console.log(ingredient_ids);
                let formulas = await Formula.find({ ingredients : {$in : ingredient_ids } });
                formulas.map(formula => ids.push(formula._id));
                and_query.push( {_id: { $in: ids } } );
            }
            var keyword = req.params.keyword;
            if (keyword !== undefined && keyword !== "_"){
                and_query.push({$or: [{name: { $regex: keyword , $options: "$i"}}, 
                {num: { $regex: keyword , $options: "$i"}}]}); 
            }

            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);

            let results = (and_query.length === 0) ? await Formula.find( ).skip(currentPage*pageSize).limit(pageSize)
                                                        .populate('ingredients').sort(sort_field)
                                                        .collation({locale: "en_US", numericOrdering: true}) : 
                                                     await Formula.find( {$and: and_query }).skip(currentPage*pageSize)
                                                        .limit(pageSize).populate('ingredients')
                                                        .sort(sort_field).collation({locale: "en_US", numericOrdering: true});
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}
export default FilterHandler;