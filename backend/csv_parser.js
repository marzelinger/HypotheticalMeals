import Prod_Line from './models/databases/prod_line';

let csv = require('csvtojson');


export default class CSV_parser{

    static async parseCSV(req, res){
        try {
            let all_prod_lines = Prod_Line.find();
            console.log(typeof all_prod_lines);
            all_prod_lines.data;
            var formattedArray = {};
            //TODO: change this to fromPath
            const jsonArray = await csv().fromFile('testSpreadSheet.csv');
            for(var i = 0; i < jsonArray.length; i++){
                var obj = jsonArray[i];
                obj.name = obj.Name;
                obj.num = obj["SKU#"];
                obj.case_upc = obj["Case UPC"];
                obj.unit_upc = obj["Unit UPC"];
                obj.unit_size = obj["Unit Size"];
                obj.cpc = obj["Count per case"];
                obj.prod_line = obj["Product Line Name"];
                //TODO insert ingredients
                obj.comment = obj.Comment;
                delete obj.Name;
                delete obj["SKU#"];
                delete obj["Case UPC"];
                delete obj["Unit UPC"];
                delete obj["Unit Size"];
                delete obj["Count per case"];
                delete obj["Product Line Name"];
                delete obj.Comment;
            }
            return res.json({ success: true, data : jsonArray});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }

    static changeEntryFields(obj){
        console.log("gets here");
        obj.name = obj.Name;
        delete obj.Name;
        obj.num = obj["SKU#"];
        delete obj["SKU#"];
        console.log("gets here2");
    }
}