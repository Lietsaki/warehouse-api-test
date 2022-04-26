const mongoose = require('mongoose')

// ! use a pre-save hook to validate the structure of contain articles
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    contain_articles: {
      type: Array,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: (props) => `${props.value} must be an array!`
      }
    },
    last_updated: Number,
    last_updated_by: String
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('Product', productSchema)
