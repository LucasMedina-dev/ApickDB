const mongoose = require('mongoose');

const methodsSchema = new mongoose.Schema({
    method: {
        type: String,
        required:true,
        enum: ['GET', 'POST', 'PUT', 'DELETE']
    },
    active: Boolean
});


const endpointSchema = new mongoose.Schema({
    username: {type:String, required:true},
    active: {type:Boolean, required:true},
    title: {type:String, required:true},
    endpoint: {type:String, required:true},
    methods: {type:[String], required:true},
    docs: [mongoose.Schema.Types.Mixed]
});
module.exports = mongoose.model('endpoints', endpointSchema);
