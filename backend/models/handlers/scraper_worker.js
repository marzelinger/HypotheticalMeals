
const tabletojson = require('tabletojson');
var awake = false;
var sku_queue = [];

process.on('message', (message) => {
    if(message == 'reset'){
        trigger_reset();
    }
    else{
        console.log(message);
        update_queue(message)
    }
    process.send('message recieved')
})

    async function trigger_reset(){
        sku_queue = [];
    }

    async function update_queue(new_skus){
        sku_queue.push(...new_skus);
        var promises = new_skus.map((sku) => update_sku(sku.num, 'queued'))
        await Promise.all(promises);
        if(!awake){
            start_scraping();
        }
    }
    
    async function start_scraping(){
        awake = true;
        updateRecords();
    }

    async function updateRecords() {
        console.log('updating records');
        var sku = sku_queue.shift();
        scrape_record(sku.num, sku.year);
        if(sku_queue.length != 0){
            setTimeout( () => {
            updateRecords()
            }, 500)
        } 
        else{
            awake = false;
        }
    }

    async function update_sku(sku_num, status){
        process.send({type: 'status', sku_num: sku_num, status:status});
    }

    async function scrape_record(sku_num, sku_year){
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
                    process.send({type: 'add_record', sale_record})
                })
            }
        ).then(() => {
            if(!sku_queue.some((sku) =>  sku.num == sku_num)){
                update_sku(sku_num, 'success');
            }
           
        });
    }

    


