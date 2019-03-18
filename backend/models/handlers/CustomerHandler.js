

import Customer from '../databases/customer';


class CustomerHandler{

  // used for creating objects, will return error if a unique identifier conflicts
  // POST
  
  static async createCustomer(req, res){
    try {
      var customer = new Customer();
      var new_name = req.body.name;
      var new_number = req.body.number;
      if(!new_name) {
        return res.json({
          success: false, error: 'You must provide a name'
        });
      }

      let conflict = await Customer.find({ number : new_number});
      if(conflict.length > 0){
        return res.json({ success: false, error:'CONFLICT'});
      }

      customer.name = new_name;
      customer.number = new_number;
      let new_customer = await customer.save();
      return res.json({ success: true, data: new_customer});
    }
    catch (err) {
      return res.json({ success: false, error: err });
    }
  }
 
  static async getAllCustomers(req, res){
    try {
      let all_customers= await Customer.find();
      return res.json({ success: true, data: all_customers});
    }
    catch (err) {
      return res.json({ success: false, error: err});
    }
  }


  static async getCustomerByNumber(req, res){
    try{ 
      var target_number = req.params.customer_number;
      let to_return = await Customer.find({ number: target_number });
    
      if(to_return.length == 0) return res.json({ success: false, error: '404'});
      return res.json({ success: true, data: to_return});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  


  static async getCustomerByID(req, res){
    try {
        var target_id = req.params.customer_id;
        let to_return = await Customer.find({ _id : target_id});
        if(to_return.length == 0) return res.json({ success: false, error: '404'});
        return res.json({ success: true, data: to_return});
    } catch (err) {
        return res.json({ success: false, error: err});
    }
}


  static async getCustomerByNameSubstring(req, res){
    try{
        var search_substr = req.params.name_substring;
        let results = await Customer.find({ name: { $regex: search_substr, $options: 'i' } });
        if (results.length == 0) return res.json({success: false, error: '404'})
        return res.json({ success: true, data: results});
    }
    catch (err) {
        return res.json({ success: false, error: err});
    }
}

}

export default CustomerHandler;