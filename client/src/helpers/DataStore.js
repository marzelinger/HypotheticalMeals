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
        table_columns: ['Name', 'Ingr#', 'Package Size', 'Package Cost (USD)', 'Associated SKUs'],
        table_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'sku_count'],
        table_options: [Constants.create_item, Constants.add_keyword_filter, Constants.add_sku_filter],
        item_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'vendor_info', 'comment'],
        item_property_labels: ['Name', 'Ingr#', 'Package Size', 'Package Cost (USD)', 'Vendor Info', 'Comments'],
        item_property_patterns: ['.*', '^[0-9]+$', '^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$', '^[0-9]*[\.]?[0-9]{1,2}$', '.*', '.*'],
        item_property_field_type: ['text', 'text', 'text', 'text', 'textarea', 'textarea'],  
      };
    }

    static getFormulaData() {
      return {
        page_name: Constants.formulas_page_name,
        page_title: 'Formulas',
        table_columns: ['Name', 'Formula#', "Comment"],
        table_properties: ['name', 'num', "comment"],
        table_options: [Constants.create_item, Constants.add_keyword_filter, Constants.add_ing_filter],
        item_properties: ['name', 'num', "comment"],
        item_property_labels: ['Name', 'Formula#', "Comment"],
        item_property_patterns: ['.+', '^[0-9]+$', '.*'], 
        item_property_field_type: ['text', 'text', 'text'],
      }
    }

    static getProductLineData() {
      return {
        item_properties: ['name'],
        item_property_labels: ['Name'],
        item_property_patterns: ['.+'],
        item_property_field_type: ['text']  
      };
    }

    static getLineData() {
      return {
        item_properties: ['name', 'short_name', 'comment'],
        item_property_labels: ['Name', 'Short Name', 'Comment'],
        item_property_patterns: ['.+', '.+', '.*'],
        item_property_field_type: ['text', 'text', 'textarea']  
      };
    }

    static getGoalData() {
      return {
        item_properties: ['name'],
        item_property_labels: ['Name'],
        item_property_patterns: ['.+'],
        item_property_field_type: ['text'],
        page_name: 'manugoals',
        table_columns: ['Title', 'Author', 'Last Edit'], 
        table_properties: ['name', 'user', 'updatedAt'], 
        table_options: [Constants.create_item]
      };
    }

    static getUserData() {
        return {
          page_name: Constants.users_page_name,
          page_title: 'Users',
          filter_options: [Constants.keyword_label],
          table_columns: ['Username', 'Admin', 'Created By'],
          table_properties: ['username', 'isAdmin', 'admin_creator'],
          // table_columns: ['Username', 'Admin', 'Created By', 'Comment'],
          // table_properties: ['username', 'isAdmin', 'admin_creator', 'comment'],
          table_options: [Constants.add_keyword_filter],
          //table_options: [Constants.create_user, Constants.add_keyword_filter],

          item_properties: ['username'],
          item_property_labels: ['Username'],
          // item_properties: ['username', 'password', 'isAdmin', 'admin_creator', 'comment'],
          // item_property_labels: ['Username', 'Passowrd', 'Admin', 'Created By', 'Comment'],

          item_property_patterns: ['.*', '.*', '.*', '.*'],
          item_property_field_type: ['text', 'text', 'text', 'text'],
        };
    }


    static getSkuData() {
      return {
        page_name: Constants.skus_page_name,
        page_title: 'SKUs',
        filter_options: [Constants.keyword_label, Constants.ingredient_label, Constants.prod_line_label],
        table_columns: ['Name', 'SKU#', 'Case UPC#', 'Unit UPC#', 'Unit Size', 'Count per Case', 'Product Line'],
        table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line'],
        table_options: [Constants.create_item, Constants.add_to_manu_goals, Constants.add_keyword_filter, 
          Constants.add_ing_filter, Constants.add_prod_filter],
        item_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'comment', 'manu_rate', 'scale_factor', 'setup_cost', 'run_cpc'],
        item_property_labels: ['Name', 'SKU#', 'Case UPC#', 'Unit UPC#', 'Unit Size', 'Count per Case', 'Comment', 'Manufacturing Rate', 'Formula Scale Factor', 'Manufacturing Setup Cost (USD)', 'Manufacturing Run Cost Per Case (USD)'],
        item_property_patterns: ['^.{1,32}$', '^[0-9]+$', '^[0-9]{12}$', '^[0-9]{12}$', '.*', '^[0-9]+$', '.*', '^[0-9]*[\.]?[0-9]+$', '^[0-9]*[\.]?[0-9]+$', '^[0-9]*[\.]?[0-9]{1,2}$', '^[0-9]*[\.]?[0-9]{1,2}$'],  
        item_property_field_type: ['text', 'text', 'text', 'text', 'text', 'text', 'textarea', 'text','text', 'text', 'text', 'text'],
      };
  }


  static getProdLineReportData() {
    return {
      page_name: Constants.prod_line_page_name,
      page_title: 'Product Lines',
      filter_options: [Constants.keyword_label],
      table_columns: ['Name'],
      table_properties: ['name'],
      table_options: [Constants.add_keyword_filter],
    };
}

  static getSkuFormulaDetailsData(){
    return {
      formula_item_properties: ['name', 'num'],
      formula_item_property_labels: ['Name', 'Formula#'],
      formula_item_property_patterns: ['.+', '^[0-9]+$'], 
      formula_item_property_field_type: ['text', 'text'],
    };
  }

  


    static getSkuDataSimple() {
      var results = DataStore.getSkuData();
      results.table_columns = ['SKU Name', 'Unit Size', 'Count per Case', 'SKU#'];
      results.table_properties = ['name', 'unit_size', 'cpc', 'num'];
      return results;
    }

    static getIngredientDataSimple() {
      var results = DataStore.getIngredientData();
      results.table_columns = ['Ingredient Name', 'Ingr#'];
      results.table_properties = ['name', 'num'];
      return results;
    }

    static getActivityData() {
      return {
        item_properties: ['sku', 'duration', 'add_to_schedule'],
        item_property_labels: ['Activity SKU', 'Duration', 'Add to Schedule']
      };
    }

    static getSkuSaleReportData() {
      return {
        item_properties: ['year', 'week', 'cust_name', 'cust_num', 'sales', 'ppc', 'revenue'],
        item_property_labels: ['Year', 'Week', 'Customer Name', 'Customer Number', 'Number of Sales', 'Price per Case (USD)', 'Revenue (USD)']
      };
    }

    static getManuGoalDataExportData() {
      return {
        item_properties: ['name', 'num', 'unit_size', 'cpc', 'quantity', 'manu_rate'],
        item_property_labels: ['Name', 'SKU#', 'Unit Size', 'Count per Case', 'Quantity', 'Manufacturing Rate']
      };
    }
  }
