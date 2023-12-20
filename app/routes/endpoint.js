const express = require("express");
const router = express.Router();
const endpointSchema = require("../models/endpointSchema");
const { ObjectId } = require("mongodb");
const apiSchema = require("../models/apiSchema");
const keySchema = require("../models/keySchema");

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /ENDPOINT
const createEndpoint = async (req, res) => {
  try {
    const endpoint = await endpointSchema(req.body).save()
    res.json(endpoint)
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to create endpoint." });
  }
}
const getEndpointId = async (req, res) => {
  try {
    const data = await endpointSchema.findOne(req.query, { _id: 1 })
    res.json(data)
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to get endpoint id." });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /ENDPOINT/:ID
const getEndpointData = async (req, res) => {
  const API_KEY = req.get("Authorization");
  const id = req.params.id;
  const objectId = new ObjectId(id);
  try {
    const findedEndpoint = await endpointSchema.findOne({ _id: objectId, active: true })
    const findedApi = await apiSchema.findOne({ title: findedEndpoint.title }, { _id: 1 })
    let resultId = findedApi._id;
    const key = await keySchema.findOne({ apiId: resultId })
    let exists = key.keyEnabled ? key.keys.find((e) => e.key === API_KEY) : true;
    if (exists && !key.keyEnabled) {
      res.json(findedEndpoint.docs);
    } else {
      res.json({ message: "You need API KEY" })
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to get endpoint data." });
  }
}
// ------------------------------------------------------------------------------------------------------------------------------ROUTES
router.post("/endpoint", createEndpoint);
router.get("/endpoint", getEndpointId);
router.get("/endpoint/:id", getEndpointData)

module.exports = router;
