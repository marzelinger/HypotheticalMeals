import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const Manu_ActivitySchema = new Schema({
    sku: { type: Schema.Types.ObjectId, ref: 'SKU'},
    quantity: Number,
    scheduled: Boolean,
    start: String, 
    manu_line: { type: Schema.Types.ObjectId, ref: 'Manu_Line'},
    duration: Number,
    orphaned: Boolean,
    unscheduled_enabled: Boolean, 
    over_deadline: Boolean,
    overwritten: Boolean
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Manu_Activity', Manu_ActivitySchema);