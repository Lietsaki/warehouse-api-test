const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    last_updated: Number,
    last_updated_by: String
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('Article', articleSchema)
