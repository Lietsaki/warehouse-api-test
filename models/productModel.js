const mongoose = require('mongoose')

const productModel = new mongoose.Schema(
  {
    name: String,
    contain_articles: Array,
    last_updated: Number,
    last_updated_by: String
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('Product', productModel)
