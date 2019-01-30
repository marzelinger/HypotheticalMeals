// DataStore.js
// Riley
// Store of data defaults

import * as Constants from '../resources/Constants';

export default class DataStore{
  
    static getIngredientData() {
      return {
        page_name: Constants.ingredients_page_name,
        page_title: 'Ingredients',
        filter_options: [Constants.keyword_label, Constants.sku_label],
        assisted_search_function: DataStore.submitSkusByIngredientIDRequest,
        table_columns: ['Name', 'Number', 'Package Size', 'Cost per Package (USD)'],
        table_properties: ['name', 'num', 'pkg_size', 'pkg_cost'],
        table_options: [Constants.create_item],
        item_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'vendor_info', 'comment', 'skus'],
        item_property_labels: ['Name', 'Number', 'Package Size', 'Package Cost', 'Vendor Info', 'Comments', 'SKUs'],
        item_property_placeholder: ['White Rice', '12345678', '1lb', '1.50', 'Tam Soy', '...', 'Fried Rice'],
        item_options: ['View Ingredient'], 
      };
    }

    static submitSkusByIngredientIDRequest = (item_id, obj) => {
      fetch(`/api/skus_by_ingredient/${item_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()).then((res) => {
        if (!res.success) obj.setState({ error: res.error.message || res.error });
        else return { data: res.data };
      });
    }

    static getSkuData() {
        return {
          page_name: Constants.skus_page_name,
          page_title: 'SKUs',
          filter_options: [Constants.keyword_label, Constants.ingredient_label, Constants.prod_line_label],
          table_columns: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line'],
          table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line'],
          table_options: [Constants.create_item],
          item_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', 'comment', 'ingredients'],
          item_property_labels: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line', 'Comment', 'Ingredients'],
          item_property_placeholder: ["Campbell's Chicken Noodle Soup", '12345678', '12345678', '12345678', '12oz', '8.5', 'Soups', 'n/a', "['']"],
        };
      }
  }