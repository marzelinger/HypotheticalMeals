import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const Manu_linesSchema = new Schema({
  name: String,
  short_name: String,
  comment: String,
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Manu_Line', Manu_linesSchema);