const express = require("express");
const router = express.Router();
const apiSchema = require("../models/apiSchema");
const endpointSchema = require("../models/endpointSchema");
const customSchema = require("../models/customSchema");
const { ObjectId } = require("mongodb");
const keySchema = require("../models/keySchema");
const corsMiddleware=(req, res, next, ) => {
  const origin=req.headers.origin
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  origin==='http://localhost:4200' ? next() : res.status(403).json({error:"Forbidden"})
}
const everyCanUse=(req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  next();
}

// -------------------------------------------------------------------------------------------------------------------------------EXTRA FUNCTIONS
const getCustoms = async (id, method) => {
  try {
    const data = await customSchema.findOne({ idEndpoint: id, method });
    return data;
  } catch (error) {
    console.error("Error al solicitar customs", error.message);
    throw error;
  }
};

const getEndpointId = (title, endpoint, method) => {
  return new Promise(async (resolve) => {
    try {
      const data = await endpointSchema.findOne(
        {
          title: title,
          endpoint: endpoint,
          active: true,
          methods: method,
        },
        { _id: 1 }
      )
      let objectId = data._id;
      let id = objectId.toString();
      let customs = await getCustoms(id, "GET");
      resolve(customs);
    } catch (error) {
      console.error(error);
      res.status(error.statusCode).json({ message: "Failed to find endpoint or custom." });
    }

  });
};
const getRandomElements = (array, count) => {
  const randomArray = [...array];
  const randomElements = [];
  if (count > array.length) {
    count = array.length
  }
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * randomArray.length);
    const randomElement = randomArray.splice(randomIndex, 1)[0];
    randomElements.push(randomElement);
  }
  return randomElements;
};

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


// ------------------------------------------------------------------------------------------------------------------------------ROUTE /APICK

const getApick = async (req, res) => {
  try {
    const api = await apiSchema.find(req.query)
    res.json(api);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to find apick data." });
  }
}

const postApick = async (req, res) => {
  try {
    const data = await apiSchema(req.body).save();
    res.json(data);
  } catch (error) {
    console.error("Error in /apick:", error.message);
    const statusCode = error.statusCode || 500;
    let errorMessage = "There is something wrong that is not right.";
    if (error.name === 'ValidationError') {
      errorMessage = "Error de validación. Verifique los datos enviados.";
    } else if (error.name === 'MongoError' && error.code === 11000) {
      statusCode = 409;
      errorMessage = "Ya existe un registro con esos datos.";
    }
    res.status(statusCode).json({ message: errorMessage });
  }
}

const updateApick = async (req, res) => {
  try {
    delete req.body.apickDataOriginal._id;
    const dataOriginal = { ...req.body.apickDataOriginal };
    const dataModified = { ...req.body.apickDataModified };
    const originalTitle = dataOriginal.title;

    await dataOriginal.endpoint.map(async (analized, i) => {
      const endpointOriginal = analized.endpoint;
      const newEndpoint = { ...dataModified.endpoint[i], title: dataModified.title };
      const actualization = { $set: newEndpoint };
      try {
        await endpointSchema.updateOne({ title: originalTitle, endpoint: endpointOriginal }, actualization);
      } catch (error) {
        console.error(error);
        res.status(error.statusCode).json({ message: "Failed to update endpoint." });
      }
    });
    const actualization = { $set: dataModified };
    const result = await apiSchema.updateOne({ title: originalTitle }, actualization);
    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const deleteApick = async (req, res) => {
  const titleToDelete = req.body.title;
  try {
    if (titleToDelete != "") {
      try {
        await apiSchema.deleteOne({ title: titleToDelete })
      } catch (error) {
        console.error(error);
        res.status(error.statusCode).json({ message: "There is something wrong that is not right." });
      }
      try {
        await endpointSchema.deleteMany({ title: titleToDelete })
        res.json({ flag: true })
      } catch (error) {
        console.error(error);
        res.status(error.statusCode).json({ message: "There is something wrong that is not right." });
      }
    } else {
      res.json({ message: "Not a valid Apick to delete" });
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "There is something wrong that is not right." });
  }

}

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /APICK/:ID

const switchApickStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.active;
    const objectId = new ObjectId(id);
    const apickData = await apiSchema.updateOne({ _id: objectId }, { $set: { active: status } })
    res.json(apickData);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "There is something wrong that is not right." });
  }
}
// ------------------------------------------------------------------------------------------------------------------------------ROUTE /APICK/:ID/:ENDPOINT

