const mongoose = require('mongoose')

const userModel = new mongoose.Schema(
  {
    name: String,
    surname: String,
    birthdate: Number,
    role: {
      type: String,
      required: true,
      enum: ['operator', 'manager']
    },
    last_updated: Number
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('User', userModel)
