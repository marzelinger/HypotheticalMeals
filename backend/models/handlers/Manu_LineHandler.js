// /models/handlers/Manu_lineHandler.js
// Marley

import Manu_Line from '../databases/manu_line';
import FilterHandler from './FilterHandler';

class Manu_LineHandler{

  // used for creating objects, will return error if a unique identifier conflicts
  // POST
  static async createManufacturingLine(req, res){
    try {
      var manu_line = new Manu_Line();
      var new_name = req.body.name;
      var new_short_name = req.body.short_name;
      var new_comment = req.body.comment;
      if(!new_name) {
        return res.json({
          success: false, error: 'You must provide a name'
        });
      }
      if(!new_short_name) {
        return res.json({
          success: false, error: 'You must provide a short name'
        });
      }
      let conflict = await Manu_Line.find({ short_name : new_short_name});
      if(conflict.length > 0){
        return res.json({ success: false, error:'CONFLICT, this short name is not unique'});
      }
      manu_line.name = new_name
      manu_line.short_name = new_short_name
      manu_line.comment = new_comment
      let new_manu_line = await manu_line.save();
      return res.json({ success: true, data: new_manu_line});
    }
    catch (err) {
      return res.json({ success: false, error: err });
    }
  }
 
  static async updateManufacturingLineByID(req, res){
    try {
      var target_id = req.params.manu_line_id;
      var new_name = req.body.name;
      var new_short_name = req.body.short_name;
      var new_comment = req.body.comment;
      let conflict = await Manu_Line.find({ short_name : new_short_name});
      if(conflict.length > 0){
        return res.json({ success: false, error:'CONFLICT, this short name is not unique'});
      }
    
      let updated_manu_line = await Manu_Line.findOneAndUpdate({ _id : target_id},
        {$set: {name : new_name, short_name : new_short_name, comment: new_comment}}, {upsert: true, new : true});

      if(!updated_manu_line) {
        return res.json({
          success: true, error: 'This document does not exist'
        });
      }
      return res.json({
        success : true, data : updated_manu_line
      });
    } catch (err) {
      return res.json({ success: false, error: err });
    }
  }

  // Getting all existing Manufacturing lines
  // GET
  static async getAllManufacturingLines(req, res){
    try {
      let all_manu_lines = await Manu_Line.find();
      return res.json({ success: true, data: all_manu_lines});
    }
    catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  // Getting a specific existing Manufacturing line
  // GET
  static async getManufacturingLineByID(req, res){
    try{ 
      var target_id = req.params.manu_line_id;
      let to_return = await Manu_Line.find({ _id: target_id });
      
      if(to_return.length == 0) return res.json({ success: false, error: '404'});
      return res.json({ success: true, data: to_return});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  // Getting a specific existing Manufacturing line
  // GET
  static async getManufacturingLinesByShortName(req, res){
    try{ 
      var target_short_name = req.params.short_name;
      let to_return = await Manu_Line.find({ short_name: target_short_name });
      
      if(to_return.length == 0) return res.json({ success: false, error: '404'});
      return res.json({ success: true, data: to_return});
    } catch (err) {
      console.log(err);
      return res.json({ success: false, error: err});
    }
  }

  static async deleteManufacturingLineByID(req, res){
    try{
      var target_id = req.params.manu_line_id;
      let to_remove = await Manu_Line.findOneAndDelete({ _id: target_id });
      if(!to_remove) {
        return res.json({ success: false, error: '404'});
      }
      return res.json({ success: true, data: to_remove});
    } catch (err) {
      return res.json({ success: false, error: err});
    }
  }

  static async getManufacturingLinesByNameSubstring(req, res){
    try{
        var search_substr = req.params.search_substr;
        let results = await Manu_Line.find({ name: { $regex: search_substr, $options: 'i' } });
        if (results.length == 0) return res.json({success: false, error: '404'})
        return res.json({ success: true, data: results});
    }
    catch (err) {
        return res.json({ success: false, error: err});
    }
}

}

export default Manu_LineHandler;