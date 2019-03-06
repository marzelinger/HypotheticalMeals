

import Sale_Record from '../databases/sale_record';


class Sale_RecordHandler{

  // used for creating objects, will return error if a unique identifier conflicts
  // POST
  static async createRecord(req, res){
    try {
      var record = new Sale_Record();
      var {cust_name, cust_num, sku_num, date, sales, ppc} = req.body
      record.cust_name = cust_name
      record.cust_num = cust_num
      record.sku_num = sku_num
      record.date = date
      record.sales = sales
      record.ppc = ppc
      let conflict = await Customer.find({ cust_name, cust_num, sku_num, date, sales, ppc});
      if(conflict.length > 0){
        return res.json({ success: false, error:'CONFLICT'});
      }
      let new_record = await record.save();
      return res.json({ success: true, data: new_record});
    }
    catch (err) {
      return res.json({ success: false, error: err });
    }
  }
 
  static async getAllRecords(req, res){
    try {
      let all_records = await Sale_Record.find();
      return res.json({ success: true, data: all_records});
    }
    catch (err) {
      return res.json({ success: false, error: err});
    }
  }

}

export default Sale_RecordHandler;