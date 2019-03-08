// /models/handlers/FilterHandler.js
// Riley

import Ingredient from '../databases/ingredient';
import SKU from '../databases/sku';
import User from '../databases/User';
import printFuncBack from '../../printFuncBack';
import Formula from '../databases/formula';
import Customer from '../databases/customer';
import SaleRecord from '../databases/sale_record';
import moment from 'moment';

class FilterHandler{

    static async getIngredientsByFilter(req, res){
        try{
            var and_query = [];
            var ids = [];
            var sort_field = req.params.sort_field;
            var sku_ids = req.params.sku_ids;
            if (sku_ids !== undefined && sku_ids !== "_"){
                sku_ids = sku_ids.replace(/\s/g, "").split(',');
                let skus = await SKU.find({ _id : { $in : sku_ids } }).populate('formula');
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
            console.log(err)
            return res.json({ success: false, error: err});
        }
    }

    static async getSkusByFilter(req, res){
         try{
            var and_query = [];
            var ids = [];
            var sort_field = req.params.sort_field;
            var ingredient_ids = req.params.ingredient_ids;

            if (ingredient_ids !== undefined && ingredient_ids !== "_"){
                ingredient_ids = ingredient_ids.replace(/\s/g, "").split(',');
                let formulas = await Formula.find({ ingredients : {$in : ingredient_ids } });
                console.log(formulas)
                let skus = await SKU.find({ formula : {$in : formulas } });
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
            //printFuncBack('this is the and_query: '+and_query);

            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);
            let results = (and_query.length === 0) ? await User.find( ).skip(currentPage*pageSize).limit(pageSize)
                                                        .populate('users').sort(sort_field)
                                                        .collation({locale: "en_US", numericOrdering: true}) : 
                                                     await User.find( {$and: and_query }).skip(currentPage*pageSize)
                                                        .limit(pageSize).populate('users')
                                                        .sort(sort_field).collation({locale: "en_US", numericOrdering: true});
            //printFuncBack('this is the results: '+results);
            return res.json({ success: true, data: results});
        }
        catch (err) {
            console.log(err)
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
                //console.log(ingredient_ids);
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

    static async getSaleRecordsbyFilter(req, res){
        try{
            var and_query = [];
            var sku_nums = [];
            var prod_line_ids = req.params.prod_line_ids;
            var sku_id = req.params.sku_id;
            var customer_id = req.params.customer_id;
            var range_start = req.params.date_range_start;
            var range_end = req.params.date_range_end;
            if (prod_line_ids !== undefined && prod_line_ids !== "_"){
                prod_line_ids = prod_line_ids.replace(/\s/g, "").split(',');
                let skus = await SKU.find({ prod_line : {$in : prod_line_ids } });
                skus.map(sku => sku_nums.push(sku.num));
            }
            if (sku_id !== undefined && sku_id !== "_"){
                let sku = await SKU.findOne({ _id : sku_id });
                sku_nums.push(sku.num);
            }
            if ((prod_line_ids !== undefined && prod_line_ids !== "_") || (sku_id !== undefined && sku_id !== "_")){
                and_query.push( {sku_num: { $in: sku_nums } } );
            }
            if (customer_id !== undefined && customer_id !== "_"){
                let customer = await Customer.findOne({ _id : customer_id });
                and_query.push({ cust_num: customer.number })
            }
            if (range_start !== undefined && range_start !== "_" && range_end !== undefined && range_end !== "_"){
                let start_date = new moment(range_start)
                let end_date = new moment(range_end)
                let start_week = (start_date.month() === 11 && start_date.week() === 1) ? 52 : start_date.week()
                let end_week = (end_date.month() === 11 && end_date.week() === 1) ? 52 : end_date.week()
                if (end_date.year() === start_date.year()) {
                    and_query.push({ "date.year" : { $lte: end_date.year(), $gte: start_date.year() } })
                    and_query.push({ "date.week" : { $lte: end_week, $gte: start_week } })
                }
                else if (end_date.year() > start_date.year()) {
                    let or_query = []
                    or_query.push({ "date.year" : { $lt: end_date.year(), $gt: start_date.year() } })
                    or_query.push({
                        $and : [
                            { "date.year" : end_date.year() },
                            { "date.week" : { $lte: end_week } }
                        ]
                    })
                    or_query.push({
                        $and : [
                            { "date.year" : start_date.year() },
                            { "date.week" : { $gte: start_week } }
                        ]
                    })
                    console.log(or_query)
                    and_query.push({ $or : or_query })
                }
                else {
                    throw 'Invalid Date Range'
                }
            }
            console.log(and_query)
            var sort_field = req.params.sort_field;
            var currentPage = Number(req.params.currentPage);
            var pageSize = Number(req.params.pageSize);

            let results = (and_query.length === 0) ? await SaleRecord.find( ).skip(currentPage*pageSize).limit(pageSize)
                                                        .sort(sort_field).collation({locale: "en_US", numericOrdering: true}) : 
                                                     await SaleRecord.find( {$and: and_query }).skip(currentPage*pageSize)
                                                        .limit(pageSize)
                                                        .sort(sort_field).collation({locale: "en_US", numericOrdering: true});
            return res.json({ success: true, data: results});
        }
        catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}
export default FilterHandler;