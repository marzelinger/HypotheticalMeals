// model/databases/customer.js


import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const Customer_Schema = new Schema({
    name: String, 
    number: String
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Customer', Customer_Schema);