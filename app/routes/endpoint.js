const express = require("express");
const router = express.Router();
const endpointSchema = require("../models/endpointSchema");

router.post("/endpoint", (req, res) => {
  const endpoint = endpointSchema(req.body);
  console.log(endpoint);
  endpoint
    .save()
    .then((data) => res.json(data))
    .catch((err) => res.json({ message: err }));
});
router.get("/endpoint", (req, res) => {
  let title= req.query.title;
  let endpoint= req.query.endpoint

  endpointSchema.findOne(req.query, {_id:1}).then((data) => {
    res.json(data);
  });
});


module.exports = router;
