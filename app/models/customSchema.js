const mongoose= require('mongoose');

const customSchema= mongoose.Schema({
    idEndpoint:{type:String, required:true},
    method:{type:String, required:true},
    queryParameters:{type:Boolean, required:true},
    limitDocuments:{type:Number, required:true},
    randomResponse:{type:Boolean, required:true}
})

module.exports= mongoose.model('customs', customSchema)