// models/databases/sku.js
// Maddie

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
// const UserSchema = new Schema({
//   userId: {
//       type: uuid,
//       required: true
//   },
//   username: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },  
//   tags: String,
//   import_numbers: String,
//   creator: String,
//   comment: String,
//   email: {
//     type: String,
//     required: true
//   },
//   date_created: {
//       type: Date,
//       default: Date.now
//   }
// }, { timestamps: true });

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
    }
  });


// export our module to use in server.js
export default mongoose.model('User', UserSchema);
//module.exports = User = mongoose.model("users", UserSchema);
