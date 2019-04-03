// models/databases/sku.js
// Maddie

import mongoose from 'mongoose';
import uuid from 'uuid';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    password: String,
    //privileges : [String],
    admin_creator : String,
    comment : String,
    isAdmin : Boolean,
    isNetIDLogin: Boolean,
    roles : [String],
    manu_lines: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Manu_Line'
      }
    ]
  });
// export our module to use in server.js
export default mongoose.model('User', UserSchema);
