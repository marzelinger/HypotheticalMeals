
let csv = require('csvtojson');


export default class CSV_parser{

    static async parseCSV(req, res){
        try {
            var formattedArray = {};
            //TODO: change this to fromPath
            const jsonArray = await csv().fromFile('testSpreadSheet.csv');
            for(var i = 0; i < jsonArray.length; i++){
                // Changes the name of the fields
               var obj = jsonArray[i];
               console.log(obj);
               obj.name = obj.Name;
               delete obj.Name;
            }
            return res.json({ success: true, data : jsonArray});
        } catch (err) {
            return res.json({ success: false, error: err});
        }
    }
}