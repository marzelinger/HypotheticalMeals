import Prod_Line from './models/databases/prod_line';
import SKU from './models/databases/sku';
import Ingredient from './models/databases/ingredient';
import ItemStore from './../client/src/helpers/ItemStore';

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
            fs.unlinkSync(req.file.path);

            if(jsonArray.length == 0){
                return res.json({ success: false, empty: true});
            }
            
            // Checks to see if the CSV column names are specified correctly
            var count = 0;
            for(var key in jsonArray[0]){
                if(key != "Name") {
                    return res.json({ success: false, header: 1, expected: "Name", actual: key});
                }
                count = count + 1;
            }
            if(count != 1) {
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
            var prod_lines_ignored = [];
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                var obj_Name = obj["Name"];
                if(prod_lines_to_add.has(obj_Name)){
                    var prod_line = new Prod_Line();
                    prod_line.name = obj_Name;
                    let new_prod_line = prod_line.save();
                    prod_lines_added.push(prod_line);
                } else {
                    obj.name = obj_Name;
                    delete obj["Name"];
                    prod_lines_ignored.push(obj);
                }
            }
            return res.json({ success: true, added: added, ignored: ignored, 
                            data: prod_lines_added, showImport: true,
                            ignored_data: prod_lines_ignored});
        } catch (err){
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, error: 'Catch all error'});
        }
    }

    static async parseSKUCSV(req, res){
 //       try{ 
            // Extracts all skus from the database
            var db_skus = new Map();
            var db_caseUPCs = new Set();
            let all_skus = await SKU.find();
            all_skus.forEach(function (sku){
                db_skus.set(sku.num, sku.case_upc);
                db_caseUPCs.add(sku.case_upc)
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
                else if(count == 1 && key != "Name") return res.json({ success: false, header: 2, expected:"Name", actual: key});
                else if(count == 2 && key != "Case UPC") return res.json({ success: false, header: 3, expected:"Case UPC", actual: key});
                else if(count == 3 && key != "Unit UPC") return res.json({ succes: false, header: 4, expected:"Unit UPC", actual: key});
                else if(count == 4 && key != "Unit size") return res.json({ success: false, header: 5, expected:"Unit size", actual: key});
                else if(count == 5 && key != "Count per case") return res.json({ success: false, header: 6, expected:"Count per case", actual: key});
                else if(count == 6 && key != "Product Line Name") return res.json({ success: false, header: 7, expected:"Product Line Name", actual: key});
                else if(count == 7 && key != "Comment") return res.json({ success: false, header: 8, expected:"Comment", actual: key});
                count++;
            }
            if(count != 8) return res.json({ success: false, requiredFields: 8, numFields: (count-1)});

            // Iterates over each SKU to add and checks if any collisions are present
            // and if all the product lines actually exist
            
            var skus_to_add = new Set();
            var skus_to_add_names = new Set();
            var skus_to_update = new Set();
            var skus_to_ignore = new Set();
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                //Validate required fields
                if(!obj["Name"] || !obj["Case UPC"] || !obj["Unit UPC"] ||
                   !obj["Unit size"] || !obj["Count per case"] || !obj["Product Line Name"]) {
                       return res.json({ success: false, incompleteEntry: i})
                }

                if(obj["SKU#"] == "\"\"" || !obj["SKU#"]) obj["SKU#"] = ItemStore.getUniqueNumber(all_skus);

                //TODO check if any of the fields are null, if they are and they're autogenerable, generate, if not return an error
                
                // DATA VALIDATION
                if(obj["Name"].length < 1 || obj["Name"].length > 32) return res.json({success: false, badData: i});

                var isNum1 = /^\d+$/.test(obj["SKU#"]);
                if(!isNum1) return res.json({ success: false, badData: i});

                if(obj["Case UPC"].length != 12) return res.json({ success: false, badData: i});
                var isNum2 = /^\d+$/.test(obj["Unit UPC"]);
                if(!isNum2) return res.json({ success: false, badData: i});
                var firstChar = obj["Case UPC"].substring(0,1);
                if(firstChar != '0' && firstChar != '1' && firstChar !='6' && firstChar != '7' && firstChar !='8' && firstChar != '9') return res.json({ success: false, badData: i});
                
                if(obj["Unit UPC"].length != 12) return res.json({ success4: false, badData: i});
                var isNum3 = /^\d+$/.test(obj["Case UPC"]);
                if(!isNum3) return res.json({ success: false, badData: i});
                var firstChar2 = obj["Unit UPC"].substring(0,1);
                if(firstChar2 != '0' && firstChar2 != '1' && firstChar2 !='6' && firstChar2 != '7' && firstChar2 !='8' && firstChar2 != '9') return res.json({ success: false, badData: i});

                var isNum4 =  /^\d+$/.test(obj["Count per case"]);
                if(!isNum4) return res.json({ success: false, badData: i});

                // If the specified product line doesn't exist, indicate to the user
                if(!db_prod_lines.has(obj["Product Line Name"])) {
                    return res.json({ success: false, row: i+1, prod_line_name: obj["Product Line Name"]});
                } 
                // Check for a duplicate in the same CSV file
                else if(skus_to_add.has(obj["SKU#"]) || skus_to_add_names.has(obj["Name"])){
                    return res.json({ success: false, duplicate: i});
                }  
                // If a unique identifier of the object is in the db but the primary key is not, return an error
                else if( db_caseUPCs.has(Number(obj["Case UPC"])) && !db_skus.has(Number(obj["SKU#"])) ){
                    return res.json({ success: false, collision: i});
                } 
                // Checking for collisions with the primary key
                else if(db_skus.has(Number(obj["SKU#"]))){
                    var db_sku_arr= await SKU.find({ num : Number(obj["SKU#"]) });
                    var curr_prod_line_arr = await Prod_Line.find({ name: obj["Product Line Name"] });
                    // If it is a duplicate from something in the database, ignore it
                    var db_sku = db_sku_arr[0];
                    var curr_prod_line = curr_prod_line_arr[0];
                    if(db_sku.name == obj["Name"] &&
                    db_sku.num == obj["SKU#"] &&
                    db_sku.case_upc == obj["Case UPC"] &&
                    db_sku.unit_upc == obj["Unit UPC"] &&
                    db_sku.unit_size == obj["Unit size"] &&
                    db_sku.cpc == obj["Count per case"] &&
                    db_sku.prod_line._id + "" == curr_prod_line._id + "" &&
                    db_sku.comment == obj["Comment"]) {
                        skus_to_ignore.add(obj["SKU#"])
                    }
                    // If its an ambiguous collision, indicate to the user
                    else if(db_skus.get(Number(obj["SKU#"])) != obj["Case UPC"] && db_caseUPCs.has(Number(obj["Case UPC"]))) {
                        return res.json({ success: false, collision: i});
                    }
                    // Otherwise indicate that this record will be added and use the *_to_add* to check for duplicates in the same CSV
                    else {
                        skus_to_update.add(obj["SKU#"]);
                        skus_to_add.add(obj["SKU#"]);
                        skus_to_add_names.add(obj.Name);
                    }
                }
                else{
                    skus_to_add.add(obj["SKU#"]);
                    skus_to_add_names.add(obj["Name"]);
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
            var skus_to_ignore_arr = []
            for(var i =0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(skus_to_update.has(obj["SKU#"])){
                    updated = updated + 1;
                    var old_sku = await SKU.find({ num: Number(obj["SKU#"])});
                    obj.name = obj.Name;
                    obj.num = Number(obj["SKU#"]);
                    obj.case_upc = obj["Case UPC"];
                    obj.unit_upc = obj["Unit UPC"];
                    obj.unit_size = obj["Unit size"];
                    obj.cpc = obj["Count per case"];
                    let prod_line = await Prod_Line.find({ name : obj["Product Line Name"]});
                    obj.prod_line = prod_line[0]._id;
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
                else if(skus_to_add.has(obj["SKU#"])){
                    added = added + 1;
                    var sku = new SKU();
                    sku.name = obj.Name;
                    sku.num = Number(obj["SKU#"]);
                    sku.case_upc = Number(obj["Case UPC"]);
                    sku.unit_upc = Number(obj["Unit UPC"]);
                    sku.unit_size = obj["Unit size"];
                    let prod_line = await Prod_Line.find({ name : obj["Product Line Name"]});
                    sku.prod_line = prod_line[0]._id;
                    sku.cpc = Number(obj["Count per case"]);
                    sku.comment = obj["Comment"];
                    intermediate_skus_added.push(sku);
                    //let new_sku = await sku.save();
                    //skus_added.push(new_sku);
                }
                else {
                    obj.name = obj.Name;
                    obj.num = Number(obj["SKU#"]);
                    obj.case_upc = obj["Case UPC"];
                    obj.unit_upc = obj["Unit UPC"];
                    obj.unit_size = obj["Unit size"];
                    obj.cpc = obj["Count per case"];
                    let prod_line = await Prod_Line.find({ name : obj["Product Line Name"]});
                    obj.prod_line = prod_line[0]._id;
                    obj.comment = obj["Comment"];
                    delete obj["Name"];
                    delete obj["SKU#"];
                    delete obj["Case UPC"];
                    delete obj["Unit UPC"];
                    delete obj["Unit size"];
                    delete obj["Count per case"];
                    delete obj["Product Line Name"];
                    delete obj["Comment"];
                    skus_to_ignore_arr.push(obj);
                    ignored = ignored + 1;;
                }
            }  

            if(updated == 0) {
                for(var i = 0; i < intermediate_skus_added.length; i++){
                    let new_sku = await intermediate_skus_added[i].save();
                    skus_added.push(new_sku);
                    console.log(new_sku);
                }
                return res.json({ success: true, added: added, ignored: ignored, updated: updated, data: skus_added, showImport: true, new_data: skus_to_update_new, ignored_data: skus_to_ignore_arr});
            } else{
                return res.json({ success: true, added: added, ignored: ignored, updated: updated, data: intermediate_skus_added, old_data: skus_to_update_old, new_data: skus_to_update_new, ignored_data: skus_to_ignore_arr});
            }
      //  }
      /*
        catch (err) {
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, error: 'Catch all error'});
        }*/
    }

   /* static async compareSKUs(db_sku, obj){
        return (db_sku.name == obj["Name"] &&
                db_sku.num == obj["SKU#"] &&
                db_sku.case_upc == obj["Case UPC"] &&
                db_sku.unit_upc == obj["Unit UPC"] &&
                db_sku.unit_size == obj["Unit size"] &&
                db_sku.cpc == obj["Count per case"] &&
                db_sku.prod_line == obj["Product Line Name"] &&
                db_sku.comment == obj["Comment"]);
    }

    static async isAmbiguousCollisionSKUs(sku_to_add, db_sku_num_caseUPC, db_sku_caseUPC){
        var sku_to_add_num = sku_to_add["SKU#"];
        var sku_to_add_caseUPC = sku_to_add["Case UPC"];
        if(db_sku_num_caseUPC.get(sku_to_add_num) != sku_to_add_caseUPC && db_sku_caseUPC.has(sku_to_add_caseUPC)) {
            return true;
        }
        return false;
    }*/

    static async parseUpdateSKU(req, res){
        var updateArray = JSON.parse(req.body.updates);
        var addArray = JSON.parse(req.body.adds);
        var ignoreArray = JSON.parse(req.body.ignores);
        var returningUpdate = [];
        var returningAdd = [];
        for(var i = 0; i < updateArray.length; i++){
            let updated_sku = await SKU.findOneAndUpdate({ num : Number(updateArray[i].num)},
                {$set: {name : updateArray[i].name, case_upc : updateArray[i].case_upc, unit_upc : updateArray[i].unit_upc,
                        unit_size : updateArray[i].unit_size, cpc: updateArray[i].cpc, prod_line: updateArray[i].prod_line,
                        comment : updateArray[i].comment}}, {upsert : true, new : true});
                        returningUpdate.push(updated_sku);
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
            returningAdd.push(new_sku);
        }
        return res.json({ success: true, adds: returningAdd, updates: returningUpdate, ignores: ignoreArray});
    }

    static async parseIngredientsCSV(req, res){
    //    try {
            //Extract the primary key (num) & unique identifier(case_upc) for each entry
            var db_ingredients_nums = new Map();
            var db_ingredients_name = new Set();
            var all_ingredients = await Ingredient.find();
            all_ingredients.forEach(function (ingredient){
                db_ingredients_nums.set(ingredient.num, ingredient.name);
                db_ingredients_name.add(ingredient.name);
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
                else if(count == 1 && key != "Name") return res.json({ success: false, header: 2, actual: key, expected: "Name"});
                else if(count == 2 && key != "Vendor Info") return res.json({ success: false, header: 3, actual: key, expected: "Vendor Info"});
                else if(count == 3 && key != "Size") return res.json({ succes: false, header: 4, actual: key, expected: "Size"});
                else if(count == 4 && key != "Cost") return res.json({ success: false, header: 5, actual: key, expected: "Cost"});
                else if(count == 5 && key != "Comment") return res.json({ success: false, header: 6, actual: key, expected: "Comment"});
                count++;
            }
            if(count != 6) return res.json({ success: false, requiredFields: 6, numFields: (count-1)});

            // For each entry, check if there is a collision with whats in the database
            // If there isn't any, indicate that we need to add this entry
            var ingrs_to_add_nums = new Set();
            var ingrs_to_add_names = new Set();
            var ingrs_to_update = new Set();
            var ingrs_to_ignore = new Set();
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];

                // TODO: autogenerate any fields that are "" if autogenerable

                if(!obj["Name"] || !obj["Size"] || !obj["Cost"]) return res.json({ success: false, incompleteEntry: i});
                if(obj["Ingr#"] == "\"\"" || !obj["Ingr#"]) obj["Ingr#"] = ItemStore.getUniqueNumber(all_ingredients);

                var isNum = /^\d+$/.test(obj["Ingr#"]);
                if(!isNum) return res.json({ success: false, badData: i});

                var isValid = obj["Cost"].search(/^\$?\d+(,\d{3})*(\.\d*)?$/) >= 0;
                if(!isValid) return res.json({ success: false, badData: i});

                // Check for a duplicate in the same CSV file
                if(ingrs_to_add_nums.has(Number(obj["Ingr#"])) || ingrs_to_add_names.has(obj["Name"])) {
                    return res.json({ success: false, duplicate: i});
                } // If a unique identifier of the object is in the db but the primary key is not, return an error
                else if(db_ingredients_name.has(obj["Name"]) && !db_ingredients_nums.has(Number(obj["Ingr#"]))){
                    return res.json({ success: false, collision: i});
                // Check for a collision based on the primary key
                } else if(db_ingredients_nums.has(Number(obj["Ingr#"]))) {
                    var db_ingredient_list = await Ingredient.find({ num : obj["Ingr#"]});
                    var db_ingredient = db_ingredient_list[0];
                    // If it is a duplicate from something in the database, ignore it
                    if(db_ingredient.name == obj["Name"] && 
                        db_ingredient.num == obj["Ingr#"] &&
                        db_ingredient.vendor_info == obj["Vendor Info"] &&
                        db_ingredient.pkg_size == obj["Size"] &&
                        db_ingredient.pkg_cost == obj["Cost"] &&
                        db_ingredient.comment == obj["Comment"]){
                        ingrs_to_ignore.add(obj["Ingr#"]);
                    } // If it is an ambiguous collision with something in the database, return an error
                    else if(db_ingredients_nums.get(Number(obj["Ingr#"])) != obj["Name"] && db_ingredients_name.has(obj["Name"])) {
                        return res.json({ success: false, collision: i})
                    } // If it is neither, indicate that it will be updated, its added to *_to_add_* to indicate it exists in the file
                    else {
                        ingrs_to_update.add(obj["Ingr#"]);
                        ingrs_to_add_nums.add(obj["Ingr#"]);
                        ingrs_to_add_names.add(obj["Name"]);
                    }
                // If it wasn't a collision or duplicate, then just add it straight to the database
                } else {
                    ingrs_to_add_nums.add(obj["Ingr#"]);
                    ingrs_to_add_names.add(obj["Name"]);
                }
            }

            var added = 0;
            var ignored = 0;
            var updated = 0;
            var ingrs_added = [];
            var intermediate_ingrs_added = [];
            var ingrs_to_update_new = [];
            var ingrs_to_update_old = [];
            var ingrs_to_ignore_arr = [];
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                if(ingrs_to_update.has(obj["Ingr#"])) {
                    updated = updated + 1;
                    var old_ingr = await Ingredient.find({ num: Number(obj["Ingr#"])});
                    obj.name = obj.Name;
                    obj.num = Number(obj["Ingr#"]);
                    obj.vendor_info = obj["Vendor Info"];
                    obj.pkg_size = obj["Size"];
                    obj.pkg_cost = Number(obj["Cost"]);
                    obj.comment = obj["Comment"];
                    delete obj["Name"];
                    delete obj["Ingr#"];
                    delete obj["Vendor Info"];
                    delete obj["Size"];
                    delete obj["Cost"];
                    delete obj["Comment"];
                    ingrs_to_update_new.push(obj);
                    ingrs_to_update_old.push(old_ingr[0]);
                }
                else if(ingrs_to_add_nums.has(obj["Ingr#"])){
                    added = added + 1;
                    var ingredient = new Ingredient();
                    ingredient.name = obj.Name;
                    ingredient.num = Number(obj["Ingr#"]);
                    ingredient.vendor_info = obj["Vendor Info"];
                    ingredient.pkg_size = obj["Size"]
                    ingredient.pkg_cost = Number(obj["Cost"]);
                    ingredient.comment = obj["Comment"];
                    intermediate_ingrs_added.push(ingredient);
                } else {
                    obj.name = obj.Name;
                    obj.num = Number(obj["Ingr#"]);
                    obj.vendor_info = obj["Vendor Info"];
                    obj.pkg_size = obj["Size"];
                    obj.pkg_cost = Number(obj["Cost"]);
                    obj.comment = obj["Comment"];
                    delete obj["Name"];
                    delete obj["Ingr#"];
                    delete obj["Vendor Info"];
                    delete obj["Size"];
                    delete obj["Cost"];
                    delete obj["Comment"];
                    ingrs_to_ignore_arr.push(obj);
                    ignored = ignored+1;
                }
            }

            if(updated == 0){
                for(var i = 0; i < intermediate_ingrs_added.length; i++){
                    let new_ingr = await intermediate_ingrs_added[i].save();
                    ingrs_added.push(new_ingr);
                }
                return res.json({ success: true, added: added, ignored: ignored, 
                                    updated: updated, data: ingrs_added, 
                                    showImport: true, new_data: ingrs_to_update_new, 
                                    ignored_data: ingrs_to_ignore_arr});
            }
            else {
                return res.json({ success: true, added: added, ignored: ignored, 
                    data: intermediate_ingrs_added, old_data: ingrs_to_update_old,
                    new_data: ingrs_to_update_new, ignored_data: ingrs_to_ignore_arr});
            }
     //   }
   /*     catch (err) {
            fs.unlinkSync(req.file.path);
            return res.json({ success: false, error : err});
        }*/
    }
/*
    static async compareIngredients(db_ingredient, obj){
        return(db_ingredient.name == obj["Name"] && 
               db_ingredient.num == obj["Ingr#"] &&
               db_ingredient.vendor_info == obj["Vendor Info"] &&
               db_ingredient.pkg_size == obj["Size"] &&
               db_ingredient.pkg_cost == obj["Cost"] &&
               db_ingredient.comment == obj["Comment"]);
    }

    static async isAmbiguousCollisionIngrs(ingredient_to_add, db_ingredient_num_name, db_ingredients_name){
        var ingr_to_add_num = ingredient_to_add["Ingr#"];
        var ingr_to_add_name = ingredient_to_add["Name"];
        if(db_ingredient_num_name.get(ingr_to_add_num) != ingr_to_add_name && db_ingredients_name.has(ingr_to_add_name)){
            return true;
        }
        return false;
    }*/

    static async parseUpdateIngredients(req, res){
        var returningAdds = [];
        var returningUpdates = [];
        console.log(req.body);
        var ignoreArray = JSON.parse(req.body.ignores);
        var updateArray = JSON.parse(req.body.updates);
        var addArray = JSON.parse(req.body.adds);
        for(var i = 0; i < updateArray.length; i++){
            let updated_ingr = await Ingredient.findOneAndUpdate({ num: Number(updateArray[i].num)},
                {$set: {name: updateArray[i].name, vendor_info : updateArray[i].vendor_info, pkg_size: updateArray[i].pkg_size, 
                        pkg_cost: updateArray[i].pkg_cost, comment: updateArray[i].comment}}, 
                        {upsert : true, new : true});
            console.log(updated_ingr);
            returningUpdates.push(updated_ingr);
        }
        for(var i = 0; i < addArray.length; i++){
            var ingr = new Ingredient();
            ingr.name = addArray[i].name;
            ingr.num = Number(addArray[i].num);
            ingr.vendor_info = addArray[i].vendor_info;
            ingr.pkg_size = addArray[i].pkg_size;
            ingr.pkg_cost = Number(addArray[i].pkg_cost);
            ingr.comment = addArray[i].comment;
            let new_ingr = await ingr.save();
            returningAdds.push(new_ingr);
        }
        return res.json({ success: true, adds: returningAdds,
                        updates: returningUpdates, ignores: ignoreArray});
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

        const jsonArray = await csv().fromFile(req.file.path);
        fs.unlinkSync(req.file.path);

        if(jsonArray.length == 0){
            return res.json({ success: false, empty: true});
        }

        var count = 0;
        for(var key in jsonArray[0]){
            if(count==0 && key != "SKU#") return res.json({ success: false, header: 1, expected:"SKU#", actual: key})
            else if(count == 1 && key != "Ingr#") return res.json({ success: false, header: 2, expected:"Ingr#", actual: key});
            else if(count == 2 && key != "Quantity") return res.json({ success: false, header: 3, expected: "Quantity", actual: key})
            count++;
        }
        if(count != 3) return res.json({ success: false, requiredFields: 3, numFields: (count-1)});

        var sku_to_ingrs = new Map();
        var ingrs_to_count = new Map();
        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];
            if(!db_skus_nums.has(Number(obj["SKU#"]))){
                return res.json({ success: false, sku_dependency: i});
            }
            else if(!db_ingredients_nums.has(Number(obj["Ingr#"]))){
                return res.json({ success: false, ingr_dependency: i})
            }
            else {
                if(sku_to_ingrs.has(obj["SKU#"])){
                    var arrayToAdd = sku_to_ingrs.get(obj["SKU#"]);
                    arrayToAdd.push( {ingr: obj["Ingr#"], quantity: obj["Quantity"]} );
                    sku_to_ingrs.set(obj["SKU#"], arrayToAdd);
                    console.log('gets here second time')
                } else {
                    var arrayToAdd = [];
                    arrayToAdd.push( {ingr: obj["Ingr#"], quantity: obj["Quantity"]} );
                    sku_to_ingrs.set(obj["SKU#"], arrayToAdd);
                    console.log('gets here once');
                }
            }

            if(ingrs_to_count.has(obj["Ingr#"])){
                var currCount = ingrs_to_count.get(obj["Ingr#"]);
                currCount = currCount + 1;
                ingrs_to_count.set(obj["Ingr#"], currCount)
            } else {
                ingrs_to_count.set(obj["Ingr#"], 1);
            }
        }

        var updated_skus = [];
        for(var sku of sku_to_ingrs.keys()) {
            var sku_to_update = await SKU.find({ num : Number(sku)});
            sku_to_update.ingredients = [];
            sku_to_update.ingredient_quantities =[];
            var tuples = sku_to_ingrs.get(sku);
            console.log(tuples);
            var ingr_arr = [];
            var quantity_arr = [];
            for(var i = 0; i < tuples.length; i++){
                var tuple = tuples[i];
                var ingr = tuple.ingr;
                var ingr_to_point_at = await Ingredient.find({ num : Number(ingr)});
                var quantity = tuple.quantity;
                ingr_arr.push(ingr_to_point_at[0]._id);
                quantity_arr.push(Number(quantity));
            }
        //    sku_to_update.ingredients = 
       //     sku_to_update.ingredient_quantities = quantity_arr;
            let updated_sku = await SKU.findOneAndUpdate({ num : Number(sku)},
            {$set: {ingredients: ingr_arr, ingredient_quantities: quantity_arr}}, 
                {upsert : true, new : true});
            updated_skus.push(updated_sku);
        }

        var updated_ingrs = [];
        for(var ingredient of ingrs_to_count.keys()){
            let updated_ingredient = await Ingredient.findOneAndUpdate({ num : Number(ingredient)},
            {$set: {sku_count: ingrs_to_count.get(ingredient)}},
                {upsert: true, new: true});
            updated_ingrs.push(updated_ingredient);
        }

        return res.json({ success: true, sku_data: updated_skus, showImport: true});
    }


}
