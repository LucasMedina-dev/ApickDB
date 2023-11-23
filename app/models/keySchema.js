const mongoose = require("mongoose");
const keys = new mongoose.Schema({
  user: {
    type: String
  },
  key: {
    type: String
  },
});
const keySchema = mongoose.Schema({
  apiId: { type: String, required: true},
  keyEnabled: { type: Boolean, required: true },
  keys: { type: [keys]},
});

module.exports = mongoose.model("keys", keySchema);
