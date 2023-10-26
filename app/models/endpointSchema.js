const mongoose = require('mongoose');

// Define el subdocumento "method"
const methodsSchema = new mongoose.Schema({
    method: {
        type: String,
        required:true,
        enum: ['GET', 'POST', 'PUT', 'DELETE']
    },
    active: Boolean,
    apikey: Boolean,
    rateLimit: Number,
    maxResponse: Number,
    requestBody: String,
    deleteBy: String
});


const endpointSchema = new mongoose.Schema({
    username: {type:String, required:true},
    title: {type:String, required:true},
    endpoint: {type:String, required:true},
    methods: [methodsSchema],
    docs: [mongoose.Schema.Types.Mixed]
});
module.exports = mongoose.model('endpoints', endpointSchema);
