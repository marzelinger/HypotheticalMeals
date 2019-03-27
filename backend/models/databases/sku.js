// model/databases/sku.js
// Belal and Riley

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const SkusSchema = new Schema({
  name: String,
  num: String,
  case_upc: String,
  unit_upc: String,
  unit_size: String,
  cpc: Number,
  prod_line: {
    type: Schema.Types.ObjectId,
    ref: 'Prod_Line'
  },
  formula: 
    {
      type: Schema.Types.ObjectId,
      ref: 'Formula'
    },
  scale_factor: Number,
  manu_lines: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Manu_Line'
    }
  ],
  manu_rate: Number,
  setup_cost: Number,
  run_cpc: Number,
  comment: String,
  status: String
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('SKU', SkusSchema);