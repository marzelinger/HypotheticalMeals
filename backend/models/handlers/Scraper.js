

import SKU from '../databases/sku';
import worker from './scraper_worker';

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
        await worker.trigger_reset();
        ScraperHandler.resetAllRecords();
    }

    static async resetAllRecords(){
        var skus = await SKU.find();
        skus.forEach((sku) => {
            ScraperHandler.updateNewSku({body: {sku_num: sku.num}}, {});
        });
    }

    static async updateAllRecords(){
        var skus = await SKU.find();
        var sku_queue = []
        skus.forEach((sku) => {
            sku_queue.push({num: sku.num, year: new Date().getFullYear()});
            worker.update_sku(sku.num, 'queued');
        });
        worker.update_queue(sku_queue);
    }

    static async updateNewSku(req, res){
        var curr_year = new Date().getFullYear();
        var target_num = req.body.sku_num;
        var sku_queue = []
        for(var year = curr_year - 10; year <= curr_year; year ++){
            sku_queue.push({num: target_num, year});
            worker.update_sku(target_num, 'queued');
        }
        worker.update_queue(sku_queue);
    }

    static async bulkUpdateSkus(req, res){
        var target_nums = req.body.sku_nums;
        target_nums.forEach(num => {
            this.updateNewSku({params: {sku_num: num}}, {});
        })
    }
}

setTimeout(() => ScraperHandler.updateAllRecords(), 86400000);