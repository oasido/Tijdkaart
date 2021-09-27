const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Setting = new Schema({
  by: {
    type: String,
    required: true,
  },
  pay: {
    type: Integer,
    required: true,
  },
});

module.exports = mongoose.model('Setting', Setting);
