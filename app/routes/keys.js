const express = require("express");
const router = express.Router();
const keySchema = require("../models/keySchema");
const { ObjectId } = require("mongodb");

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
// hacer la ruta POST para guardar una nueva estructura para las api
router.post("/keys", (req, res) => {
  const body = {
    apiId: req.body.apiId,
    keyEnabled: true,
    keys: []
  };
  const newKey = keySchema(body);
  newKey
    .save()
    .then((result) => {
      res.json(result);
      console.log(result)
    })
    .catch((err) => {
        console.log(err)
      res.json(err);
    });
});
router.post("/keys/:apiId", async (req, res) => {
  try {
    const apiId = req.params.apiId;
    const username = req.body.username;
    if (req.body.username) {
      const key = generateRandomApiKey(32);
      const existingKey = await keySchema
        .findOne({
          apiId: apiId,
          "keys.user": username,
        })
        .then((result) => {
          let finded = result
            ? result.keys.find((e) => e.user === username)
            : false;
          return finded;
        });

      if (existingKey) {
        return res.json(existingKey);
      }
      const newKey = { user: username, key: key };
      await keySchema.updateOne({ apiId: apiId }, { $push: { keys: newKey } });

      res.json(newKey);
    } else {
      keySchema
        .findOne({ apiId: apiId })
        .then((result) => {
          res.json({ keyEnabled: result.keyEnabled });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Key not created" });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Key not created" });
  }
});
// hacer la ruta GET para obtener una key segun username, si no existe, la crea

// hacer la ruta GET para obtener si apiKey esta activado
// Se puede pasar por parametro username y va buscar la key
router.get("/keys/:apiId", (req, res) => {
  const apiId = req.params.apiId;
  const username = req.query.username;
  keySchema
    .findOne({ apiId: apiId, keyEnabled: true })
    .then((result) => {
      const apiKey = username
        ? result.keys.find((e) => e.user === username)
        : false;
      if (apiKey) {
        res.json({
          keyEnabled: result.keyEnabled,
          username: username,
          apiKey: apiKey,
        });
      } else {
        res.json({ keyEnabled: result.keyEnabled });
      }
    })
    .catch(() => {
      res.json({ error: "Api id not finded" });
    });
});

// hacer la ruta PUT para actualizar el apikey true o false
router.put("/keys/:apiId", (req, res) => {
  let apiId = req.params.apiId;
  let actualization = req.body.keyEnabled;
  keySchema
    .updateOne({ apiId: apiId }, { keyEnabled: actualization })
    .then((result) => {
      if (result.modifiedCount) {
        res.json({ modified: true });
      } else {
        res.json({ modified: false });
      }
    })
    .catch(() => {
      res.json({ error: "Api id not finded" });
    });
});
module.exports = router;
