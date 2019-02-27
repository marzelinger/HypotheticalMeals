import Prod_Line from './models/databases/prod_line';
import SKU from './models/databases/sku';
import Formula from './models/databases/formula';
import Ingredient from './models/databases/ingredient';
import Manu_Line from './models/databases/manu_line';
import ItemStore from './../client/src/helpers/ItemStore';
import * as Constants from './../client/src/resources/Constants';
import CheckDigit from "./../client/src/helpers/CheckDigit";
import UnitConversion from "./../client/src/helpers/UnitConversion";

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

            // Converts the CSV input to JSON and checks to see at least one entry exists
            var prod_lines_to_add = new Set();
            const jsonArray = await csv().fromFile(req.file.path);
            fs.unlinkSync(req.file.path);
            if(jsonArray.length == 0){
                return res.json({ success: false, empty: true});
            }
            
            // Checks to see if the CSV column names are specified correctly
            var requiredNumFields = 1;
            var columnsObj = await this.checkColumns(jsonArray[0], [Constants.csv_prod_lines], requiredNumFields);
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
                var obj_Name = obj[Constants.csv_prod_lines];
                if(prod_lines_to_add.has(obj_Name)){
                    var prod_line = new Prod_Line();
                    prod_line.name = obj_Name;
                    let new_prod_line = prod_line.save();
                    prod_lines_added.push(prod_line);
                } else {
                    obj.name = obj_Name;
                    delete obj[Constants.csv_prod_lines];
                    prod_lines_ignored.push(obj);
                }
            }
            return res.json({ success: true, added: added, ignored: ignored, 
                            data: prod_lines_added, showImport: true,
                            ignored_data: prod_lines_ignored});
        } catch(err){
            return res.json({ success: false, error: 'Catch all error'});
        }
    }

    static async checkColumns(obj, correctColumnNames, correctColumnNum){
        var toReturn = {};
        var count = 0; 
        console.log(obj);
        console.log(correctColumnNames.length);
        for(var key in obj){
            console.log(key);
            console.log(count);
            console.log(correctColumnNames[count]);
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
        try{ 
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

            var db_formulas = new Set();
            var all_formulas = await Formula.find();
            all_formulas.forEach(function (formula){
                db_formulas.add(formula.num);
            });

            var db_Manu_Line = new Set();
            var all_Manu_Line = await Manu_Line.find();
            all_Manu_Line.forEach(function (manu_line) {
                db_Manu_Line.add(manu_line.short_name);
            });

            // Imports CSV, converts to JSON and makes sure it isn't empty
            const jsonArray = await csv().fromFile(req.file.path);
            fs.unlinkSync(req.file.path);
            if(jsonArray.length == 0){
                return res.json({ success: false, empty: true});
            }

            var requiredNumFields = 12;
            var columnsObj = await this.checkColumns(jsonArray[0], 
                [Constants.csv_sku_num,
                    Constants.csv_sku_name,
                    Constants.csv_sku_caseUPC,
                    Constants.csv_sku_unitUPC,
                    Constants.csv_sku_unitsize,
                    Constants.csv_sku_cpc, 
                    Constants.csv_sku_pl,
                    Constants.csv_sku_formula,
                    Constants.csv_sku_formula_factor,
                    Constants.csv_sku_ml,
                    Constants.csv_sku_rate,
                    Constants.csv_sku_comment], requiredNumFields);
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

                var dataValidationObj = await this.validateDataSKUs(obj, all_skus);
                if(dataValidationObj.success == false){
                    console.log('fails here 1');
                    console.log(dataValidationObj);
                    return await this.indicateSKUDataFailure(res, dataValidationObj, i+2);
                }
                
                var collisionObj = await this.searchForSKUCollision(obj, db_prod_lines, skus_to_add_num, skus_to_add_caseUPC, db_skus, db_caseUPCs, skus_to_update, skus_to_ignore, db_formulas, db_Manu_Line)
                if(collisionObj.success == false){
                    console.log(collisionObj);
                    return await this.indicateSKUCollisionFailure(res, collisionObj, i+2);
                }
            }
            console.log('data validation and collision checkout out');
            // For each entry in the JSON, check if we indicated to add it
            // If we did add it and increment added counter, otherwise increment ignored counter
            var added = 0;
            var ignored = 0;
            var updated = 0;
            var skus_added = [];
            var intermediate_skus_added = []; 
            var intermediate_unformatted_skus_added = [];
            var skus_to_update_new = [];
            var skus_to_update_old = [];
            var skus_to_ignore_arr = []
            for(var i =0; i < jsonArray.length; i++){
                console.log(i);
                var obj = jsonArray[i];
                if(skus_to_update.has(obj[Constants.csv_sku_num])){
                    updated = updated + 1;
                    var old_sku = await SKU.find({ num: obj[Constants.csv_sku_num]});
                    var old_sku_to_show = {};
                    old_sku_to_show.name = old_sku[0].name;
                    old_sku_to_show.num = old_sku[0].num;
                    old_sku_to_show.case_upc = old_sku[0].case_upc;
                    old_sku_to_show.unit_upc = old_sku[0].unit_upc;
                    old_sku_to_show.cpc = old_sku[0].cpc;
                    
                    old_sku_to_show.prod_line = old_sku[0].prod_line;
                    var prod_line = await Prod_Line.find({ _id: old_sku[0].prod_line._id });
                    old_sku_to_show.prod_line_to_show = prod_line[0].name;

                    old_sku_to_show.formula = old_sku[0].formula;
                    old_sku_to_show.formula_to_show = 

                    old_sku_to_show.scale_factor = old_sku[0].scale_factor;

                    old_sku_to_show.manu_lines = old_sku[0].manu_lines;
                    var manu_lines_to_show_string = "";
                    for(var j = 0; j < old_sku[0].manu_lines.length; j++){
                        var manu_line = await Manu_Line.find({ _id: old_sku[0].manu_lines[j] });
                        manu_lines_to_show_string = manu_lines_to_show_string + manu_line.short_name + ",";
                    }
                    old_sku_to_show.manu_lines_to_show = manu_lines_to_show_string;

                    old_sku_to_show.manu_rate = old_sku[0].manu_rate;
                    old_sku_to_show.comment = old_sku[0].comment;

                    var newObj = {};
                    console.log('her23e');
                    var reformattedSKUS = await this.reformatSKU(newObj, obj);
                    skus_to_update_new.push(reformattedSKUS[0]);
                    skus_to_update_old.push(old_sku_to_show);

                }
                else if(skus_to_add_num.has(obj[Constants.csv_sku_num])){
                    added = added + 1;
                    var newObj = {};
                    console.log('break here2');
                    var reformattedSKUS = await this.reformatSKU(newObj, obj);
                    intermediate_skus_added.push(reformattedSKUS[0]);
                    intermediate_unformatted_skus_added.push(reformattedSKUS[1]);
                }
                else {
                    ignored = ignored + 1;
                    var newObj = {};
                    console.log('her23weee');
                    var reformattedSKUS = await this.reformatSKU(newObj, obj);
                    skus_to_ignore_arr.push(reformattedSKUS[0]);
                }
            }  

            if(updated == 0) {
                for(var i = 0; i < intermediate_unformatted_skus_added.length; i++){
                    var sku = new SKU();
                    var toShow = {};
                    console.log('break here');
                    var reformattedSKUS = await this.reformatSKU(toShow, intermediate_unformatted_skus_added[i]);
                    sku.name = reformattedSKUS[0].name;
                    sku.num = reformattedSKUS[0].num;
                    sku.case_upc = reformattedSKUS[0].case_upc;
                    sku.unit_upc = reformattedSKUS[0].unit_upc;
                    sku.unit_size = reformattedSKUS[0].unit_size;
                    sku.cpc = reformattedSKUS[0].cpc;
                    sku.prod_line = reformattedSKUS[0].prod_line;
                    sku.comment = reformattedSKUS[0].comment;
                    sku.formula = reformattedSKUS[0].formula;
                    sku.scale_factor = reformattedSKUS[0].scale_factor;
                    sku.manu_lines = reformattedSKUS[0].manu_lines;
                    sku.manu_rate = reformattedSKUS[0].manu_rate;
                    sku.comment = reformattedSKUS[0].comment;
                    console.log('gets here');

                    let new_sku = await sku.save();
                    skus_added.push(toShow);
                }
                return res.json({ success: true, added: added, ignored: ignored, updated: updated, data: skus_added, showImport: true, new_data: skus_to_update_new, ignored_data: skus_to_ignore_arr});
            } else{
                return res.json({ success: true, added: added, ignored: ignored, updated: updated, data: intermediate_skus_added, old_data: skus_to_update_old, new_data: skus_to_update_new, ignored_data: skus_to_ignore_arr});
            }
        } catch (err){
            return res.json({ success: false, error: "Catch all error"})
        }
    }

    static async indicateSKUDataFailure(res, dataValidationObj, row){
        if(dataValidationObj.missingRequiredField){
            return res.json({ success: false,
                              missingRequiredField: row});
        } else if(dataValidationObj.nameIssue){
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.skuNumIssue){
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.caseUPCIssue){
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.unitUPCIssue){
            return res.json({ success: false,
                badData: row});
        } else if(dataValidationObj.cpcIssue){
            return res.json({ success: false,
                badData: row});
        }
    }

    static async validateDataSKUs(obj, all_skus) {
        var toReturn = {};
        // Checks to make sure we have all required fields
        if(!obj[Constants.csv_sku_name] || !obj[Constants.csv_sku_caseUPC] || !obj[Constants.csv_sku_unitUPC] ||
        !obj[Constants.csv_sku_unitsize] || !obj[Constants.csv_sku_cpc] || !obj[Constants.csv_sku_pl]) {
            toReturn.success = false;
            toReturn.missingRequiredField = true;
            return toReturn;
        }

        // Auto generates SKU# if left blank
        if(obj[Constants.csv_sku_num] == "\"\"" || !obj[Constants.csv_sku_num]) obj[Constants.csv_sku_num] = ItemStore.getUniqueNumber(all_skus);
        if(obj[Constants.csv_sku_name].length < 1 || obj[Constants.csv_sku_name].length > 32) {
            toReturn.success = false;
            toReturn.nameIssue = true;
            return toReturn;
        }
        var isNum1 = /^\d+$/.test(obj[Constants.csv_sku_num]);
        if(!isNum1) {
            toReturn.success = false;
            toReturn.skuNumIssue = true;
            return toReturn;
        }

        var isNum3 = /^\d+$/.test(obj[Constants.csv_sku_caseUPC]);
        var firstCharCase = obj[Constants.csv_sku_caseUPC].substring(0,1);
        var isCheckSumCase = CheckDigit.isValid(obj[Constants.csv_sku_caseUPC]);
        if((obj[Constants.csv_sku_caseUPC].length != 12) ||
           (!isNum3) ||
           (!isCheckSumCase) ||
           (firstCharCase != '0' && firstCharCase != '1' && firstCharCase !='6' && firstCharCase != '7' && firstCharCase !='8' && firstCharCase != '9')) {
            toReturn.success = false;
            toReturn.caseUPCIssue = true;
            return toReturn;
        }

        var isCheckSumUnit = CheckDigit.isValid(obj[Constants.csv_sku_unitUPC]);
        var isNum2 = /^\d+$/.test(obj[Constants.csv_sku_unitUPC]);
        var firstCharUnit = obj[Constants.csv_sku_unitUPC].substring(0,1);
        if((obj[Constants.csv_sku_unitUPC].length != 12) || 
           (!isNum2) || 
           (!isCheckSumUnit) ||
           (firstCharUnit != '0' && firstCharUnit != '1' && firstCharUnit !='6' && firstCharUnit != '7' && firstCharUnit !='8' && firstCharUnit != '9')){
            toReturn.success = false;
            toReturn.unitUPCIssue = true;
            return toReturn;
        }
        var isNum4 =  /^\d+$/.test(obj[Constants.csv_sku_cpc]);
        if(!isNum4){
            toReturn.success = false;
            toReturn.cpcIssue = true;
            return toReturn;
        }

        toReturn.success = true;
        return toReturn;
    }

    static async searchForSKUCollision(obj, db_prod_lines, skus_to_add_num, skus_to_add_caseUPC, db_skus, db_caseUPCs, skus_to_update, skus_to_ignore, db_formulas, db_Manu_Line) {
        var toReturn = {};
        // If the specified product line doesn't exist, indicate to the user
        if(!db_prod_lines.has(obj[Constants.csv_sku_pl])) {
            toReturn.success = false;
            toReturn.prod_line_error = true;
            toReturn.prod_line_name = obj[Constants.csv_sku_pl];
            return toReturn;
        } 
        if(!db_formulas.has(obj[Constants.csv_sku_formula])) {
            toReturn.success = false;
            toReturn.formula_error = true;
            toReturn.formula_num = obj[Constants.csv_sku_formula];
            return toReturn;
        }

        var sku_MLs_string = obj[Constants.csv_sku_ml].substring(1, obj[Constants.csv_sku_ml].length - 1);
        console.log("string is : " + sku_MLs_string);
        var sku_MLs_arr = sku_MLs_string.split(",");
        for(var i = 0 ; i < sku_MLs_arr.length; i++){
            if(!db_Manu_Line.has(sku_MLs_arr[i])) {
                toReturn.success = false;
                toReturn.manu_line_error = true;
                toReturn.manu_line_name = sku_MLs_arr[i];
                return toReturn;
            }
        }

        
        // Check for a duplicate in the same CSV file
        if(skus_to_add_num.has(obj[Constants.csv_sku_num]) || skus_to_add_caseUPC.has(obj[Constants.csv_sku_caseUPC])){
            toReturn.success = false;
            toReturn.duplicate = true;
            return toReturn;
        }  
        // If a unique identifier of the object is in the db but the primary key is not, return an error
        if( db_caseUPCs.has(obj[Constants.csv_sku_caseUPC]) && !db_skus.has(obj[Constants.csv_sku_num]) ){
            toReturn.success = false;
            toReturn.ambiguousCollision = true;
            return toReturn;
        } 
        // Checking for collisions with the primary key
        else if(db_skus.has(obj[Constants.csv_sku_num])){
            var db_sku_arr= await SKU.find({ num : obj[Constants.csv_sku_num] });
            var curr_prod_line_arr = await Prod_Line.find({ name: obj[Constants.csv_sku_pl] });
            var curr_formula_arr = await Formula.find({ num : obj[Constants.csv_sku_formula] });
            var curr_formula = curr_formula_arr[0];
            var db_sku = db_sku_arr[0];
            var curr_prod_line = curr_prod_line_arr[0];

            var all_manu_lines = new Set();
            for(var i = 0; i < db_sku.manu_lines.length; i++){
                all_manu_lines.add(db_sku.manu_lines[i]);
            }
            if(db_sku.name == obj[Constants.csv_sku_name] &&
            db_sku.num == obj[Constants.csv_sku_num] &&
            db_sku.case_upc == obj[Constants.csv_sku_caseUPC] &&
            db_sku.unit_upc == obj[Constants.csv_sku_unitUPC] &&
            db_sku.unit_size == obj[Constants.csv_sku_unitsize] &&
            db_sku.cpc == obj[Constants.csv_sku_cpc] &&
            db_sku.prod_line._id + "" == curr_prod_line._id + "" &&
            db_sku.formula._id + "" == curr_formula._id + "" &&
            db_sku.comment == obj[Constants.csv_sku_comment] &&
            db_sku.scale_factor == obj[Constants.csv_sku_formula_factor] &&
            db_sku.manu_rate == obj[Constants.csv_sku_rate])
            {
                var good = true;
                var ML_array = obj[Constants.csv_sku_ml].substring(1, obj[Constants.csv_sku_ml].length - 2).split(',');
                console.log(ML_array);
                for(var i = 0; i < ML_array.length; i++){
                    if(!all_manu_lines.has(ML_array[i])){
                        good = false;
                        break;
                    }
                }
                if(good) skus_to_ignore.add(obj[Constants.csv_sku_num])
            }
            // If its an ambiguous collision, indicate to the user
            else if(db_skus.get(obj[Constants.csv_sku_num]) != obj[Constants.csv_sku_caseUPC] && db_caseUPCs.has(obj[Constants.csv_sku_caseUPC])) {
                toReturn.success = false;
                toReturn.ambiguousCollision = true;
                return toReturn;
            }
            // Otherwise indicate that this record will be added and use the *_to_add* to check for duplicates in the same CSV
            else {
                skus_to_update.add(obj[Constants.csv_sku_num]);
                skus_to_add_num.add(obj[Constants.csv_sku_num]);
                skus_to_add_caseUPC.add(obj.Name);
            }
        }
        else{
            skus_to_add_num.add(obj[Constants.csv_sku_num]);
            skus_to_add_caseUPC.add(obj[Constants.csv_sku_name]);
        }
        toReturn.success = true;
        return toReturn;
    }

    static async indicateSKUCollisionFailure(res, collisionObj, row){
        if(collisionObj.prod_line_error == true) return res.json({ success: false, row: row, prod_line_name: collisionObj.prod_line_name});
        else if(collisionObj.formula_error == true) return res.json({ success: false, row: row, sku_formula_num: collisionObj.formula_num});
        else if(collisionObj.duplicate == true) return res.json({ success: false, duplicate: row})
        else if(collisionObj.ambiguousCollision == true) return res.json({ success: false, collision: row})
        else if(collisionObj.manu_line_error == true) return res.json({ success: false, row: row, manu_line_name: collisionObj.manu_line_name});
    }

    static async reformatSKU(objNew, objOld){
        console.log("objOld is " + objOld);
        console.log("objNew is " + objNew);
        objNew.name = objOld.Name;
        objNew.num = objOld[Constants.csv_sku_num];
        objNew.case_upc = objOld[Constants.csv_sku_caseUPC];
        objNew.unit_upc = objOld[Constants.csv_sku_unitUPC];
        objNew.unit_size = objOld[Constants.csv_sku_unitsize];
        objNew.cpc = objOld[Constants.csv_sku_cpc];

        objNew.prod_line_to_show = objOld[Constants.csv_sku_pl];
        let prod_line = await Prod_Line.find({ name : objOld[Constants.csv_sku_pl]});
        objNew.prod_line = prod_line[0]._id;

        objNew.formula_to_show = objOld[Constants.csv_sku_formula];
        let formula = await Formula.find({ num : objOld[Constants.csv_sku_formula]});
        objNew.formula = formula[0]._id;

        objNew.scale_factor = objOld[Constants.csv_sku_formula_factor];
        
        var manu_lines_string = objOld[Constants.csv_sku_ml];
        manu_lines_string = manu_lines_string.substring(1, manu_lines_string.length - 1)
        var manu_lines_arr = manu_lines_string.split(",");

        var manu_lines_to_add = [];
        for(var i = 0; i < manu_lines_arr.length; i++){
            let manu_line = await Manu_Line.find({ short_name : manu_lines_arr[i] });
            manu_lines_to_add.push(manu_line[0]._id);
        }
        objNew.manu_lines_to_show = manu_lines_string;
        objNew.manu_lines = manu_lines_to_add;
        
        objNew.manu_rate = objOld[Constants.csv_sku_rate];
        objNew.comment = objOld[Constants.csv_sku_comment];
       /* 
        delete objOld[Constants.csv_sku_num];
        delete objOld[Constants.csv_sku_caseUPC];
        delete objOld[Constants.csv_sku_unitUPC];
        delete objOld[Constants.csv_sku_unitsize];
        delete objOld[Constants.csv_sku_cpc];
        delete objOld[Constants.csv_sku_pl];
        delete objOld["Comment"];*/
        var toReturn = [];
        toReturn[0] = objNew;
        toReturn[1] = objOld;
        return toReturn;
    }

    static async parseUpdateSKU(req, res){
        try{
        var updateArray = JSON.parse(req.body.updates);
        var addArray = JSON.parse(req.body.adds);
        var ignoreArray = JSON.parse(req.body.ignores);
        var returningUpdate = [];
        var returningAdd = [];
        for(var i = 0; i < updateArray.length; i++){
            let updated_sku = await SKU.findOneAndUpdate({ num : updateArray[i].num},
                {$set: {name : updateArray[i].name, case_upc : updateArray[i].case_upc, unit_upc : updateArray[i].unit_upc,
                        unit_size : updateArray[i].unit_size, cpc: updateArray[i].cpc, prod_line: updateArray[i].prod_line,
                        formula: updateArray[i].formula, scale_factor: updateArray[i].scale_factor,
                        manu_lines: updateArray[i].manu_lines, manu_rate: updateArray[i].manu_rate, comment : updateArray[i].comment}}, {upsert : true, new : true});
                        returningUpdate.push(updateArray[i]);
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
            sku.formula = addArray[i].formula;
            sku.scale_factor = addArray[i].scale_factor;
            sku.manu_lines = addArray[i].manu_lines;
            sku.manu_rate = addArray[i].manu_rate;
            sku.comment = addArray[i].comment;
            let new_sku = await sku.save();
            console.log("add array is: ");
            console.log(addArray[i]);
            returningAdd.push(addArray[i]);
        }
        return res.json({ success: true, adds: returningAdd, updates: returningUpdate, ignores: ignoreArray});
        } catch(err){
            return res.json({ success: false, error: "Catch all error"});
        }
    }

    static async parseIngredientsCSV(req, res){
        try {
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
            console.log("the constants file is getting : " + Constants.csv_ingr_cost)
            var columnsObj = await this.checkColumns(jsonArray[0], 
                [Constants.csv_ingr_num, 
                Constants.csv_ingr_name, 
                Constants.csv_ingr_vendor, 
                Constants.csv_ingr_size,
                Constants.csv_ingr_cost,
                Constants.csv_ingr_comment], requiredNumFields);
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

                var dataValidationObj = await this.validateDataIngredients(obj, all_ingredients);
                if(dataValidationObj.success == false){
                    return await this.indicateIngrDataFailure(res, dataValidationObj, i+2);
                }

                var collisionObj = await this.searchForIngrCollision(obj, ingrs_to_add_nums, ingrs_to_add_names, db_ingredients_name, db_ingredients_nums, ingrs_to_update, ingrs_to_ignore);
                if(collisionObj.success == false){
                    console.log(collisionObj);
                    return await this.indicateIngrCollisionFailure(res, collisionObj, i+2);
                }  
                console.log('data validation checks out');
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
                if(ingrs_to_update.has(obj[Constants.csv_ingr_num])) {
                    updated = updated + 1;
                    var old_ingr = await Ingredient.find({ num: obj[Constants.csv_ingr_num]});
                    var reformattedIngrs = await this.reformatIngredient(obj, obj);
                    ingrs_to_update_new.push(reformattedIngrs[0]);
                    ingrs_to_update_old.push(old_ingr[0]);
                }
                else if(ingrs_to_add_nums.has(obj[Constants.csv_ingr_num])){
                    added = added + 1;
                    var ingredient = new Ingredient();
                    var reformattedIngrs = await this.reformatIngredient(ingredient, obj);
                    intermediate_ingrs_added.push(reformattedIngrs[0]);
                } else {
                    var reformattedIngrs = await this.reformatIngredient(obj, obj);
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
        }
        catch (err) {
            return res.json({ success: false, error : "Catch all error"});
        }
    }

    static async validateDataIngredients(obj, all_ingredients){
        var toReturn = {};
        if(!obj[Constants.csv_ingr_name] || !obj[Constants.csv_ingr_size] || !obj[Constants.csv_ingr_cost]) {
            toReturn.success = false;
            toReturn.missingRequiredField = true;
            return toReturn;
        }
        if(obj[Constants.csv_ingr_num] == "\"\"" || !obj[Constants.csv_ingr_num]) obj[Constants.csv_ingr_num] = ItemStore.getUniqueNumber(all_ingredients);
        var isNum = /^\d+$/.test(obj[Constants.csv_ingr_num]);
        if(!isNum) {
            toReturn.success = false;
            toReturn.ingrNumIssue = true;
            return toReturn;
        } 
        var isValid = obj[Constants.csv_ingr_cost].search(/^\$?\d+(,\d{3})*(\.\d*)?$/) >= 0;
        if(!isValid) {
            toReturn.success = false;
            toReturn.costIssue = true;
            return toReturn;
        }
        obj[Constants.csv_ingr_size] = UnitConversion.getCleanUnitForm(obj[Constants.csv_ingr_size]).data;
        var isValid2 = await this.findUnit(obj[Constants.csv_ingr_size]);
        if(isValid2 == -1){
            // TODO: FIX THIS 
            toReturn.costIssue = true;
            return toReturn;
        }
        //var isValid2 = obj[Constants.csv_ingr_size]
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
        if(ingrs_to_add_nums.has(obj[Constants.csv_ingr_num]) || ingrs_to_add_names.has(obj[Constants.csv_ingr_name])) {
            toReturn.success = false;
            toReturn.duplicate = true;
            return toReturn;
        } // If a unique identifier of the object is in the db but the primary key is not, return an error
        else if(db_ingredients_name.has(obj[Constants.csv_ingr_name]) && !db_ingredients_nums.has(obj[Constants.csv_ingr_num])){
            toReturn.ambiguousCollision = true;
            toReturn.success = false;
            console.log(obj[Constants.csv_ingr_name]);
            console.log('1 collsion');
            return toReturn;
        // Check for a collision based on the primary key
        } else if(db_ingredients_nums.has(obj[Constants.csv_ingr_num])) {
            var db_ingredient_list = await Ingredient.find({ num : obj[Constants.csv_ingr_num]});
            var db_ingredient = db_ingredient_list[0];
            // If it is a duplicate from something in the database, ignore it
            if(db_ingredient.name == obj[Constants.csv_ingr_name] && 
                db_ingredient.num == obj[Constants.csv_ingr_num] &&
                db_ingredient.vendor_info == obj[Constants.csv_ingr_vendor] &&
                db_ingredient.pkg_size == obj[Constants.csv_ingr_size] &&
                db_ingredient.pkg_cost == obj[Constants.csv_ingr_cost] &&
                db_ingredient.comment == obj[Constants.csv_ingr_comment]){
                ingrs_to_ignore.add(obj[Constants.csv_ingr_num]);
            } // If it is an ambiguous collision with something in the database, return an error
            else if(db_ingredients_nums.get(obj[Constants.csv_ingr_num]) != obj[Constants.csv_ingr_name] && db_ingredients_name.has(obj[Constants.csv_ingr_name])) {
                toReturn.ambiguousCollision = true;
                toReturn.success = false;
                console.log('2 collsion');
                return toReturn;
            } // If it is neither, indicate that it will be updated, its added to *_to_add_* to indicate it exists in the file
            else {
                ingrs_to_update.add(obj[Constants.csv_ingr_num]);
                ingrs_to_add_nums.add(obj[Constants.csv_ingr_num]);
                ingrs_to_add_names.add(obj[Constants.csv_ingr_name]);
            }
        // If it wasn't a collision or duplicate, then just add it straight to the database
        } else {
            ingrs_to_add_nums.add(obj[Constants.csv_ingr_num]);
            ingrs_to_add_names.add(obj[Constants.csv_ingr_name]);
        }
        toReturn.success = true;
        return toReturn;
    }

    static async indicateIngrCollisionFailure(res, collisionObj, row){
        if(collisionObj.duplicate == true) return res.json({ success: false, duplicate: row});
        if(collisionObj.ambiguousCollision == true) return res.json({ success: false, collision: row});
    }

    static async reformatIngredient(objNew, objOld){
        objNew.name = objOld.Name;
        objNew.num = objOld[Constants.csv_ingr_num];
        objNew.vendor_info = objOld[Constants.csv_ingr_vendor];
        objNew.pkg_size = objOld[Constants.csv_ingr_size];
        objNew.pkg_cost = objOld[Constants.csv_ingr_cost];
        objNew.comment = objOld[Constants.csv_ingr_comment];
        delete objOld[Constants.csv_ingr_name];
        delete objOld[Constants.csv_ingr_num];
        delete objOld[Constants.csv_ingr_vendor];
        delete objOld[Constants.csv_ingr_size];
        delete objOld[Constants.csv_ingr_cost];
        delete objOld[Constants.csv_ingr_comment];
        var toReturn = [];
        toReturn[0] = objNew;
        toReturn[1] = objOld;
        return toReturn;
    }


    static async parseUpdateIngredients(req, res){
        try{
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
        } catch (err){
            return res.json({ success: false, error: "Catch all error"});
        }
    }

    static async parseFormulasCSV(req, res){
        try{
        var db_formula_nums = new Set();
        var db_ingredients_num = new Set();

        var all_ingredients = await Ingredient.find();
        var all_formulas = await Formula.find();

        all_formulas.forEach(function (formula){
            db_formula_nums.add(formula.num);
        });
        all_ingredients.forEach(function (ingredient){
            db_ingredients_num.add(ingredient.num);
        });

        const jsonArray = await csv().fromFile(req.file.path);
        fs.unlinkSync(req.file.path);
        if(jsonArray.length == 0){
            return res.json({ success: false, empty: true});
        }

        var requiredNumFields = 5;
        var columnsObj = await this.checkColumns(jsonArray[0], [Constants.csv_formula_num,
                                                                Constants.csv_formula_name,
                                                                Constants.csv_formula_ingr,
                                                                Constants.csv_formula_quantity,
                                                                Constants.csv_formula_comment], requiredNumFields);
        if(columnsObj.success == false){
            return this.indicateColumnFailure(res, columnsObj, requiredNumFields);
        }

        var formulas_to_add = new Map();
        var formulas_to_comments = new Map();
        var formulas_to_update = new Map();
        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];

            // Checks to see formula name is under 32 digits and the ingredient units are all correct
            var dataValidationObj = await this.validateDataFormulas(obj, all_formulas, db_ingredients_num);
            if(dataValidationObj.success == false){
                console.log(dataValidationObj);
                return await this.indicateFormulaDataValidationFailure(res, dataValidationObj, i+2);

            }

            // Builds the maps needed to reconstruct the database entries after validating them
            var collisionObj = await this.searchForFormulaCollision(obj, formulas_to_add, db_formula_nums, formulas_to_update, formulas_to_comments);
            if(collisionObj.success == false){
                return await this.indicateFormulaCollisionFailure(res, collisionObj, i+2);
            }
        }

        var added = 0;
        var ignored = 0;
        var updated = 0;
        var formulas_added = [];
        var intermediate_formulas_added = [];
        var formulas_dealt_with = new Set();
        var formulas_to_update_new = [];
        var formulas_to_update_old = [];
        var formulas_to_ignore = [];
        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];
            if(formulas_dealt_with.has(obj[Constants.csv_formula_num])) continue;
            if(formulas_to_update.has(obj[Constants.csv_formula_num])){
                updated = updated + 1;
                var newObj ={};
                var reformattedFormulas = await this.reformatFormula(newObj, obj, formulas_to_update, formulas_to_comments);
                console.log(reformattedFormulas[0]);
                formulas_to_update_new.push(reformattedFormulas[0]);
                formulas_dealt_with.add(obj[Constants.csv_formula_num]);
            }
            else if(formulas_to_add.has(obj[Constants.csv_formula_num])){
                added = added + 1;
                var newObj = {};
                var reformattedFormulas = await this.reformatFormula(newObj, obj, formulas_to_add, formulas_to_comments);
                formulas_added.push(reformattedFormulas[0]);
                formulas_dealt_with.add(obj[Constants.csv_formula_num]);
            }
        }
        
        for (var i = 0; i < formulas_added.length; i++){
            console.log("gets here");
            var formula = new Formula();
            formula.name = formulas_added[i].name;
            formula.num = formulas_added[i].num;
            formula.ingredients = formulas_added[i].ingredients;
            formula.ingredient_quantities = formulas_added[i].ingredient_quantities;
            formula.comment = formulas_added[i].comment;
            console.log(formula);
            let new_formula = await formula.save();
        }
        for (var i = 0; i < formulas_to_update_new.length; i++){
            let updated_formula = await Formula.findOneAndUpdate({ num : formulas_to_update_new[i].num },
                {$set: {name: formulas_to_update_new[i].name, num: formulas_to_update_new[i].num, 
                        ingredients: formulas_to_update_new[i].ingredients, ingredient_quantities: formulas_to_update_new[i].ingredient_quantities,
                        comment: formulas_to_update_new[i].comment}}, {upsert: true, new: true});
            console.log(updated_formula);
        }
        return res.json({ success: true, showImport: true, adds: formulas_added, updates: formulas_to_update_new, ignores: formulas_to_ignore});
        } catch (err){
            return res.json({ success: false, error: "Catch all error"});
        }
    }

    static async reformatFormula(newObj, oldObj, formulasMap, formulasToCommentsMap){
        var ingredients = [];
        var quantities = [];
        newObj.name = oldObj[Constants.csv_formula_name];
        newObj.num = oldObj[Constants.csv_formula_num];
        var ingredient_map = formulasMap.get(oldObj[Constants.csv_formula_num]);
        console.log("gets here");
        for(var ingredient_key of ingredient_map.keys()){
            console.log(ingredient_key);
            var ingredient = await Ingredient.find({ num: ingredient_key });
            console.log(ingredient.length);
            var ingredient_id = ingredient[0]._id; 
            ingredients.push(ingredient_id);
            quantities.push(ingredient_map.get(ingredient_key));
        }
        var comment = formulasToCommentsMap.get(oldObj[Constants.csv_formula_num]);
        newObj.comment = comment;
        newObj.ingredients = ingredients;
        newObj.ingredient_quantities = quantities;
        var toReturn = [];
        toReturn[0] = newObj;
        toReturn[1] = oldObj;
        return toReturn;
    }

    static async validateDataFormulas(obj, all_formulas, db_ingredients_num){
        var toReturn = {};

        if(!obj[Constants.csv_formula_name] || !obj[Constants.csv_formula_ingr] || !obj[Constants.csv_formula_quantity]){
            toReturn.success = false;
            toReturn.missingRequiredField = true;
            return toReturn;
        }

        if(obj[Constants.csv_formula_num] == "\"\"" || !obj[Constants.csv_formula_num]) obj[Constants.csv_formula_num] = ItemStore.getUniqueNumber(all_formulas);
        var isNum = /^\d+$/.test(obj[Constants.csv_formula_num]);
        if(!isNum){
            toReturn.success = false;
            toReturn.formulaNumIssue = true;
            return toReturn;
        }
        if(obj[Constants.csv_formula_name].length > 32){
            toReturn.success = false;
            toReturn.formulaNameIssue = true;
            return toReturn;
        }
        if(!db_ingredients_num.has(obj[Constants.csv_formula_ingr])){
            toReturn.success = false;
            toReturn.formulaIngrIssue = true;
            return toReturn;
        }

        var santizedEntry = UnitConversion.getCleanUnitForm(obj[Constants.csv_formula_quantity]).data;
        obj[Constants.csv_formula_quantity] = santizedEntry;
 
        var isUnitNum = /^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (oz|lb|ton|g|kg|floz|pt|qt|gal|ml|l|count)$/.test(obj[Constants.csv_formula_quantity]);
        if(!isUnitNum){
            console.log('maybe here');
            toReturn.success = false;
            toReturn.unitIssue = true;
            return toReturn;
        }
        var ingr = await Ingredient.find({ num: obj[Constants.csv_formula_ingr] });

        var unitType = await this.findUnit(ingr[0].pkg_size);
        var unitType2 = await this.findUnit(obj[Constants.csv_formula_quantity]);
        if(unitType2 == -1) {
            console.log('why this');
            toReturn.success = false;
            toReturn.unitIssue = true;
            return toReturn;
        }
        if(unitType != unitType2){
            console.log(unitType);
            console.log(unitType2);
            console.log('here?');
            toReturn.success = false;
            toReturn.unitIssue = true;
            return toReturn;
        }

        toReturn.success = true;
        return toReturn;
    }

    static async findUnit(ingredient_pkg_size){
        if(/^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (oz|lb|ton|g|kg)$/.test(ingredient_pkg_size)) return 1;
        if(/^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (floz|pt|qt|gal|ml|l)$/.test(ingredient_pkg_size)) return 2;
        if(/^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (count)$/.test(ingredient_pkg_size)) return 3;
        return -1;
    }

    static async indicateFormulaDataValidationFailure(res, dataValidationObj, row){
        if(dataValidationObj.missingRequiredField){
            return res.json({ success: false, badData: row});
        } else if(dataValidationObj.formulaNumIssue){
            return res.json({ success: false, badData: row});
        } else if(dataValidationObj.formulaNameIssue){
            return res.json({ success: false, badData: row});
        } else if(dataValidationObj.formulaIngrIssue){
            return res.json({ success: false, badData: row});
        } else if(dataValidationObj.unitIssue){
            return res.json({ success: false, badData: row});
        }
    }

    static async searchForFormulaCollision(obj, formulas_to_add, db_formula_nums, formulas_to_update, formulas_to_comments){
        var toReturn = {};

        // Check if this is one to update
        if(db_formula_nums.has(obj[Constants.csv_formula_num]) && !formulas_to_update.has(obj[Constants.csv_formula_num])) {
            var mapToAdd = new Map();
            mapToAdd.set(obj[Constants.csv_formula_ingr], obj[Constants.csv_formula_quantity]);
            formulas_to_update.set(obj[Constants.csv_formula_num], mapToAdd);
            formulas_to_comments.set(obj[Constants.csv_formula_num], obj[Constants.csv_formula_comment]);
        }
        // One to add
        else if(!formulas_to_add.has(obj[Constants.csv_formula_num]) && !formulas_to_update.has(obj[Constants.csv_formula_num]) && !db_formula_nums.has(obj[Constants.csv_formula_num])){
            var mapToAdd = new Map();
            mapToAdd.set(obj[Constants.csv_formula_ingr], obj[Constants.csv_formula_quantity]);
            formulas_to_add.set(obj[Constants.csv_formula_num], mapToAdd);
            formulas_to_comments.set(obj[Constants.csv_formula_num], obj[Constants.csv_formula_comment]);
        }
        // One to add that's seen before
        else if(formulas_to_add.has(obj[Constants.csv_formula_num])) {
            if(obj[Constants.csv_formula_comment]){
                toReturn.success = false;
                toReturn.comment_error = true;
                return toReturn;
            }

            var mapToChange = formulas_to_add.get(obj[Constants.csv_formula_num]);
            if(mapToChange.has(obj[Constants.csv_formula_ingr])){
                toReturn.success = false;
                toReturn.ingredient_duplicate = true;
                toReturn.ingredient_num = obj[Constants.csv_formula_ingr];
                toReturn.formula_num = obj[Constants.csv_formula_num];
                return toReturn;
            } else {
                mapToChange.set(obj[Constants.csv_formula_ingr], obj[Constants.csv_formula_quantity]);
                formulas_to_add.set(obj[Constants.csv_formula_num], mapToChange);
            }
        } 
        // One to update that's seen before
        else if(formulas_to_update.has(obj[Constants.csv_formula_num])) {
            if(obj[Constants.csv_formula_comment]){
                toReturn.success = false;
                toReturn.comment_error = true;
                return toReturn;
            }

            var mapToChange = formulas_to_update.get(obj[Constants.csv_formula_num]);
            if(mapToChange.has(obj[Constants.csv_formula_ingr])){
                toReturn.success = false;
                toReturn.ingredient_duplicate = true;
                toReturn.ingredient_num = obj[Constants.csv_formula_ingr];
                toReturn.formula_num = obj[Constants.csv_formula_num];
                return toReturn;
            } else {
                mapToChange.set(obj[Constants.csv_formula_ingr], obj[Constants.csv_formula_quantity]);
                formulas_to_update.set(obj[Constants.csv_formula_num], mapToChange);
            }
        }
        toReturn.success = true;
        return toReturn;
    }

    static async indicateFormulaCollisionFailure(res, collisionObj, row){
        if(collisionObj.comment_error) return res.json({ success: false, formula_comment: row})
        if(collisionObj.ingredient_duplicate) return res.json({ success: false, ingredient_duplicate: row, ingredient_num: ingredient_num, formula_num: formula_num});
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
            if(count==0 && key != Constants.csv_sku_num) return res.json({ success: false, header: 1, expected:Constants.csv_sku_num, actual: key})
            else if(count == 1 && key != "Ingr#") return res.json({ success: false, header: 2, expected:"Ingr#", actual: key});
            else if(count == 2 && key != "Quantity") return res.json({ success: false, header: 3, expected: "Quantity", actual: key})
            count++;
        }
        if(count != 3) return res.json({ success: false, requiredFields: 3, numFields: (count-1)});

        var sku_to_ingrs = new Map();
        var ingrs_to_count = new Map();
        for(var i = 0; i < jsonArray.length; i++){
            var obj = jsonArray[i];
            if(!db_skus_nums.has(Number(obj[Constants.csv_sku_num]))){
                return res.json({ success: false, sku_dependency: i});
            }
            else if(!db_ingredients_nums.has(Number(obj["Ingr#"]))){
                return res.json({ success: false, ingr_dependency: i})
            }
            else {
                if(sku_to_ingrs.has(obj[Constants.csv_sku_num])){
                    var arrayToAdd = sku_to_ingrs.get(obj[Constants.csv_sku_num]);
                    arrayToAdd.push( {ingr: obj["Ingr#"], quantity: obj["Quantity"]} );
                    sku_to_ingrs.set(obj[Constants.csv_sku_num], arrayToAdd);
                    console.log('gets here second time')
                } else {
                    var arrayToAdd = [];
                    arrayToAdd.push( {ingr: obj["Ingr#"], quantity: obj["Quantity"]} );
                    sku_to_ingrs.set(obj[Constants.csv_sku_num], arrayToAdd);
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