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
    if (error.name === 'ValidationError') {
      const errors = {}

      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message
      })

      return res.status(400).send(errors)
    }
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
  let query = req.entity.findById(req.params.id).lean()
  if (req.query.populate) query = query.populate(req.query.populate)
  const item = await query

  if (!item) return res.status(404).json({ message: 'Item not found.' })
  return res.status(200).json(item)
}

exports.getAll = async (req, res) => {
  let query = req.entity.find().lean()
  if (req.query.populate) query = query.populate(req.query.populate)
  const entity_items = await query

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
  const item = await req.entity.findById(req.params.id)
  if (!item) return res.status(404).json({ message: 'Item not found' })

  Object.keys(req.body).forEach((key) => {
    item[key] = req.body[key]
  })

  await item.save()
  delete item._doc.password

  return res.status(201).json({
    message: 'Successfully updated document',
    item
  })
}

exports.deleteOne = async (req, res, next) => {
  await req.entity.deleteOne({ _id: req.params.id })
  res.status(201).json({ message: 'Succesfully deleted item.' })
}

// NOTE: The 307 HTTP code is used to preserve the type of request, if we omit it, a GET request will be made.
exports.redirectRoute = (route_to_redirect_to) => async (req, res, next) =>
  res.redirect(307, route_to_redirect_to)

exports.deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id).lean().select('_id')

  if (!user || user._id.toString() !== req.user_id) {
    return res
      .status(403)
      .json({ message: 'You are not authorized to delete other users' })
  }

  await User.deleteOne({ _id: req.params.id })
  res.status(201).json({ message: 'Succesfully deleted your account.' })
}

exports.sellProduct = async (req, res, next) => {
  const product = await Product.findById({ _id: req.params.id }).populate(
    'contain_articles.art_id'
  )
  if (!product) return res.status(404).json({ message: 'Product not found' })

  const promises = [Product.deleteOne({ _id: req.params.id })]

  for (const contained_art of product.contain_articles) {
    contained_art.art_id.stock -= contained_art.amount_of
    promises.push(contained_art.art_id.save())
  }

  await Promise.all(promises)

  return res
    .status(201)
    .json({ message: 'Product sold. Article stock has been subtracted.' })
}
