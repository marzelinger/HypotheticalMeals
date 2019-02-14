import Prod_Line from './models/databases/prod_line';
import SKU from './models/databases/sku';
import Ingredient from './models/databases/ingredient';
import ItemStore from './../client/src/helpers/ItemStore';

const csv = require('csvtojson');
const fs = require('fs');
const checkdigit = require('checkdigit');


export default class CSV_parser{

    static async parseProdLineCSV (req, res){
      //  try{
            // Extracts all prod lines from database
            var db_prod_lines = new Set();
            let all_prod_lines = await Prod_Line.find()
            all_prod_lines.forEach(function (prod_line){
                db_prod_lines.add(prod_line.name);
            });

            // Converts the CSV input to JSON and checks to see at least one entry exists
            var prod_lines_to_add = new Set();
            const jsonArray = await csv().fromFile(req.file.path);
            fs.unlinkSync(req.file.path);
            if(jsonArray.length == 0){
                return res.json({ success: false, empty: true});
            }
            
            // Checks to see if the CSV column names are specified correctly
            var requiredNumFields = 1;
            var columnsObj = await this.checkColumns(jsonArray[0], ["Name"], requiredNumFields);
            if(columnsObj.success == false){
                return await this.indicateColumnFailure(res, columnsObj, requiredNumFields);
            }

            // For each CSV to potentially add, check if it would cause a collision
            // If it doesn't, add it to a set indicating it will be added
            var added = 0;
            var ignored = 0;
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
    }

    static async checkColumns(obj, correctColumnNames, correctColumnNum){
        var toReturn = {};
        var count = 0;
        console.log(obj);
        for(var key in obj){
            console.log(key);
            console.log(count);
            if(count >= correctColumnNum){
                toReturn.success = false;
                toReturn.colCountIncorrect = true;
                return toReturn;
            }
            else if(key != correctColumnNames[count]){
                toReturn.success = false;
                toReturn.colHeadersIncorrect = true;
                toReturn.colIssue = count;
                toReturn.actual = key;
                toReturn.expected = correctColumnNames[count];
                return toReturn;
            }
            count++;
        }
        console.log(count);
        console.log(correctColumnNum);
        if(count != correctColumnNum){
            console.log('gest here');
            toReturn.success = false;
            toReturn.colCountIncorrect = true;
            return toReturn;
        }
        toReturn.success = true;
        return toReturn;
    }

