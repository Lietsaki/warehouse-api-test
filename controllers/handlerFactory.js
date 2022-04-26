const Product = require('../models/productModel')
const Article = require('../models/articleModel')
const User = require('../models/userModel')
const { capitalizeStr } = require('../utils/helperFunctions')

const models = {
  Product,
  Article,
  User
}

exports.catchAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    return res.status(500).json({ error: error.message || error })
  }
}

// Get the entity passed in params and put it in req.entity
exports.getEntity = (req, res, next) => {
  if (!req.params.entity) {
    return res.status(400).json({ message: 'Endpoint does not exist' })
  }

  req.entity = models[capitalizeStr(req.params.entity)]

  if (!req.entity) {
    return res.status(400).json({ message: 'Endpoint does not exist' })
  }

  next()
}

exports.getOne = async (req, res) => {
  const item = await req.entity.findById(req.params.id).lean()
  if (!item) return res.status(404).json({ message: 'Item not found.' })
  return res.status(200).json(item)
}

exports.getAll = async (req, res) => {
  const entity_items = await req.entity.find().lean()

  return res.status(200).json({
    results_number: entity_items.length,
    results: entity_items
  })
}

exports.createOne = async (req, res) => {
  const results = await req.entity.create({
    ...req.body,
    last_updated: Date.now(),
    last_updated_by: req.user_id
  })
  return res.status(201).json({ message: 'success', created_item: results })
}

exports.updateOne = async (req, res, next) => {
  const updated_item = await req.entity.updateOne(
    { _id: req.params.id },
    {
      $set: {
        ...req.body,
        last_updated: Date.now(),
        last_updated_by: req.user_id
      }
    },
    { upsert: true }
  )

  return res.status(201).json({ message: 'success', updated_item })
}

exports.deleteOne = async (req, res, next) => {
  if (req.params.entity === User) {
    const user = await User.findById(req.params.id).lean()
    if (user._id !== req.user_id) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete other users' })
    }
  }

  await req.entity.deleteOne({ _id: req.params.id })
  res.status(201).json({ message: 'Succesfully deleted item.' })
}

// NOTE: The 307 HTTP code is used to preserve the type of request, if we omit it, a GET request will be made.
exports.redirectRoute = (route_to_redirect_to) => async (req, res, next) =>
  res.redirect(307, route_to_redirect_to)
