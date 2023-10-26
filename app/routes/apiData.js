const express=require('express');
const router=express.Router();
const apiSchema= require('../models/apiSchema')

router.post('/apick', (req,res)=>{
    const api=apiSchema(req.body);
    api
        .save()
        .then((data)=>res.json(data))
        .catch((err)=>res.json({message:err}))
})



router.get('/apick', (req, res) => {
    apiSchema
    .find({})
    .then((data)=>{
        res.json(data)
    })
});

module.exports= router;