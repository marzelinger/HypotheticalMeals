
import Sale_Record from '../databases/sale_record';
import SKU from '../databases/sku';
const tabletojson = require('tabletojson');
var awake = false;
var sku_queue = [];

export default class Scraper_Worker{
    static update_queue(new_skus){
        sku_queue.push(...new_skus);
        if(!awake){
            Scraper_Worker.start_scraping();
        }
    }
    
    static start_scraping(){
        awake = true;
        Scraper_Worker.updateRecords();
    }

    static async updateRecords() {
        var sku = sku_queue.shift();
        Scraper_Worker.scrape_record(sku.num, sku.year);
        if(sku_queue.length != 0){
            setTimeout( () => {
            this.updateRecords()
            }, 200)
        } 
        else{
            awake = false;
        }
    }

    static async update_sku(sku_num, status){
        var resp = await SKU.findOneAndUpdate({num : sku_num},{$set: {status}}, {upsert : true, new : true});
    }

    static async scrape_record(sku_num, sku_year){
        // console.log('hit ' + sku_num + ' ' + sku_year);
        tabletojson.convertUrl(
            `http://hypomeals-sales.colab.duke.edu:8080/?sku=${sku_num}&year=${sku_year}`,
            function(tablesAsJson) {
                var data = tablesAsJson[0];
                data.map((record) => {
                    var sale_record = {
                        cust_num: record['cust#'],
                        cust_name: record.cust_name,
                        sku_num: record.sku,
                        date: {
                            week: Number(record.week), 
                            year: Number(record.year)
                        },
                        sales: Number(record.sales),
                        ppc: Number(record['price/case'])
                    }
                    console.log('adding')
                    console.log(record)
                    Scraper_Worker.addRecord(sale_record);
                })
            }
        ).then(() => {
            Scraper_Worker.update_sku(sku_num, 'success');
        });
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

