const express=require('express');
const router=express.Router();
const apiSchema= require('../models/apiSchema')
const endpointSchema = require('../models/endpointSchema')

router.post('/apick', (req,res)=>{
    const api=apiSchema(req.body);
    api
        .save()
        .then((data)=>res.json(data))
        .catch((err)=>res.json({message:err}))
})



router.get('/apick', (req, res) => {
    apiSchema
    .find(req.query)
    .then((data)=>{
        res.json(data)
    })
});

router.get('/apick/:id/:endpoint', (req, res) => {
    const id = req.params.id;
    const endpoint = '/'+req.params.endpoint;
    apiSchema
    .find({_id:id})
    .then((data)=>{
        endpointSchema.find({title:data[0].title, endpoint:endpoint}).then((endpointData)=>{
            res.json(endpointData[0].docs)

        }).catch((err)=>{
            res.json(err)
        })
    })

    .catch((err)=>{
        res.json(err)
    })
});

module.exports= router;