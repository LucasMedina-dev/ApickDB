const mongoose = require("mongoose");
const keys = new mongoose.Schema({
  user: {
    type: String,
    unique: true
  },
  key: {
    type: String,
    unique: true
  },
});
const keySchema = mongoose.Schema({
  apiId: { type: String, required: true, unique: true },
  keyEnabled: { type: Boolean, required: true },
  keys: { type: [keys], required: true, unique: true },
});

module.exports = mongoose.model("keys", keySchema);
