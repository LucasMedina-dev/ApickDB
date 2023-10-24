const mongoose= require('mongoose');

const apiSchema= mongoose.Schema({
    username:{type:String, required:true},
    title:{type:String, required:true, unique:true},
    imageUrl:{type:String, required:true},
    description:{type:String, required:true},
    active:Boolean,
    valoration:Number,
    endpoint:Array
})

module.exports= mongoose.model('apicks', apiSchema)