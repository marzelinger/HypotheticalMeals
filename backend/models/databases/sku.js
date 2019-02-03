// model/databases/sku.js
// Belal and Riley

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const SkusSchema = new Schema({
  name: String,
  num: String,
  case_upc: Number,
  unit_upc: String,
  unit_size: String,
  cpc: String,
  prod_line: String,
  ingredients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient'
    }
  ],
  ingredient_quantities:[],
  comment: String
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('SKU', SkusSchema);