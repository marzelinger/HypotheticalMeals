// ItemStore.js
// Riley
// Store of empty items and default set items

import CheckDigit from './CheckDigit';
import SubmitRequest from './SubmitRequest';
import * as Constants from '../resources/Constants';

export default class ItemStore{

  static getUniqueNumber = (list) => {
    while(true){
      var u_num = Math.floor(Math.random() * 8999999999) + 1000000000;
      var success = true;
      list.map(item => { if (item.num === u_num) success = false; });
      if (success) return u_num;
    }
  }

  static getUniqueCaseUPC = (list) => {
    while(true){
      var c_upc = Math.floor(Math.random() * 89999999999) + 10000000000;
      c_upc = CheckDigit.apply(c_upc.toString())
      var success = true;
      list.map(item => { if (item.case_upc === c_upc) success = false; });
      if (success) return c_upc;
    }
  }

  static getUniqueUnitUPC = (case_upc, list) => {
    while(true){
      var u_upc = Math.floor(Math.random() * 89999999999) + 10000000000;
      u_upc = CheckDigit.apply(u_upc.toString())
      var success = true;
      list.map(item => { 
        if (item.case_upc === case_upc) { 
          if (item.unit_upc === u_upc){
            success = false; 
          }
        }});
      if (success) return u_upc;
    }
  }

  static async getEmptyItem(page_name) {
    
    
    switch (page_name){
      case Constants.ingredients_page_name:
        var res = await SubmitRequest.submitGetData(page_name);
        var new_id = await ItemStore.getUniqueNumber(res.data);
        return {
          _id: 'unassigned',
          name: '',
          num: new_id,
          vendor_info: '',
          pkg_size: '',
          pkg_cost: '',
          sku_count: 0,
          comment: ''
        };
      case Constants.users_page_name:
          return {
            _id: 'unassigned',
            username: '',
            password: '',
            // privileges: [],
            admin_creator: '',
            comment: '',
            isAdmin: false,
            isNetIDLogin: false
          };
      case Constants.skus_page_name: 
        var res = await SubmitRequest.submitGetData(page_name);
        var new_id = await ItemStore.getUniqueNumber(res.data);
        let new_case_upc = ItemStore.getUniqueCaseUPC(res.data);
        let new_unit_upc = ItemStore.getUniqueUnitUPC(new_case_upc, res.data);
        return {
          name: '',
          num: new_id,
          case_upc: new_case_upc,
          unit_upc: new_unit_upc,
          unit_size: '',
          cpc: '',
          prod_line: '',
          comment: '',
          ingredients: [],
          ingredient_quantities: [],
          formula: {},
          scale_factor: 1,
          manu_lines: [],
          manu_rate: '',
          setup_cost: '',
          run_cpc: ''
        };
      case Constants.manugoals_page_name:
        return {
          name: '',
          deadline: " ",
          activities: [],
          enabled: false
        }
      case Constants.manu_line_page_name:
      return {
        name: '',
        short_name: '',
        comment: '',
        skus: []
      }
      case Constants.formulas_page_name:
      var res = await SubmitRequest.submitGetData(page_name);
      var new_id = await ItemStore.getUniqueNumber(res.data);
      return {
        _id: 'unassigned',
        name: '',
        num: new_id,
        ingredients: [],
        ingredient_quantities: [],
        comment: ''
      }
    }
    
  }
}