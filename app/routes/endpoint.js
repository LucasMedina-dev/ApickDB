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

module.exports = router;
