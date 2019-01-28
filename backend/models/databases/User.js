// models/databases/sku.js
// Maddie

import mongoose from 'mongoose';
import uuid from 'uuid';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    //id: uuid,
    privileges : [String],
    import_ids : [String],
    admin_creator : String,
    comment : String

  });
// export our module to use in server.js
export default mongoose.model('User', UserSchema);
