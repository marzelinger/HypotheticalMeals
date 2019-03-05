'use strict';
const tabletojson = require('tabletojson');
 

export default class Scraper{

    static  triggerSkuPull(skuNum){
        tabletojson.convertUrl(
            'http://hypomeals-sales.colab.duke.edu:8080/?sku=1234&year=2019',
            function(tablesAsJson) {
                console.log(tablesAsJson[0]);
            }
        );
    }
}