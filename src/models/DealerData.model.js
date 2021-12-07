const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DealerSchema = new Schema({
    dealerID: {type: String, required: true, max: 500},
    dealershipName: {type: String, required: true, max: 100},
    dealerData: {type: String, required: true, max: 32000}, // in JSON format
}, { collection: 'dealers' });


// Export the model
module.exports = mongoose.model('dealerData', DealerSchema);
