const express = require("express");
const router = express.Router();
const apiSchema = require("../models/apiSchema");
const endpointSchema = require("../models/endpointSchema");
const customSchema = require("../models/customSchema");
const { ObjectId } = require("mongodb");
const keySchema = require("../models/keySchema");

router.post("/apick", (req, res) => {
  const api = apiSchema(req.body);
  api
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

router.get("/apick", (req, res) => {
  apiSchema.find(req.query).then((data) => {
    res.json(data);
  });
});

const getCustoms = (id, method) => {
  return new Promise((resolve) => {
    customSchema
      .findOne({ idEndpoint: id, method: method })
      .then((data) => {
        return resolve(data);
      })
      .catch((err) => {
        return err;
      });
  });
};

const getEndpointId = (title, endpoint, method) => {
  return new Promise((resolve) => {
    endpointSchema
      .findOne(
        {
          title: title,
          endpoint: endpoint,
          active: true,
          methods: method,
        },
        { _id: 1 }
      )
      .then((data) => {
        let objectId = data._id;
        let id = objectId.toString();
        return id;
      })
      .then(async (id) => {
        let customs = await getCustoms(id, "GET");
        return resolve(customs);
      })
      .catch((err) => {
        return false;
      });
  });
};
const getRandomElements = (array, count) => {
  const randomArray = [...array];
  const randomElements = [];
  if (count > array.length) {
    return randomElements;
  }

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * randomArray.length);
    const randomElement = randomArray.splice(randomIndex, 1)[0];
    randomElements.push(randomElement);
  }

  return randomElements;
};

router.get("/apick/:id/:endpoint", (req, res) => {
  const API_KEY = req.get("Authorization");
  const id = req.params.id;
  const endpoint = req.params.endpoint;
  const queries = req.query;
  const noLimit = 2147483647;
  let projection = {
    _id: 0,
    "docs.$": 1,
  };
  let authorized;
  keySchema
    .findOne({ apiId: id })
    .then((result) => {
      authorized =
        !result.keyEnabled ||
        result.keys.find((e) => e.key === API_KEY) ||
        false;
    })
    .then(() => {
      if (authorized) {
        apiSchema
          .findOne({ _id: id, "endpoint.endpoint": endpoint, active: true })
          .then((data) => {
            const endpointContainsMethod = data.endpoint.find(
              (e) =>
                e.endpoint === endpoint && e.methods.find((x) => x === "GET")
            );
            let searchFilter = {
              title: data.title,
              endpoint: endpoint,
              active: true,
              methods: "GET",
              docs: { $elemMatch: queries },
            };
            if (endpointContainsMethod) {
              let id = getEndpointId(data.title, endpoint, "GET");
              id.then((customs) => {
                let limit = customs ? (customs.limitDocuments ? limit : noLimit) : noLimit;
                let random = customs ? customs.randomResponse : false;
                let projectionStatus =customs? ((customs.queryParameters && Object.keys(queries).length>0) ? true : false) : false;
                endpointSchema
                  .find(searchFilter, projectionStatus ? projection : {})
                  .then((endpointData) => {
                    
                    let docs = endpointData[0].docs;
                    if(limit<docs.length){
                      random
                      ? (docs = getRandomElements(docs, limit))
                      : false;
                    }
                    res.json(docs);
                  })
                  .catch((err) => {
                    res.json(err);
                  });
              });
            } else {
              res.json({ message: "Method not allowed" });
            }
          })
          .catch(() => {
            res.json({ message: "Failed attempt to find api" });
          });
      } else {
        res.json({ message: "Private resource" });
      }
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
router.put("/apick", async (req, res) => {
  try {
    const dataOriginal = { ...req.body.apickDataOriginal };
    const dataModified = { ...req.body.apickDataModified };
    let originalTitle = dataOriginal.title;
    delete dataOriginal._id;
    delete dataModified._id;
    if(dataOriginal.title === dataModified.title){
      delete dataOriginal.title
      delete dataModified.title
    }
    const promises = dataOriginal.endpoint.map(async (analized, i) => {
      const endpointOriginal = analized.endpoint;
      console.log(endpointOriginal)
      let newEndpoint = {
        ...dataModified.endpoint[i],
        title: dataModified.title,
      };
      
      if(originalTitle === dataModified.title){
        newEndpoint = {
          ...dataModified.endpoint[i]
        };
      }
      const actualization = { $set: newEndpoint };
      await endpointSchema.updateOne(
        { title: originalTitle, endpoint: endpointOriginal },
        actualization
      );
    });

    await Promise.all(promises);

    const actualization = { $set: dataModified };
    const result = await apiSchema.updateOne({ title: originalTitle }, actualization);

    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const haveSameStructure = (obj1, obj2) => {
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
};

router.post("/apick/:id/:endpoint", (req, res) => {
  const API_KEY = req.get("Authorization");
  const id = req.params.id;
  const endpoint = req.params.endpoint;
  let struct;
  let apiTitle;
  let authorized;
  keySchema
    .findOne({ apiId: id })
    .then((result) => {
      authorized =
        !result.keyEnabled ||
        result.keys.find((e) => e.key === API_KEY) ||
        false;
    })
    .then(() => {
      if (authorized) {
        apiSchema.findOne({ _id: id, active: true }).then((data) => {
          apiTitle = data.title;
          endpointSchema
            .findOne({ title: apiTitle, endpoint: endpoint })
            .then((endpointData) => {
              struct = endpointData.docs[0];
              delete req.body._id;
              delete struct._id;
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
                    if (data.modifiedCount) {
                      res.json({ inserted: true });
                    } else {
                      res.json({ message: "Method not allowed" });
                    }
                  })
                  .catch((err) => {
                    res.json("Failed petition");
                  });
              } else {
                res.json({ error: "Request body error" });
              }
            });
        });
      } else {
        res.json({ message: "Private resource" });
      }
    });
});

module.exports = router;
