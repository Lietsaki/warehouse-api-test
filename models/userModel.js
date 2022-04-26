const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    surname: String,
    email: String,
    password: {
      type: String,
      required: true,
      select: false,
      min: 8,
      max: 60
    },
    role: {
      type: String,
      required: true,
      enum: ['operator', 'manager']
    },
    last_updated: Number
  },
  { strict: true, versionKey: false }
)

// Hash passwords in a pre-save middleware (applies to .create and .save mongoose methods). This keyword refers to the document.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()

  try {
    this.password = await bcrypt.hash(this.password, 12)
  } catch (error) {
    return next('An error occurred while saving your password.')
  }

  next()
})

module.exports = mongoose.model('User', userSchema)
