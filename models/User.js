const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  pay: {
    type: Number,
    required: false,
  },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
