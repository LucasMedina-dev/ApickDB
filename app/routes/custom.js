const express = require("express");
const router = express.Router();
const customSchema = require("../models/customSchema");
const { ObjectId } = require("mongodb");

router.get("/custom", (req, res) => {
  let id = req.query.id;
  let method = req.query.method;
  const newCustom = customSchema({
    idEndpoint: id,
    method: method,
    queryParameters: true,
    limitDocuments: 0,
    randomResponse: false,
  });
  customSchema
    .findOne({ idEndpoint: id, method: method })
    .then((data) => {
      if (!data) {
        newCustom
          .save()
          .then((data) => res.json(data))
          .catch((err) =>
            res
              .status(400)
              .json({ message: "Failed attempt to save new custom data" })
          );
      } else {
        res.json(data);
      }
    })
    .catch(() => {
      res.status(400).json({ message: "Can't find document" });
    });
});
router.put("/custom/:id", (req, res) => {
  const id = req.params.id;
  const customizerData = req.body;
  const objectId = new ObjectId(id);
  customSchema
    .updateOne({ _id: objectId }, { $set: customizerData })
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(400).json({ message: "Can't save document" });
    });
});
module.exports = router;
