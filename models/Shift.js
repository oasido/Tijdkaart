const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Shift = new Schema({
  by: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: false,
  },
  comment: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Shift', Shift);
