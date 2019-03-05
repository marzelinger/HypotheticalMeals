// model/databases/sale_record.js


import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const Sale_RecordSchema = new Schema({
    cust_num: String,
    cust_name: String,
    sku_num: String,
    date: {
        week: Number, 
        year: Number
    },
    sales: Number,
    ppc: Number
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Sale_Record', Sale_RecordSchema);