    static async indicateColumnFailure(res, columnsObj, requiredNumFields){
        if(columnsObj.colCountIncorrect == true) {
            return res.json({ success: false, 
                              incorrectNumHeaders: true,
                              requiredFields: requiredNumFields})
        }
        else if(columnsObj.colHeadersIncorrect == true){
            return res.json({ success: false,
                              incorrectHeaders: true, 
                              header: columnsObj.colIssue+1, 
                              actual:  columnsObj.actual,
                              expected: columnsObj.expected});
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

            var requiredNumFields = 8;
            var columnsObj = await this.checkColumns(jsonArray[0], ["SKU#", "Name", "Case UPC", "Unit UPC", "Unit size", "Count per case", "Product Line Name", "Comment"], requiredNumFields);
            if(columnsObj.success == false){
                return this.indicateColumnFailure(res, columnsObj, requiredNumFields);
            }

            // Iterates over each SKU to add and checks if any collisions are present
            // and if all the product lines actually exist
            var skus_to_add_num = new Set();
            var skus_to_add_caseUPC = new Set();
            var skus_to_update = new Set();
            var skus_to_ignore = new Set();
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                //Validate required fields

                var dataValidationObj = await this.validateDataSKUs(obj);
                if(dataValidationObj.success == false){
                    return await this.indicateSKUDataFailure(res, dataValidationObj, i+2);
                }
                
                var collisionObj = await this.searchForSKUCollision(obj, db_prod_lines, skus_to_add_num, skus_to_add_caseUPC, db_skus, db_caseUPCs, skus_to_update, skus_to_ignore)
                if(collisionObj.success == false){
                    return await this.indicateSKUCollisionFailure(res, collisionObj, i+2);
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
                    var old_sku = await SKU.find({ num: obj["SKU#"]});
                    var reformattedSKUS = reformatSKU(obj, obj);
                    skus_to_update_new.push(reformattedSKUS[0]);
                    skus_to_update_old.push(old_sku[0]);
                }
                else if(skus_to_add_num.has(obj["SKU#"])){
                    added = added + 1;
                    var sku = new SKU();
                    var reformattedSKUS = reformatSKU(sku, obj);
                    intermediate_skus_added.push(reformattedSKUS[0]);
                }
                else {
                    ignored = ignored + 1;
                    var reformattedSKUS = reformatSKU(obj, obj);
                    skus_to_ignore_arr.push(reformattedSKUS[0]);
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

    static async indicateSKUDataFailure(res, dataValidationObj, row){
        if(dataValidationObj.missingRequiredField){
            console.log('1');
            return res.json({ success: false,
                              badData: row});
        } else if(dataValidationObj.nameIssue){
            console.log('2');
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.skuNumIssue){
            console.log('3');
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.caseUPCIssue){
            console.log('4');
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.unitUPCIssue){
            console.log('5');
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.cpcIssue){
            console.log('6');
            return res.json({ success: false,
                badData: row});
        }
    }

    static async validateDataSKUs(obj) {
        var toReturn = {};
        // Checks to make sure we have all required fields
        if(!obj["Name"] || !obj["Case UPC"] || !obj["Unit UPC"] ||
        !obj["Unit size"] || !obj["Count per case"] || !obj["Product Line Name"]) {
            toReturn.success = false;
            toReturn.missingRequiredField = true;
            return toReturn;
        }

        // Auto generates SKU# if left blank
        if(obj["SKU#"] == "\"\"" || !obj["SKU#"]) obj["SKU#"] = ItemStore.getUniqueNumber(all_skus);
        if(obj["Name"].length < 1 || obj["Name"].length > 32) {
            toReturn.success = false;
            toReturn.nameIssue = true;
            return toReturn;
        }
        var isNum1 = /^\d+$/.test(obj["SKU#"]);
        if(!isNum1) {
            toReturn.success = false;
            toReturn.skuNumIssue = true;
            return toReturn;
        }
        var isCheckSumCase = checkdigit.mod10.isValid('036000241457');
        console.log(isCheckSumCase);
        console.log(obj["Case UPC"]);
        var isNum3 = /^\d+$/.test(obj["Case UPC"]);
        var firstCharCase = obj["Case UPC"].substring(0,1);
        if((obj["Case UPC"].length != 12) ||
           (!isNum3) ||
           (!isCheckSumCase) ||
           (firstCharCase != '0' && firstCharCase != '1' && firstCharCase !='6' && firstCharCase != '7' && firstCharCase !='8' && firstCharCase != '9')) {
            toReturn.success = false;
            toReturn.caseUPCIssue = true;
            return toReturn;
        }
        var isCheckSumUnit = checkdigit.mod10.isValid(obj["Unit UPC"]);
        var isNum2 = /^\d+$/.test(obj["Unit UPC"]);
        var firstCharUnit = obj["Unit UPC"].substring(0,1);
        if((obj["Unit UPC"].length != 12) || 
           (!isNum2) || 
           (!isCheckSumUnit) ||
           (firstCharUnit != '0' && firstCharUnit != '1' && firstCharUnit !='6' && firstCharUnit != '7' && firstCharUnit !='8' && firstCharUnit != '9')){
            toReturn.success = false;
            toReturn.unitUPCIssue = true;
            return toReturn;
        }
        var isNum4 =  /^\d+$/.test(obj["Count per case"]);
        if(!isNum4){
            toReturn.success = false;
            toReturn.cpcIssue = true;
            return toReturn;
        }
        toReturn.success = true;
        return toReturn;
    }

    static async searchForSKUCollision(obj, db_prod_lines, skus_to_add_num, skus_to_add_caseUPC, db_skus, db_caseUPCs, skus_to_update, skus_to_ignore) {
        var toReturn = {};
        // If the specified product line doesn't exist, indicate to the user
        if(!db_prod_lines.has(obj["Product Line Name"])) {
            toReturn.success = false;
            toReturn.prod_line_error = true;
            toReturn.prod_line_name = obj["Product Line Name"];
            return toReturn;
        } 
        // Check for a duplicate in the same CSV file
        if(skus_to_add_num.has(obj["SKU#"]) || skus_to_add_caseUPC.has(obj["Case UPC"])){
            toReturn.success = false;
            toReturn.duplicate = true;
            return toReturn;
        }  
        // If a unique identifier of the object is in the db but the primary key is not, return an error
        if( db_caseUPCs.has(obj["Case UPC"]) && !db_skus.has(obj["SKU#"]) ){
            toReturn.success = false;
            toReturn.ambiguousCollision = true;
            return toReturn;
        } 
        // Checking for collisions with the primary key
        else if(db_skus.has(obj["SKU#"])){
            var db_sku_arr= await SKU.find({ num : obj["SKU#"] });
            var curr_prod_line_arr = await Prod_Line.find({ name: obj["Product Line Name"] });
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
            else if(db_skus.get(obj["SKU#"]) != obj["Case UPC"] && db_caseUPCs.has(obj["Case UPC"])) {
                toReturn.success = false;
                toReturn.ambiguousCollision = true;
                return toReturn;
            }
            // Otherwise indicate that this record will be added and use the *_to_add* to check for duplicates in the same CSV
            else {
                skus_to_update.add(obj["SKU#"]);
                skus_to_add_num.add(obj["SKU#"]);
                skus_to_add_caseUPC.add(obj.Name);
            }
        }
        else{
            skus_to_add_num.add(obj["SKU#"]);
            skus_to_add_caseUPC.add(obj["Name"]);
        }
        toReturn.success = true;
        return toReturn;
    }

    static async indicateSKUCollisionFailure(res, collisionObj, row){
        if(collisionObj.prod_line_error == true) return res.json({ success: false, row: row+1, prod_line_name: collisionObj.prod_line_name,});
        else if(collisionObj.duplicate == true) return res.json({ success: false, duplicate: row})
        else if(collisionObj.ambiguousCollision == true) return res.json({ success: false, collision: row})
    }

    static async reformatSKU(objNew, objOld){
        objNew.name = objOld.Name;
        objNew.num = objOld["SKU#"];
        objNew.case_upc = objOld["Case UPC"];
        objNew.unit_upc = objOld["Unit UPC"];
        objNew.unit_size = objOld["Unit size"];
        objNew.cpc = objOld["Count per case"];
        let prod_line = await Prod_Line.find({ name : objOld["Product Line Name"]});
        objNew.prod_line = prod_line[0]._id;
        objNew.comment = objOld["Comment"];
        delete objOld["Name"];
        delete objOld["SKU#"];
        delete objOld["Case UPC"];
        delete objOld["Unit UPC"];
        delete objOld["Unit size"];
        delete objOld["Count per case"];
        delete objOld["Product Line Name"];
        delete objOld["Comment"];
        var toReturn = [];
        toReturn[0] = objNew;
        toReturn[1] = objOld;
        return toReturn;
    }

    static async parseUpdateSKU(req, res){
        var updateArray = JSON.parse(req.body.updates);
        var addArray = JSON.parse(req.body.adds);
        var ignoreArray = JSON.parse(req.body.ignores);
        var returningUpdate = [];
        var returningAdd = [];
        for(var i = 0; i < updateArray.length; i++){
            let updated_sku = await SKU.findOneAndUpdate({ num : updateArray[i].num},
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
            
            var requiredNumFields = 6;
            var columnsObj = await this.checkColumns(jsonArray[0], ["Ingr#", "Name", "Vendor Info", "Size", "Cost", "Comment"], requiredNumFields);
            if(columnsObj.success == false){
                return await this.indicateColumnFailure(res, columnsObj, requiredNumFields);
            }

            // For each entry, check if there is a collision with whats in the database
            // If there isn't any, indicate that we need to add this entry
            var ingrs_to_add_nums = new Set();
            var ingrs_to_add_names = new Set();
            var ingrs_to_update = new Set();
            var ingrs_to_ignore = new Set();
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];

                var dataValidationObj = await this.validateDataIngredients(obj);
                if(dataValidationObj.success == false){
                    return await this.indicateIngrDataFailure(res, dataValidationObj, i+1);
                }

                var collisionObj = await this.searchForIngrCollision(obj, ingrs_to_add_nums, ingrs_to_add_names, db_ingredients_name, db_ingredients_nums, ingrs_to_update, ingrs_to_ignore);
                if(collisionObj.success == false){
                    return await this.indicateIngrCollisionFailure(res, collisionObj, i+1);
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
                    var old_ingr = await Ingredient.find({ num: obj["Ingr#"]});
                    var reformattedIngrs = reformatIngredient(obj, obj);
                    ingrs_to_update_new.push(reformattedIngrs[0]);
                    ingrs_to_update_old.push(old_ingr[0]);
                }
                else if(ingrs_to_add_nums.has(obj["Ingr#"])){
                    added = added + 1;
                    var ingredient = new Ingredient();
                    var reformattedIngrs = reformatIngredient(ingredient, obj);
                    intermediate_ingrs_added.push(reformattedIngrs[0]);
                } else {
                    var reformattedIngrs = reformatIngredient(obj, obj);
                    ingrs_to_ignore_arr.push(reformattedIngrs[0]);
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

    static async validateDataIngredients(obj){
        var toReturn = {};
        if(!obj["Name"] || !obj["Size"] || !obj["Cost"]) {
            toReturn.success = false;
            toReturn.missingRequiredField = true;
            return toReturn;
        }
        if(obj["Ingr#"] == "\"\"" || !obj["Ingr#"]) obj["Ingr#"] = ItemStore.getUniqueNumber(all_ingredients);
        var isNum = /^\d+$/.test(obj["Ingr#"]);
        if(!isNum) {
            toReturn.success = false;
            toReturn.ingrNumIssue = true;
            return toReturn;
        } 
        var isValid = obj["Cost"].search(/^\$?\d+(,\d{3})*(\.\d*)?$/) >= 0;
        if(!isValid) {
            toReturn.success = false;
            toReturn.costIssue = true;
            return toReturn;
        }
        toReturn.success = true;
        return toReturn;
    }

    static async indicateIngrDataFailure(res, dataValidationObj, row){
        if(dataValidationObj.missingRequiredField){
            return res.json({ success: false,
                              badData: row});
        } else if(dataValidationObj.ingrNumIssue){
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.costIssue){
            return res.json({ success: false,
                badData: row});
        }
    }

    static async searchForIngrCollision(obj, ingrs_to_add_nums, ingrs_to_add_names, db_ingredients_name, db_ingredients_nums, ingrs_to_update, ingrs_to_ignore){
        var toReturn = {};
        // Check for a duplicate in the same CSV file
        if(ingrs_to_add_nums.has(obj["Ingr#"]) || ingrs_to_add_names.has(obj["Name"])) {
            toReturn.success = false;
            toReturn.duplicate = true;
            return toReturn;
        } // If a unique identifier of the object is in the db but the primary key is not, return an error
        else if(db_ingredients_name.has(obj["Name"]) && !db_ingredients_nums.has(obj["Ingr#"])){
            toReturn.ambiguousCollision = true;
            toReturn.success = false;
            return toReturn;
        // Check for a collision based on the primary key
        } else if(db_ingredients_nums.has(obj["Ingr#"])) {
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
            else if(db_ingredients_nums.get(obj["Ingr#"]) != obj["Name"] && db_ingredients_name.has(obj["Name"])) {
                toReturn.ambiguousCollision = true;
                toReturn.success = false;
                return toReturn;
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
        toReturn.success = true;
        return toReturn;
    }

    static async indicateIngrCollisionFailure(res, collisionObj, row){
        if(collisionObj.duplicate == true) return res.json({ success: false, duplicate: i});
        if(collisionObj.ambiguousCollision == true) return res.json({ success: false, collision: row});
    }

    static async reformatIngredient(objNew, objOld){
        objNew.name = objOld.Name;
        objNew.num = objOld["Ingr#"];
        objNew.vendor_info = objOld["Vendor Info"];
        objNew.pkg_size = objOld["Size"];
        objNew.pkg_cost = objOld["Cost"];
        objNew.comment = objOld["Comment"];
        delete objOld["Name"];
        delete objOld["Ingr#"];
        delete objOld["Vendor Info"];
        delete objOld["Size"];
        delete objOld["Cost"];
        delete objOld["Comment"];
        var toReturn = [];
        toReturn[0] = objNew;
        toReturn[1] = objOld;
        return toReturn;
    }


    static async parseUpdateIngredients(req, res){
        var returningAdds = [];
        var returningUpdates = [];
        console.log(req.body);
        var ignoreArray = JSON.parse(req.body.ignores);
        var updateArray = JSON.parse(req.body.updates);
        var addArray = JSON.parse(req.body.adds);
        for(var i = 0; i < updateArray.length; i++){
            let updated_ingr = await Ingredient.findOneAndUpdate({ num: updateArray[i].num},
                {$set: {name: updateArray[i].name, vendor_info : updateArray[i].vendor_info, pkg_size: updateArray[i].pkg_size, 
                        pkg_cost: updateArray[i].pkg_cost, comment: updateArray[i].comment}}, 
                        {upsert : true, new : true});
            console.log(updated_ingr);
            returningUpdates.push(updated_ingr);
        }
        for(var i = 0; i < addArray.length; i++){
            var ingr = new Ingredient();
            ingr.name = addArray[i].name;
            ingr.num = addArray[i].num;
            ingr.vendor_info = addArray[i].vendor_info;
            ingr.pkg_size = addArray[i].pkg_size;
            ingr.pkg_cost = addArray[i].pkg_cost;
            ingr.comment = addArray[i].comment;
            let new_ingr = await ingr.save();
            returningAdds.push(new_ingr);
        }
        return res.json({ success: true, adds: returningAdds,
                        updates: returningUpdates, ignores: ignoreArray});
    }

  /*  static async parseFormulasCSV(req, res){
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
    } */


}