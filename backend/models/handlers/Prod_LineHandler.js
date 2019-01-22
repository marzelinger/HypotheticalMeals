// /models/handlers/Prod_lineHandler.js
// Riley

import Prod_Line from '../databases/prod_line';

class Prod_LineHandler{

  static createProductLine(req, res){
    const prod_line = new Prod_Line();
    // body parser lets us use the req.body
    const { name, ID } = req.body;
    if (!name || !ID) {
    // we should throw an error. we can do this check on the front end
      return res.json({
        success: false,
        error: 'You must provide a name and ID'
      });
    }
    prod_line.name = name;
    prod_line.ID = ID;
    prod_line.save(err => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  }

  static getAllProductLines(req, res){
    Prod_Line.find((err, prod_lines) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: prod_lines });
      });
  }

}

export default Prod_LineHandler;