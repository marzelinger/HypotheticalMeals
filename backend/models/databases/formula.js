// model/databases/formula.js
// Belal

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const FormulaSchema = new Schema({
  name: String,
  num: String,
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
export default mongoose.model('Formula', FormulaSchema);