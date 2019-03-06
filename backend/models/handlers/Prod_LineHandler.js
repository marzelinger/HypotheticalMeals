// /models/handlers/Prod_lineHandler.js
// Riley, Belal

import Prod_Line from '../databases/prod_line';
import FilterHandler from './FilterHandler';

class Prod_LineHandler{

  // used for creating objects, will return error if a unique identifier conflicts
  // POST
  static async createProductLine(req, res){
    try {
      var prod_line = new Prod_Line();
      var new_name = req.body.name;
      if(!new_name) {
        return res.json({
          success: false, error: 'You must provide a name'
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
 
  static async updateProductLineByID(req, res){
    try {
      var target_id = req.params.prod_line_id;
      var new_name = req.body.name;

      let conflict = await Prod_Line.find({ name: new_name });
      if(conflict.length > 0 && conflict[0]._id != target_id) return res.json({ success: false, error: 'CONFLICT'});

      let updated_prod_line = await Prod_Line.findOneAndUpdate({ _id : target_id},
        {$set: {name : new_name}}, {upsert: true, new : true});

      if(!updated_prod_line) {
        return res.json({
          success: true, error: 'This document does not exist'
        });
      }
      return res.json({
        success : true, data : updated_prod_line
      });
    } catch (err) {
      return res.json({ success: false, error: err });
    }
  }

  // Getting all existing product lines
  // GET
  static async getAllProductLines(req, res){
    try {
      let all_prod_lines = await Prod_Line.find();
      return res.json({ success: true, data: all_prod_lines});
    }
    catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  // Getting a specific existing product line
  // GET
  static async getProductLineByID(req, res){
    try{ 
      var target_id = req.params.prod_line_id;
      let to_return = await Prod_Line.find({ _id: target_id });
      
      if(to_return.length == 0) return res.json({ success: false, error: '404'});
      return res.json({ success: true, data: to_return});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  static async deleteProductLineByID(req, res){
    try{
      var target_id = req.params.prod_line_id;
      let to_remove = await Prod_Line.findOneAndDelete({ _id: target_id });
      if(!to_remove) {
        return res.json({ success: false, error: '404'});
      }
      return res.json({ success: true, data: to_remove});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  static async getProductLinesByNameSubstring(req, res){
    try{
        console.log("HERE IN THE PROD HANDLER");
        var search_substr = req.params.search_substr;
        var currentPage = Number(req.params.currentPage);
        var pageSize = Number(req.params.pageSize);
        console.log("VALUES");


        let results = await Prod_Line.find({ name: { $regex: search_substr, $options: 'i' } }).skip(currentPage*pageSize).limit(pageSize);
        if (results.length == 0) return res.json({success: false, error: '404'})
        return res.json({ success: true, data: results});
    }
    catch (err) {
        return res.json({ success: false, error: err});
    }
}

  static async getAllProductLinesPag(req, res){
    try {

      var currentPage = Number(req.params.currentPage);
      var pageSize = Number(req.params.pageSize);
      let all_prod_lines = await Prod_Line.find().skip(currentPage*pageSize).limit(pageSize);
      return res.json({ success: true, data: all_prod_lines});
    }
    catch (err) {
      return res.json({ success: false, error: err});
    }
  }

}

export default Prod_LineHandler;