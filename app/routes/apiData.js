const express = require("express");
const router = express.Router();
const apiSchema = require("../models/apiSchema");
const endpointSchema = require("../models/endpointSchema");
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");

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
    .find({ _id: id, "endpoint.endpoint": endpoint, active: true })
    .then((data) => {
      const endpointContainsMethod = data[0].endpoint.find((e) =>
        e.methods.find((e) => e === "GET")
      );
      if (endpointContainsMethod) {
        endpointSchema
          .find({
            title: data[0].title,
            endpoint: endpoint,
            active: true,
            methods: "GET",
          })
          .then((endpointData) => {
            res.json(endpointData[0].docs);
          })
          .catch((err) => {
            res.json(err);
          });
      } else {
        res.json({ message: "denied request" });
      }
    })
    .catch(() => {
      res.json({ message: "denied request" });
    });
});
router.put("/apick/:id", (req, res) => {
  const id = req.params.id;
  const status = req.body.active;
  const objectId = new ObjectId(id);
  apiSchema
    .updateOne({ _id: objectId }, { $set: { active: status } })
    .then((data) => {
      res.json(data);
    });
});
router.delete("/apick", (req, res) => {
  const titleToDelete = req.body.title;
  if (titleToDelete != "") {
    apiSchema
      .deleteOne({ title: titleToDelete })
      .then(() => {
        endpointSchema
          .deleteMany({ title: titleToDelete })
          .then((data) => res.json(data))
          .catch((err) => res.json({ message: err }));
      })
      .catch((err) => res.json({ message: err }));
  } else {
    res.json({ message: "not a valid title" });
  }
});
router.put("/apick", (req, res) => {
  const dataOriginal = { ...req.body.apickDataOriginal };
  const dataModified = { ...req.body.apickDataModified };
  const originalTitle = dataOriginal.title;
  delete dataOriginal._id;
  delete dataModified._id;
  let i = 0;
  for (analized of dataOriginal.endpoint) {
    let endpointOriginal = analized.endpoint;
    let newEndpoint = {
      ...dataModified.endpoint[i],
      title: dataModified.title,
    };
    const actualization = { $set: newEndpoint };
    endpointSchema
      .updateOne(
        { title: originalTitle, endpoint: endpointOriginal },
        actualization
      )
      .then()
      .catch((err) => console.log("error" + err));
    i++;
  }

  const actualization = { $set: dataModified };
  apiSchema
    .updateOne({ title: originalTitle }, actualization)
    .then((data) => res.json(data))
    .catch((err) => console.log("error" + err));
});


const haveSameStructure= (obj1, obj2)=> {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!obj2.hasOwnProperty(key)) {
      return false;
    }

    if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      if (!haveSameStructure(obj1[key], obj2[key])) {
        return false;
      }
    }
  }

  return true;
}

router.post("/apick/:id/:endpoint", (req, res) => {
  const id = req.params.id;
  const endpoint = req.params.endpoint;
  let struct;
  let apiTitle;

  apiSchema.findOne({ _id: id, active: true }).then((data) => {
    apiTitle = data.title;
    endpointSchema
      .findOne({ title: apiTitle, endpoint: endpoint })
      .then((endpointData) => {
        struct = endpointData.docs[0];
        delete req.body._id;
        delete struct._id
        let validation = haveSameStructure(req.body, struct);
        if (validation) {
          const newObject = req.body;

          endpointSchema
            .updateOne(
              {
                title: apiTitle,
                endpoint: endpoint,
                active: true,
                methods: "POST",
              },
              { $push: { docs: newObject } }
            )
            .then((data) => {
              res.json(data);
            })
            .catch((err) => {
              res.json("Failed petition");
            });
        } else {
          res.status(400).json({ error: "request body error" });
        }
      });
  });
});

module.exports = router;
