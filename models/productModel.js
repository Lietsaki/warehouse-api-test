const mongoose = require('mongoose')

// ! use a pre-save hook to validate the structure of contain articles
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    contain_articles: Array,
    last_updated: Number,
    last_updated_by: String
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('Product', productSchema)
