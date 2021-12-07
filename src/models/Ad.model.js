const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AdSchema = new Schema({
    adID: {type: String, required: true, max: 500},
    dealerID: {type: String, required: true, max: 500},
    adData: {type: String, required: true, max: 32000}, // in JSON format
}, { collection: 'adverts' });


// Export the model
module.exports = mongoose.model('adData', AdSchema);
