// /models/handlers/Prod_lineHandler.js
// Riley, Belal

import Prod_Line from '../databases/prod_line';

class Prod_LineHandler{

  // used for creating objects, will return error if a unique identifier conflicts
  // POST
  static async createProductLine(req, res){
    try {
      var prod_line = new Prod_Line();
      var new_name = req.body.name;
      if(!new_name) {
        return res.json({
          success: false, error: 'You must provide a name and ID'
        });
      }

      let conflict = await Prod_Line.find({ name : new_name});
      if(conflict.length > 0){
        return res.json({ success: false, error:'CONFLICT'});
      }

      prod_line.name = new_name; 
      let new_prod_line = await prod_line.save();
      return res.json({ success: true, data: new_prod_line});
    }
    catch (err) {
      return res.json({ success: false, error: err });
    }
  }
    // Extract name from body of request and check if it exists
   /* var target_name = req.body.prod_line_ID;

    Prod_Line.find({ name : target_name}, function(err, prod_lines) {
      // If it doesn't exist/an error occurs indicate to the user
      if (err) return res.json({ success: false, error: err });
      if(prod_lines.length != 0) return res.json({ success: true, error: '422'});

      // Otherwise insantiate an entry based on the request and do middleware checks
      const prod_line = new Prod_Line();
      const {name, ID } = req.body;
      if(!name || !ID){
        return res.json({
          success:false,
          error: 'You must provide a name and ID'
        });
      }

      // Build and save request
      prod_line.name = name;
      prod_line.ID = ID;
      prod_line.save(err => {
        if(err) return res.json({ success: false, error: err});
        return res.json({ success: true});
      })
    });*/
  // used for updating objects, will override an object with unique identifier conflicts
  // PUT
  static async updateProductLineByName(req, res){
    try {
      var target_name = req.params.prod_line_name;
      var new_name = req.body.new_name;

      let updated_prod_line = await Prod_Line.findOneAndUpdate({ name : target_name});
      if(!updated_prod_line) {
        return res.json({
          success: true, error: 'This document does not exist'
        });
      }
    } catch (err) {
      return res.json({ success: false, error: err });
    }
  }
      /*
    // Gets identifier of interest from the parameters
    var target_name = req.params.prod_line_ID;

    // Searches to find the identifier of interest
    Prod_Line.find({ name : target_name}, function(err, prod_lines) {
      // If there's an error or it doesn't exist, indicate to the user
      if (err) return res.json({ success: false, error: err});
      if(prod_lines.length == 0) return res.json({ success: true, error: '422'});

      // Otherwise, extract the information, edit it, and resave it
      const found_prod_line = prod_lines[0];
      const {name, ID} = req.body;
      if(!name || !ID){
        return res.json({
          success:false,
          error: 'You must provide a name and ID'
        });
      }
      found_prod_line.name = req.body;
      found_prod_line.ID = req.ID;
    });*/

  // Getting all existing product lines
  // GET
  static async getAllProductLines(req, res){
    try {
      let all_prod_lines = await Prod_Line.find()
      return res.json({ success: true, data: all_prod_lines});
    }
    catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  // Getting a specific existing product line
  // GET
  static async getProductLineByName(req, res){
    try{ 
      var target_name = req.params.prod_line_name;
      let to_return = await Prod_Line.find({ name: target_name });
      
      if(to_return.length == 0) return res.json({ success: false, error: '404'});
      return res.json({ success: true, data: to_return});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  static async deleteProductLineByName(req, res){
    try{
      var target_name = req.params.prod_line_name;
      let to_remove = await Prod_Line.findOneAndDelete({ name: target_name });
      if(!to_remove) {
        return res.json({ success: false, error: '404'});
      }
      return res.json({ success: true, data: to_remove});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

}

export default Prod_LineHandler;