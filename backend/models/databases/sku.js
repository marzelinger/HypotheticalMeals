// model/databases/sku.js
// Belal and Riley

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const SkusSchema = new Schema({
  name: String,
  num: Number,
  case_upc: Number,
  unit_upc: Number,
  unit_size: String,
  cpc: Number,
  prod_line: 
    {
      type: Schema.Types.ObjectId,
      ref: 'Prod_Line'
    },
  ingredients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient'
    }
  ],
  ingredient_quantities:[Number],
  comment: String
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('SKU', SkusSchema);