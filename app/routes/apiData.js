const express = require("express");
const router = express.Router();
const apiSchema = require("../models/apiSchema");
const endpointSchema = require("../models/endpointSchema");
const { ObjectId } = require('mongodb');

router.post("/apick", (req, res) => {
  const api = apiSchema(req.body);
  api
    .save()
    .then((data) => res.json(data))
    .catch((err) => res.json({ message: err }));
});

router.get("/apick", (req, res) => {
  apiSchema.find(req.query).then((data) => {
    res.json(data);
  });
});

router.get("/apick/:id/:endpoint", (req, res) => {
  const id = req.params.id;
  const endpoint = req.params.endpoint;
  apiSchema
    .find({ _id: id, "endpoint.endpoint": endpoint, active:true })
    .then((data) => {
      const endpointContainsMethod = data[0].endpoint.find((e) =>
        e.methods.find((e) => e === "GET")
      );
      if (endpointContainsMethod) {
        endpointSchema
          .find({ title: data[0].title, endpoint: endpoint, active: true })
          .then((endpointData) => {
            res.json(endpointData[0].docs);
          })
          .catch((err) => {
            res.json(err);
          });
      } else {
        res.json({ message: "Recurso no permitido" });
      }
    })
    .catch((err) => {
      res.json(err);
    });
});
router.put("/apick/:id", (req, res) => {
  const id = req.params.id;
  const status = req.body.active;
  const objectId = new ObjectId(id);
  //console.log(objectId)
  apiSchema
  .updateOne(
    { _id: objectId },
    { $set: { active: status } }
 ).then(()=>{
    res.json({status:true})
 })
});


module.exports = router;
