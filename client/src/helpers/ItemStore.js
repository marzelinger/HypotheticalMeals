// ItemStore.js
// Riley
// Store of empty items and default set items

import * as Constants from '../resources/Constants';

export default class ItemStore{

  static getUniqueNumber = (list) => {
    while(true){
      var u_num = Math.floor(Math.random() * 1147483647) + 1000000000;
      var success = true;
      list.map(item => { if (item.num == u_num) success = false; });
      if (success) return u_num;
    }
  }

  static getEmptyItem(page_name, data, obj) {
    var new_id = ItemStore.getUniqueNumber(data);
    switch (page_name){
      case Constants.ingredients_page_name:
        return {
          name: '',
          num: new_id,
          vendor_info: '',
          pkg_size: '',
          pkg_cost: '',
          skus: []
        };
      case Constants.skus_page_name: 
        return {
          name: '',
          num: new_id,
          case_upc: '',
          unit_upc: '',
          unit_size: '',
          cpc: '',
          prod_line: '',
          comment: '',
          ingredients: [],
          ingredient_quantities: []
        };
    }
    
  }
}