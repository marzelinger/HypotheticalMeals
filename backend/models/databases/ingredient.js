// model/databases/ingredient.js
// Riley

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const IngredientsSchema = new Schema({
  name: String,
  num: Number,
  vendor_info: String,
  pkg_size: String,
  pkg_cost: Number,
  sku_count: Number,
  comment: String
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Ingredient', IngredientsSchema);