const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')

exports.verifyJWT = async (req, res, next) => {
  // We expect an authorization header with the form of: Authorization: <type> <token>,
  if (!req.header('Authorization')) {
    return res
      .status(401)
      .json({ error: 'Missing Authorization header. Access denied.' })
  }

  const token = req.header('Authorization').replace('Bearer ', '')

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload._id).lean().select('_id')
    if (!user) {
      return res
        .status(500)
        .json({ error: 'User not found, please log in again.' })
    }
    req.user_id = payload._id
    next()
  } catch (err) {
    res.status(400).json({ error: 'Invalid auth token' })
  }
}

exports.checkEmailDuplicity = async (req, res, next) => {
  const email_exists = await User.findOne({ email: req.body.email }).lean()

  if (email_exists) {
    return res.status(400).json({ message: 'Email already exists.' })
  }
  return next()
}

exports.registerUser = async (req, res, next) => {
  const created_user = await User.create({
    ...req.body,
    last_updated: Date.now()
  })

  return res.status(201).json({
    message: `User created successfully.`,
    created_user: { ...created_user._doc, password: undefined }
  })
}

exports.loginUser = async (req, res) => {
  // 1) Check if the user exists - Use .select to bring his password, otherwise user.password will be undefined and bcrypt will throw an error
  const user = await User.findOne({ email: req.body.email })
    .select('+password')
    .lean()

  if (!user) {
    return res.status(400).json({ message: 'Wrong email or password.' })
  }

  // 2) Check if the password is valid
  const valid_pass = await bcrypt.compare(req.body.password, user.password)
  if (!valid_pass) return res.status(401).json({ error: 'Invalid password' })

  // 3) Sign a JWT with the user id as payload and send it as a header and in the response as well
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

  res
    .status(200)
    .header('Authentication', `Bearer ${token}`)
    .json({
      message: 'success',
      token,
      user: {
        ...user,
        password: undefined
      }
    })
}
