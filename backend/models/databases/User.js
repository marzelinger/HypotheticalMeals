// models/databases/sku.js
// Maddie

import mongoose from 'mongoose';
import uuid from 'uuid';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
      type: String,
      required: true
    },
    // email: {
    //   type: String,
    //   required: true
    // },
    password: {
      type: String,
      required: true
    },
    // dateCreated: {
    //   type: Date,
    //   default: Date.now
    // },
    privileges : [String],
    //import_ids : [String],
    admin_creator : String,
    comment : String,
    isAdmin : {
      type : Boolean,
      required : true
    }


  });
// export our module to use in server.js
export default mongoose.model('User', UserSchema);
