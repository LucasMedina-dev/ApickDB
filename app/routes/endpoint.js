const express=require('express');
const router=express.Router();

router.get('/endpoint', (req, res) => {
    endpointSchema
    .find({title:data.title, endpoint:endpoint})
    .then((data2)=>{
        console.log(data2)
        res.json(data2)
    })
    .catch((err)=>{
        res.json("malio sal endpoint")
    })
});

module.exports= router;