const mongoose = require('mongoose')

const articleModel = new mongoose.Schema(
  {
    name: String,
    stock: Number,
    last_updated: Number,
    last_updated_by: String
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('Article', articleModel)
