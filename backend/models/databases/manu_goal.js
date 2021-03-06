// model/databases/manu_goal.js
// Riley

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const Manu_GoalSchema = new Schema({
    name: String,
    user: String,
    activities: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Manu_Activity'
        }
    ],
    enabled: Boolean,
    deadline: Date
}, { timestamps: true });

// export our module to use in server.js
export default mongoose.model('Manu_Goal', Manu_GoalSchema);