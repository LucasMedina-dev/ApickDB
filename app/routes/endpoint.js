const express = require("express");
const router = express.Router();
const endpointSchema = require("../models/endpointSchema");
const { ObjectId } = require("mongodb");
const apiSchema = require("../models/apiSchema");
const keySchema = require("../models/keySchema");

router.post("/endpoint", (req, res) => {
  const endpoint = endpointSchema(req.body);
  endpoint
    .save()
    .then((data) => res.json(data))
    .catch((err) => res.json({ message: err }));
});
router.get("/endpoint", (req, res) => {
  endpointSchema.findOne(req.query, { _id: 1 }).then((data) => {
    res.json(data);
  });
});
router.get("/endpoint/:id", (req, res) => {
  const API_KEY = req.get("authorization");
  const id = req.params.id;
  const objectId = new ObjectId(id);

  endpointSchema
    .findOne({ _id: objectId, active: true })
    .then((data) => {
      // busco la apick y traigo el id
      // busco en keys si el idapi y key existen

      apiSchema.findOne({ title: data.title }, { _id: 1 }).then((result) => {
        let id = result._id;
        keySchema.findOne({ apiId: id }).then((result) => {
          let exists= result.keys.find((e)=> e.key === API_KEY)
          if(exists){
            res.json(data.docs);
          }else{
            res.json({message:"You need API KEY"})
          }
          
        });
      });

      
    })
    .catch(() => res.status(400).json({ message: "Error" }));
});

module.exports = router;
