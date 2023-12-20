const express = require("express");
const router = express.Router();
const keySchema = require("../models/keySchema");

// -------------------------------------------------------------------------------------------------------------------------------EXTRA FUNCTIONS
function generateRandomApiKey(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let apiKey = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    apiKey += characters.charAt(randomIndex);
  }

  return apiKey;
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /REGISTER
const createKey = async (req, res) => {
  const body = {
    apiId: req.body.apiId,
    keyEnabled: true,
    keys: []
  };
  try {
    const saveKey = await keySchema(body).save()
    res.json(saveKey)
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to create register for keys." });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /REGISTER
const generateKey = async (req, res) => {
  try {
    const apiId = req.params.apiId;
    const username = req.body.username;
    if (req.body.username) {
      const randomKey = generateRandomApiKey(32);
      const findedKey = await keySchema.findOne({ apiId: apiId, "keys.user": username })
      const finded = findedKey ? findedKey.keys.find((e) => e.user === username) : false;
      if (finded) {
        res.json(finded);
      }
      const newKey = { user: username, key: randomKey };
      try {
        await keySchema.updateOne({ apiId: apiId }, { $push: { keys: newKey } });
        res.json(newKey);
      } catch (error) {
        console.error(error);
        res.status(error.statusCode).json({ message: "Failed to generate a new key." });
      }
    } else {
      try {
        const key = await keySchema.findOne({ apiId: apiId })
        res.json({ keyEnabled: key.keyEnabled });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Key not finded." });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to find a key." });
  }
}
const getKey = async (req, res) => {
  try {
    const apiId = req.params.apiId;
    const username = req.query.username;
    const result = await keySchema.findOne({ apiId: apiId })
    const apiKey = username
      ? result.keys.find((e) => e.user === username)
      : false;
    if (apiKey) {
      res.json({
        keyEnabled: result.keyEnabled,
        username: username,
        apiKey: apiKey
      });
    } else {
      res.json({ keyEnabled: result.keyEnabled });
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to get key" });
  }
}
const switchRequiredKey = async (req, res) => {
  let apiId = req.params.apiId;
  let actualization = req.body.keyEnabled;
  try {
    const result = await keySchema.updateOne({ apiId: apiId }, { keyEnabled: actualization })
    if (result.modifiedCount) {
      res.json({ modified: true });
    } else {
      res.json({ modified: false });
    }
  } catch (error) {
    console.error(error);
    res.status(error.statusCode).json({ message: "Failed to switch keyEnabled." });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTES

router.post("/keys", createKey);
router.post("/keys/:apiId", generateKey);
router.get("/keys/:apiId", getKey);
router.put("/keys/:apiId", switchRequiredKey);

module.exports = router;
