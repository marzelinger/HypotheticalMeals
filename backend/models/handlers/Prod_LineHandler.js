// /models/handlers/Prod_lineHandler.js
// Riley, Belal

import Prod_Line from '../databases/prod_line';

class Prod_LineHandler{

  // used for creating objects, will return error if a unique identifier conflicts
  // POST
  static createProductLine(req, res){

    // Extract name from body of request and check if it exists
    var target_name = req.body.prod_line_ID;
    Prod_Line.find({ name : target_name}, function(err, prod_lines) {
      // If it doesn't exist/an error occurs indicate to the user
      if (err) return res.json({ success: false, error: err });
      if(prod_lines.length == 0) return res.json({ success: true, error: '422'});

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
    });
  }

  // used for updating objects, will override an object with unique identifier conflicts
  // PUT
  static updateProductLineByID(req, res){
    var target_name = req.params.prod_line_ID;

    Prod_Line.find({ name : target_name}, function(err, prod_lines) {
      if (err) return res.json({ success: false, error: err});
      if(prod_lines.length == 0) return res.json({ success: true, error: '422'});
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
    });
  }

  // Getting all existing product lines
  // GET
  static getAllProductLines(req, res){
    Prod_Line.find((err, prod_lines) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: prod_lines });
      });
  }

  // Getting a specific existing product line
  // GET
  static getProductLineByID(req, res){
    var target_name = "" + req.params.prod_line_ID;
    Prod_Line.find({ name : target_name}, function(err, prod_lines) {
      if(err) return res.json({ success: false, error: err});
      if(prod_lines.length < 1) return res.json({ success : true, error: '404'});
      return res.json({ success: true, data: prod_lines})
    });
  }

}

export default Prod_LineHandler;