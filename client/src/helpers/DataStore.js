// DataStore.js
// Riley
// Store of data defaults
// DEPRICATED

import * as Constants from '../resources/Constants';

export default class DataStore{

    static getIngredientData() {
      return {
        page_name: Constants.ingredients_page_name,
        page_title: 'Ingredients',
        table_columns: ['Name', 'Number', 'Package Size', 'Cost per Package (USD)', 'Associated SKUs'],
        table_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'sku_count'],
        table_options: [Constants.create_item, Constants.add_keyword_filter, Constants.add_sku_filter],
        item_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'vendor_info', 'comment'],
        item_property_labels: ['Name', 'Number', 'Package Size', 'Package Cost', 'Vendor Info', 'Comments'],
        item_property_patterns: ['.+', '^[0-9]{10}$', '.+', '^[0-9]+(\.[0-9][0-9]?)?$', '.*', '.*'], 
      };
    }

    static getSkuData() {
        return {
          page_name: Constants.skus_page_name,
          page_title: 'SKUs',
          filter_options: [Constants.keyword_label, Constants.ingredient_label, Constants.prod_line_label],
          table_columns: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line'],
          table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line'],
          table_options: [Constants.create_item, Constants.add_to_manu_goals, Constants.add_keyword_filter, 
            Constants.add_ing_filter, Constants.add_prod_filter],
          item_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'comment'],
          item_property_labels: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Comment'],
          item_property_patterns: ['.+', '^[0-9]{10}$', '^[016789][0-9]{11}$', '^[016789][0-9]{11}$', '.+', '^[0-9]+(\.[0-9][0-9]?)?$', '.*'], 
        };
    }

    static getSkuDataSimple() {
      var results = DataStore.getSkuData();
      results.table_columns = ['SKU Name', 'Number', 'Case UPC', 'Unit UPC', 'Product Line'];
      results.table_properties = ['name', 'num', 'case_upc', 'unit_upc', 'prod_line'];
      return results;
    }

    static getIngredientDataSimple() {
      var results = DataStore.getIngredientData();
      results.table_columns = ['Name', 'Number'];
      results.table_properties = ['name', 'num'];
      return results;
    }
  }
