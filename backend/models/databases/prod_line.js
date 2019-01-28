// model/databases/prod_line.js
// Riley

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const Prod_linesSchema = new Schema({
  name: String
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Prod_Line', Prod_linesSchema);