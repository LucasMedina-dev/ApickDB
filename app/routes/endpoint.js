const express=require('express');
const router=express.Router();
const endpointSchema = require("../models/endpointSchema");

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
router.post("/endpoint", (req, res) => {
    const endpoint = endpointSchema(req.body);
    console.log(endpoint)
    endpoint
      .save()
      .then((data) => res.json(data))
      .catch((err) => res.json({ message: err }));
  });
module.exports= router;