

import SKU from '../databases/sku';
import Sale_Record from '../databases/sale_record'
// import worker from './scraper_worker';
const { fork } = require('child_process');
const process = fork ('./models/handlers/scraper_worker.js');

export default class ScraperHandler{

    static async scrapeAllCustomers(req, res){
        try{
            return tabletojson.convertUrl(
                'http://hypomeals-sales.colab.duke.edu:8080/customers',
                function(tablesAsJson) {
                    var data = tablesAsJson[0];
                    var clean_data = data.map((item) => {
                        return {name: item.cust_name, number: item['cust#']}
                    });
                        return res.json({ success: true, data: clean_data});
                    })
        }catch (e) {
            return res.json({ success: false, error: e});
        }
    }

    static async triggerReset(req, res){
        await Sale_Record.deleteMany({});
        ScraperHandler.resetAllRecords();
    }

    static async resetAllRecords(){
        var skus = await SKU.find();
        skus.forEach((sku) => {
            ScraperHandler.updateNewSku({body: {sku_num: sku.num}});
        });
    }

    static async updateAllRecords(){
        var skus = await SKU.find();
        var sku_queue = []
        skus.forEach((sku) => {
            sku_queue.push({num: sku.num, year: new Date().getFullYear()});
            // worker.update_sku(sku.num, 'queued');
        });
        process.send(sku_queue);
        // worker.update_queue(sku_queue);
    }

    static async updateNewSku(req, res){
        // console.log(req);
        var curr_year = new Date().getFullYear();
        var target_num = req.body.sku_num;
        var sku_queue = []
        for(var year = curr_year - 10; year <= curr_year; year ++){
            sku_queue.push({num: target_num, year});
            // worker.update_sku(target_num, 'queued');
        }
        process.send(sku_queue);
    }

    static async bulkUpdateSkus(req, res){
        var target_nums = req.body.sku_nums;
        target_nums.forEach(num => {
            this.updateNewSku({body: {sku_num: num}}, {});
        })
    }
    static async updateStatus(sku_num, status){
        let updated_sku = await SKU.findOneAndUpdate({ num : sku_num},
            {$set: {status : status}}, {upsert : true, new : true});
        console.log(updated_sku);
    }

    static async addRecord(sale_record){
        var record = new Sale_Record();
        var {cust_name, cust_num, sku_num, date, sales, ppc} = sale_record
        record.cust_name = cust_name
        record.cust_num = cust_num
        record.sku_num = sku_num
        record.date = date
        record.sales = sales
        record.ppc = ppc
        let conflict = await Sale_Record.find({cust_name, cust_num, sku_num, date, sales, ppc});
        if(conflict.length > 0){
          return;
        }
        record.save();
      }
}
process.on('message', (message) => {
    if(message.type == 'status'){
        ScraperHandler.updateStatus(message.sku_num, message.status)
    }
    else if(message.type == 'add_record'){
        ScraperHandler.addRecord(message.sale_record);
    }
})

setTimeout(() => ScraperHandler.updateAllRecords(), 86400000);