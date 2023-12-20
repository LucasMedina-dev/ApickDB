const express = require("express");
const router = express.Router();
const customSchema = require("../models/customSchema");
const { ObjectId } = require("mongodb");

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /CUSTOM
const getCustom=async (req, res) => {
  let id = req.query.id;
  let method = req.query.method;
  const newCustom = customSchema({
    idEndpoint: id,
    method: method,
    queryParameters: true,
    limitDocuments: 0,
    randomResponse: false,
  });
  try {
    const findCustom = await customSchema.findOne({ idEndpoint: id, method: method })
    if (!findCustom) {
      const newCustomData = await newCustom.save()
      res.json(newCustomData)
    } else {
      res.json(findCustom);
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to get custom." });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /CUSTOM/:ID
const updateCustom= async (req, res) => {
  const id = req.params.id;
  const customizerData = req.body;
  const objectId = new ObjectId(id);
  try {
    const data = await customSchema.updateOne({ _id: objectId }, { $set: customizerData })
    res.json(data)
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to update custom." });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTES

router.get("/custom", getCustom);
router.put("/custom/:id", updateCustom);

module.exports = router;