const getEndpointData = async (req, res) => {
  const API_KEY = req.get("Authorization");
  const id = req.params.id;
  const endpoint = req.params.endpoint;
  const queries = req.query;
  const noLimit = 2147483647;
  let projection = { _id: 0, "docs.$": 1 };
  try {
    const key = await keySchema.findOne({ apiId: id })
    const havePermission = !key.keyEnabled || key.keys.find((e) => e.key === API_KEY) || false;
    if (havePermission) {
      const findedApick = await apiSchema.findOne({ _id: id, "endpoint.endpoint": endpoint, active: true })
      const endpointContainsMethod = findedApick.endpoint.find((e) => e.endpoint === endpoint && e.methods.find((x) => x === "GET"));
      let searchFilter = {
        title: findedApick.title,
        endpoint: endpoint,
        active: true,
        methods: "GET",
        docs: { $elemMatch: queries }
      };
      if (endpointContainsMethod) {
        let limit
        let random
        let projectionStatus
        try {
          const customs = await getEndpointId(findedApick.title, endpoint, "GET");
          limit = customs ? customs.limitDocuments : noLimit;
          random = customs ? customs.randomResponse : false;
          projectionStatus = customs ? (customs.queryParameters && Object.keys(queries).length > 0) : false;
        } catch (error) {
          console.error(error);
          res.status(error.statusCode).json({ message: "Failed to get customs at fetching endpoint data." });
        }
        if (!projectionStatus) {
          delete searchFilter.docs
        }
        let endpointData = await endpointSchema.find(searchFilter, projectionStatus ? projection : {});
        if (endpointData.length > 0) {
          const docs = random ? (getRandomElements(endpointData[0].docs, limit || endpointData[0].docs.length)) : endpointData[0].docs.slice(0, limit || noLimit);
          res.json(docs);
        } else {
          res.json({ message: "Not document matched" })
        }
      } else {
        res.json({ message: "Method not allowed" });
      }
    } else {
      res.json({ message: "Private resource" });
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "There is something wrong that is not right." });
  }
}
const postDocuments = async (req, res) => {
  const API_KEY = req.get("Authorization");
  const id = req.params.id;
  const endpoint = req.params.endpoint;
  try {
    const key = keySchema.findOne({ apiId: id })
    const havePermission = !key.keyEnabled || key.keys.find((e) => e.key === API_KEY) || false;
    if (havePermission) {
      const apickData = await apiSchema.findOne({ _id: id, active: true })
      const apickTitle = apickData.title;
      const endpointData = await endpointSchema.findOne({ title: apickTitle, endpoint: endpoint })
      const example = endpointData.docs[0];
      delete example._id;
      if (haveSameStructure(req.body, example)) {
        const newObject = req.body;
        const endpointUpdate = await endpointSchema.updateOne(
          {
            title: apickTitle,
            endpoint: endpoint,
            active: true,
            methods: "POST",
          },
          { $push: { docs: newObject } }
        )
        if (endpointUpdate.modifiedCount) {
          res.json({ inserted: true });
        } else {
          res.json({ message: "Method not allowed" });
        }
      } else {
        res.json({ error: "Bad request, check body request" });
      }
    } else {
      res.json({ message: "Private resource" });
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Error while creating endpoint." });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTES

router.get("/apick", corsMiddleware, getApick);
router.post("/apick", corsMiddleware, postApick);
router.put("/apick", corsMiddleware, updateApick);
router.delete("/apick", corsMiddleware, deleteApick);

router.put("/apick/:id", corsMiddleware, switchApickStatus);

router.get("/apick/:id/:endpoint", everyCanUse, getEndpointData);
router.post("/apick/:id/:endpoint", everyCanUse, postDocuments);

module.exports = router;