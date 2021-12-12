const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FlagSchema = new Schema({
    flagID: {type: String, required: true, max: 500},
    flagData: {type: String, required: true, max: 32000}, // in JSON format
}, { collection: 'flags' });


// Export the model
module.exports = mongoose.model('flagData', FlagSchema);
