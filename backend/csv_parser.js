import Prod_Line from './models/databases/prod_line';
import SKU from './models/databases/sku';
import Ingredient from './models/databases/ingredient';

let csv = require('csvtojson');


export default class CSV_parser{

    static async parseProdLineCSV (req, res){
        try {
            var db_prod_lines = new Set();
            let all_prod_lines = await Prod_Line.find()
            all_prod_lines.forEach(function (prod_line){
                db_prod_lines.add(prod_line.name);
            });

            var prod_lines_to_add = new Set();
            const jsonArray = await csv().fromFile('testProdLineSheet.csv');
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(db_prod_lines.has(obj.Name)){
                    return res.json({ success: false, error: 'Collision occured'});
                }
                if(!prod_lines_to_add.has(obj.Name)){
                    prod_lines_to_add.add(obj.Name);
                }
            }

            for(const prod_line_to_add of prod_lines_to_add) {
                var prod_line = new Prod_Line();
                prod_line.name = prod_line_to_add;
                let new_prod_line = prod_line.save();
            }

            return res.json({ success: true, data: "Success"});
        } catch(err){
            return res.json({ success: false, error: err});
        }
    }

    static async parseSKUCSV(req, res){
        try {
            var db_skus = new Set();
            let all_skus = await SKU.find();
            all_skus.forEach(function (sku){
                db_skus.add(sku.num);
            });

            var db_prod_lines = new Set();
            var all_prod_lines = await Prod_Line.find();
            all_prod_lines.forEach(function (prod_line){
                db_prod_lines.add(prod_line.name);
            });

            var skus_to_add = new Set();
            const jsonArray = await csv().fromFile('testSpreadSheet.csv');
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(db_skus.has(obj["SKU#"])){
                    return res.json({ success: false, error: 'Collision occured'});
                }
                if(!db_prod_lines.has(obj["Product Line Name"])){
                    return res.json({ success: false, error: 'Incorrect product line: ' + obj["Product Line Name"] + ' from line: ' + i});
                }
                if(!skus_to_add.has(obj["SKU"])){
                    skus_to_add.add(obj["SKU#"]);
                }
            }

            var added = 0;
            var ignored = 0;
            for(var i =0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(skus_to_add.has(obj["SKU#"])){
                    added++;
                    var sku = new SKU();
                    sku.name = obj.Name;
                    sku.num = obj["SKU#"];
                    sku.case_upc = obj["Case UPC"];
                    sku.unit_upc = obj["Unit UPC"];
                    sku.unit_size = obj["Unit Size"];
                    sku.cpc = obj["Count per case"];
                    sku.prod_line = obj["Product Line Name"];
                    sku.comment = obj["Comment"];
                    let new_sku = await sku.save();
                }
                else {
                    ignored++;
                }
            }  
            return res.json({ success: true, data : jsonArray});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static async parseIngredientsCSV(req, res){
        try {
            var db_ingredients_names = new Set();
            var db_ingredients_nums = new Set();
            var all_ingredients = await Ingredient.find();
            all_ingredients.forEach(function (ingredient){
                db_ingredients_names.add(ingredient.name);
                db_ingredients_nums.add(ingredient.num);
            });
            console.log("gets here1");
            var ingredients_to_add_names = new Set();
            var ingredients_to_add_nums = new Set();
            const jsonArray = await csv().fromFile('testIngredientSheet.csv');
            console.log("gets here2");
            for(var i = 0; i < jsonArray.length; i++){
                console.log('gets here once');
                var obj = jsonArray[i];
                if(db_ingredients_names.has(obj.Name) || db_ingredients_nums.has(obj["Ingr#"])){
                    return res.json({ success: false, error: 'Collision occured'});
                }
                console.log('gets here once2');
                if(!ingredients_to_add_names.has(obj.Name) || !ingredients_to_add_nums(obj["Ingr#"]) ){
                    ingredients_to_add_names.add(obj.Name);
                    ingredients_to_add_nums.add(obj["Ingr#"]);
                }
            }

            var added = 0;
            var ignored = 0;
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(ingredients_to_add_names.has(obj.Name)){
                    added++;
                    var ingredient = new Ingredient();
                    ingredient.name = obj.Name;
                    ingredient.num = obj["Ingr#"];
                    ingredient.vendor_info = obj["Vendor Info"];
                    ingredient.pkg_size = obj["Size"]
                    ingredient.pkg_cost = obj["Cost"];
                    ingredient.comment = obj["Comment"];
                    let new_ingredient = await ingredient.save();
                } else {
                    ignored++;
                }
            }
            return res.json({ success: true, data : jsonArray});
        }
        catch (err) {
            return res.json({ success: false, error : err});
        }
    }
/*
    static async parseFormulasCSV(req, res){
        var db_ingredients_nums = new Set();
        var db_skus_nums = new Set();

        var all_skus = await SKU.find();
        var all_ingredients = await Ingredient.find();

        all_skus.forEach(function (sku){
            db_skus_nums.add(sku.num);
        });
        all_ingredients.forEach(function (ingredient){
            db_ingredients_nums.add(ingredient.num);
        });

       
        const jsonArray = csv().fromFile("testFormulaSheet.csv");
        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];
            if(!db_skus_nums.has(obj["SKU#"])){
                return res.json({ success: false, error: "The SKU entry from line " + i + " does not exist in the database"});
            }
            if(!db_skus_)
        }

        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];
            if(db_skus_nums.has(obj["SKU#"]) && db_ingredients_nums.has(obj["Ingr#"])){
                var sku_to_use = await SKU.find({ num : obj["SKU#"]});
                var ingr_to_use = await Ingredient.find({ num : obj["Ingr#"]});

                var current_skus = ingr_to_use.skus;
                var current_ingredients = sku_to_use.ingredients;
                var current_ingr_quantities = sku_to_use.ingredient_quantities;

                current_skus.push(sku_to_use.id);
                current_ingredients.push(ingr_to_use.id);
                current_ingr_quantities.push(obj["Quantity"]);

                sku_to_use.ingredients = current_ingredients;
                sku_to_use.quantities = current_ingr_quantities;
                ingr_to_use.skus = current_skus;

                var new_sku = await sku_to_use.save();
                var new_ingr = await ingredient_to_use.save();
            }
        }
    }*/


}