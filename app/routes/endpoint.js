const express = require("express");
const router = express.Router();
const endpointSchema = require("../models/endpointSchema");
const { ObjectId } = require("mongodb");

router.post("/endpoint", (req, res) => {
  const endpoint = endpointSchema(req.body);
  console.log(endpoint);
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
  const id = req.params.id;
  const objectId = new ObjectId(id);
  endpointSchema.findOne({ _id: objectId, active: true }).then((data) => {
    res.json(data.docs);
  })
  .catch(() => res.status(400).json({ message: "Error" }));
});

module.exports = router;
