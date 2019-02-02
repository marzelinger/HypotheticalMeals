// DataStore.js
// Riley
// Store of data defaults
// DEPRICATED

import * as Constants from '../resources/Constants';

export default class DataStore{

    static getSkuData() {
        return {
          page_name: Constants.skus_page_name,
          page_title: 'SKUs',
          filter_options: [Constants.keyword_label, Constants.ingredient_label, Constants.prod_line_label],
          table_columns: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line'],
          table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line'],
          table_options: [Constants.create_item, Constants.add_to_manu_goals],
          item_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', 'comment', 'ingredients'],
          item_property_labels: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line', 'Comment', 'Ingredients'],
          item_property_placeholder: ["Campbell's Chicken Noodle Soup", '12345678', '12345678', '12345678', '12oz', '8.5', 'Soups', 'n/a', "['']"],
        };
      }
    }
