// ItemStore.js
// Riley
// Store of empty items and default set items

export default class SubmitRequest{

  static getUniqueNumber = (list) => {
    while(true){
      var u_num = Math.floor(Math.random() * 1147483647) + 1000000000;
      var success = true;
      list.map(item => { if (item.num == u_num) success = false; });
      if (success) return u_num;
    }
  }

  static getEmptyIngredient(data, obj) {
    var new_id = SubmitRequest.getUniqueNumber(data);
    return {
      name: '',
      num: new_id,
      vendor_info: '',
      pkg_size: '',
      pkg_cost: '',
      skus: [''],
      comment: ''
    };
  }
}