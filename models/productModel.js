const { mongoose, Schema } = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    contain_articles: [
      {
        art_id: { type: Schema.Types.ObjectId, ref: 'Article' },
        amount_of: Number,
        _id: false
      }
    ],
    last_updated: Number,
    last_updated_by: String
  },
  { strict: true, versionKey: false }
)

module.exports = mongoose.model('Product', productSchema)
