
const tabletojson = require('tabletojson');

export default class ScraperHandler{

    static  async scrapeSkuRecords(req, res){
        var target_num = req.params.sku_num;
        var target_year = req.params.sku_num;
        return tabletojson.convertUrl(
            `http://hypomeals-sales.colab.duke.edu:8080/?sku=${target_num}&year=2019`,
            function(tablesAsJson) {
                var data = tablesAsJson[0];
                var clean_data = data.map((record) => {
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
                    return sale_record;
                    // SubmitRequest.submitCreateItem('records', sale_record);
                })
                return res.json({ success: true, data: clean_data});
            }
        );
    }

    static async scrapeAllCustomers(req, res){
        try{
            return tabletojson.convertUrl(
                'http://hypomeals-sales.colab.duke.edu:8080/customers',
                function(tablesAsJson) {
                    console.log(tablesAsJson)
                    var data = tablesAsJson[0];
                    console.log(data)
                    var clean_data = data.map((item) => {
                        return {name: item.cust_name, number: item['cust#']}
                    });
                        return res.json({ success: true, data: clean_data});
                    })
        }catch (e) {
            return res.json({ success: false, error: e});
        }
    }
}