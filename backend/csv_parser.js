import Prod_Line from './models/databases/prod_line';
import SKU from './models/databases/sku';
import Ingredient from './models/databases/ingredient';

const csv = require('csvtojson');
const fs = require('fs');


export default class CSV_parser{

    static async parseProdLineCSV (req, res){
        try{
            // Extracts all prod lines from database
            var db_prod_lines = new Set();
            let all_prod_lines = await Prod_Line.find()
            all_prod_lines.forEach(function (prod_line){
                db_prod_lines.add(prod_line.name);
            });

            // Converts the CSV input to JSON
            var prod_lines_to_add = new Set();
            const jsonArray = await csv().fromFile(req.file.path);
            if(jsonArray.length == 0){
                fs.unlinkSync(req.file.path);
                return res.json({ success: false, empty: true});
            }
            
            // Checks to see if the CSV column names are specified correctly
            var count = 0;
            for(var key in jsonArray[0]){
                if(key != "Name") {
                    fs.unlinkSync(req.file.path);
                    return res.json({ success: false, header: 1, expected: "Name", actual: key});
                }
                count = count + 1;
            }
            if(count != 1) {
                fs.unlinkSync(req.file.path);
                return res.json({ success: false, requiredFields:1, numFields: (count-1)});
            }

            var added = 0;
            var ignored = 0;
            // For each CSV to potentially add, check if it would cause a collision
            // If it doesn't, add it to a set indicating it will be added
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(db_prod_lines.has(obj.Name)){
                    ignored = ignored + 1;
                }
                else if(!prod_lines_to_add.has(obj.Name)){
                    added = added + 1;
                    prod_lines_to_add.add(obj.Name);
                } else {
                    return res.json({ success: false, collision: i});
                }
            }

            // Creates the product line to save to the database 
            var prod_lines_added = [];
            for(const prod_line_to_add of prod_lines_to_add) {
                var prod_line = new Prod_Line();
                prod_line.name = prod_line_to_add;
                let new_prod_line = prod_line.save();
                prod_lines_added.push(new_prod_line);
            }
            fs.unlinkSync(req.file.path);
            return res.json({ success: true, added: added, ignored: ignored, data: prod_lines_added});
        } catch (err){
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, error: 'Catch all error'});
        }
    }

    static async parseSKUCSV(req, res){
 //       try{ 
            // Extracts all skus from the database
            var db_skus = new Set();
            let all_skus = await SKU.find();
            all_skus.forEach(function (sku){
                db_skus.add(sku.num);
            });

            // Extracts all product lines from the database 
            var db_prod_lines = new Set();
            var all_prod_lines = await Prod_Line.find();
            all_prod_lines.forEach(function (prod_line){
                db_prod_lines.add(prod_line.name);
            });

            // Imports CSV, converts to JSON and makes sure it isn't empty
            const jsonArray = await csv().fromFile(req.file.path);
            fs.unlinkSync(req.file.path);
            if(jsonArray.length == 0){
                return res.json({ success: false, empty: true});
            }

            // Checks to see if the CSV column names are specified correctly
            var count = 0;
            for(var key in jsonArray[0]){
                if(count == 0 && key != "SKU#") return res.json({ success: false, header: 1, expected:"SKU#", actual: key});
                if(count == 1 && key != "Name") return res.json({ success: false, header: 2, expected:"Name", actual: key});
                if(count == 2 && key != "Case UPC") return res.json({ success: false, header: 3, expected:"Case UPC", actual: key});
                if(count == 3 && key != "Unit UPC") return res.json({ succes: false, header: 4, expected:"Unit UPC", actual: key});
                if(count == 4 && key != "Unit size") return res.json({ success: false, header: 5, expected:"Unit size", actual: key});
                if(count == 5 && key != "Count per case") return res.json({ success: false, header: 6, expected:"Count per case", actual: key});
                if(count == 6 && key != "Product Line Name") return res.json({ success: false, header: 7, expected:"Product Line Name", actual: key});
                if(count == 7 && key != "Comment") return res.json({ success: false, header: 8, expected:"Comment", actual: key});
                count++;
            }
            if(count != 8) return res.json({ success: false, requiredFields: 8, numFields: (count-1)});

            // Iterates over each SKU to add and checks if any collisions are present
            // and if all the product lines actually exist
            var skus_to_update = new Set();
            var skus_to_add = new Set();
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(!db_prod_lines.has(obj["Product Line Name"])) {
                    return res.json({ success: false, row: i+1, prod_line_name: obj["Product Line Name"]});
                }
                else if(skus_to_add.has(obj["SKU#"])){
                    return res.json({ success: false, duplicate: i});
                }
                else if(db_skus.has(obj["SKU#"])){
                    var db_sku = await SKU.find({ num : obj["SKU#"]});
                  /*  if(db_sku.case_upc != obj["Case "]) {
                        return res.json({ success: false, collision: i});
                    }*/
                    skus_to_update.add(obj["SKU#"]);
                }
                else{
                    skus_to_add.add(obj["SKU#"]);
                }
            }

            // For each entry in the JSON, check if we indicated to add it
            // If we did add it and increment added counter, otherwise increment ignored counter
            var added = 0;
            var ignored = 0;
            var updated = 0;
            var skus_added = [];
            var intermediate_skus_added = []; 
            var skus_to_update_new = [];
            var skus_to_update_old = [];
            for(var i =0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(skus_to_add.has(obj["SKU#"])){
                    added = added + 1;
                    var sku = new SKU();
                    sku.name = obj.Name;
                    sku.num = obj["SKU#"];
                    sku.case_upc = obj["Case UPC"];
                    sku.unit_upc = obj["Unit UPC"];
                    sku.unit_size = obj["Unit Size"];
                    sku.cpc = obj["Count per case"];
                    sku.prod_line = obj["Product Line Name"];
                    sku.comment = obj["Comment"];
                    intermediate_skus_added.push(sku);
                    //let new_sku = await sku.save();
                    //skus_added.push(new_sku);
                }
                else if(skus_to_update.has(obj["SKU#"])){
                    updated = updated + 1;
                    var toLookUp = obj["SKU#"]
                    var old_sku = await SKU.find({ num: toLookUp});
                    obj.name = obj.Name;
                    obj.num = obj["SKU#"];
                    obj.case_upc = obj["Case UPC"];
                    obj.unit_upc = obj["Unit UPC"];
                    obj.unit_size = obj["Unit size"];
                    obj.cpc = obj["Count per case"];
                    obj.prod_line = obj["Product Line Name"];
                    obj.comment = obj["Comment"];
                    delete obj["Name"];
                    delete obj["SKU#"];
                    delete obj["Case UPC"];
                    delete obj["Unit UPC"];
                    delete obj["Unit size"];
                    delete obj["Count per case"];
                    delete obj["Product Line Name"];
                    delete obj["Comment"];
                    skus_to_update_new.push(obj);
                    skus_to_update_old.push(old_sku[0]);
                }
                else {
                    ignored = ignored + 1;;
                }
            }  

            if(updated == 0) {
                for(var i = 0; i < intermediate_skus_added.length; i++){
                    let new_sku = await intermediate_skus_added[i].save();
                    skus_added.push(new_sku);
                }
                return res.json({ success: true, added: added, ignored: ignored, updated: updated, data: skus_added});
            } else{
                return res.json({ success: true, added: added, ignored: ignored, updated: updated, data: intermediate_skus_added, old_data: skus_to_update_old, new_data: skus_to_update_new});
            }
      //  }
      /*
        catch (err) {
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, error: 'Catch all error'});
        }*/
    }

    static async parseUpdateSKU(req, res){
        var all_skus = [];
        var updateArray = JSON.parse(req.body.updates);
        var addArray = JSON.parse(req.body.adds);
        for(var i = 0; i < updateArray.length; i++){
            let updated_sku = await SKU.findOneAndUpdate({ num : updateArray[i].num},
                {$set: {case_upc : updateArray[i].case_upc, unit_upc : updateArray[i].unit_upc,
                        unit_size : updateArray[i].unit_size, cpc: updateArray[i].cpc, prod_line: updateArray[i].prod_line,
                        comment : updateArray[i].comment}}, {upsert : true, new : true});
            all_skus.push(updated_sku);
        }
        for(var i = 0; i < addArray.length; i++){
            var sku = new SKU();
            sku.name = addArray[i].name;
            sku.num = addArray[i].num;
            sku.case_upc = addArray[i].case_upc;
            sku.unit_upc = addArray[i].unit_upc;
            sku.unit_size = addArray[i].unit_size;
            sku.cpc = addArray[i].cpc;
            sku.prod_line = addArray[i].prod_line;
            sku.comment = addArray[i].comment;
            let new_sku = await sku.save();
            all_skus.push(new_sku);
        }
        return res.json({ success: true, data: all_skus});
    }

    static async parseIngredientsCSV(req, res){
        try {
            //Extract all the ingredient names and ingredient numbers that already exist in the database
            var db_ingredients_nums = new Set();
            var all_ingredients = await Ingredient.find();
            all_ingredients.forEach(function (ingredient){
                db_ingredients_nums.add(ingredient.num);
            });

            // Create the json array from the CSV
            const jsonArray = await csv().fromFile(req.file.path);
            fs.unlinkSync(req.file.path);
            if(jsonArray.length == 0){
                return res.json({ success: false, empty: true});
            }
            
            // Checks to see if the CSV column names are specified correctly
            var count = 0;
            for(var key in jsonArray[0]){
                if(count == 0 && key != "Ingr#") return res.json({ success: false, header: 1, actual: key, expected: "Ingr#"});
                if(count == 1 && key != "Name") return res.json({ success: false, header: 2, actual: key, expected: "Name"});
                if(count == 2 && key != "Vendor Info") return res.json({ success: false, header: 3, actual: key, expected: "Vendor Info"});
                if(count == 3 && key != "Size") return res.json({ succes: false, header: 4, actual: key, expected: "Size"});
                if(count == 4 && key != "Cost") return res.json({ success: false, header: 5, actual: key, expected: "Cost"});
                if(count == 5 && key != "Comment") return res.json({ success: false, header: 6, actual: key, expected: "Comment"});
                count++;
            }
            if(count != 6) return res.json({ success: false, requiredFields: 6, numFields: (count-1)});

            // For each entry, check if there is a collision with whats in the database
            // If there isn't any, indicate that we need to add this entry
            var ingrs_to_add_nums = new Set();
            var ingrs_to_add_names = new Set();
            var ingrs_to_add = new Set();
            var ingrs_to_update = new Set();
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(ingrs_to_add_nums.has(obj["Ingr#"]) || ingrs_to_add_names.has(obj["Name"])) {
                    return res.json({ success: false, duplicate: i});
                } else if(db_ingredients_nums.has(obj["Ingr#"])) {
                    var db_ingredient = await Ingredient.find({ num : obj["Ingr#"]});

                    if(db_ingredient.name != obj["Name"]){
                        return res.json({ success: false, collision: i});
                    } else {
                        ingrs_to_update.add(obj["Ingr#"]);
                    }
                } else {
                    ingrs_to_add.add(obj["Ingr#"]);
                }
            }

            var added = 0;
            var ignored = 0;
            updated = 0;
            var ingredients_added = [];
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(ingr_rows_to_add.has(i)){
                    added++;
                    var ingredient = new Ingredient();
                    ingredient.name = obj.Name;
                    ingredient.num = obj["Ingr#"];
                    ingredient.vendor_info = obj["Vendor Info"];
                    ingredient.pkg_size = obj["Size"]
                    ingredient.pkg_cost = obj["Cost"];
                    ingredient.comment = obj["Comment"];
                    let new_ingredient = await ingredient.save();
                    ingredients_added.push(new_ingredient);
                } else {
                    ignored++;
                }
            }
            fs.unlinkSync(req.file.path);
            return res.json({ success: true, added: added, ignored: ignored, data: ingredients_added});
        }
        catch (err) {
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, error : err});
        }
    }

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
        // TODO create a map of SKU -> Ingredient
        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];
            if(!db_skus_nums.has(obj["SKU#"])){
                return res.json({ success: false, sku_dependency: i});
            }
            else if(!db_ingredients_nums.has(obj["Ingr#"])){
                return res.json({ success: false, ingr_dependency: i})
            }
            else {

            }
        }

        //TODO: change this to iterate over the map and update skus and ingredients appropriately
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
    }


}