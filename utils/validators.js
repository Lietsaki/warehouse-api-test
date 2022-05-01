const Article = require('../models/articleModel')
const Product = require('../models/productModel')
const User = require('../models/userModel')

const isValidEmail = (str) => {
  const email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return email_regex.test(str)
}

exports.validateUserData = (req, res, next) => {
  const mandatory_fields = ['name', 'email', 'password']

  for (const field of mandatory_fields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `Missing field: ${field}` })
    }
  }

  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ message: 'Invalid email.' })
  }

  next()
}

const validateMinArtNumber = (product) => {
  const min_articles_per_product = 2
  const is_falsy = !product.contain_articles
  const is_not_array = !Array.isArray(product.contain_articles)
  const insufficient_articles =
    Array.isArray(product.contain_articles) &&
    product.contain_articles.length < min_articles_per_product

  if (is_falsy) {
    return {
      code: 400,
      body: {
        message: `'contain_articles' array is missing. A product must be composed of at least one article.`
      }
    }
  }

  if (is_not_array || insufficient_articles) {
    return {
      code: 400,
      body: {
        message: `'contain_articles' must be an array with at least ${min_articles_per_product} articles.`
      }
    }
  }

  return true
}

const validateArticleStructure = (product) => {
  const contained_article = ['amount_of', 'art_id']

  for (const article of product.contain_articles) {
    for (const key of contained_article) {
      if (!article[key]) {
        return {
          code: 400,
          body: {
            message: `Malformed contained article. A required property is missing or falsy (and it shouldn't be).`,
            malformed_article: article
          }
        }
      }
    }
  }

  return true
}

const validateArticleExistence = async (articles_to_find) => {
  const existing_arts_promise = articles_to_find.map((article) =>
    Article.findOne({ _id: article.art_id }).lean().select('_id')
  )

  try {
    const existing_arts = await Promise.all(existing_arts_promise)

    for (let i = 0; i < existing_arts.length; i++) {
      if (existing_arts[i] === null) {
        return {
          code: 404,
          body: {
            message: 'Provided article id was not found.',
            article_not_found: articles_to_find.contain_articles[i]
          }
        }
      }
    }
  } catch (error) {
    if (error.kind === 'ObjectId' && error.path === '_id') {
      return {
        code: 500,
        body: {
          message: 'Invalid article _id received.',
          id: error.stringValue
        }
      }
    }
    return {
      code: 500,
      body: { message: error.message || error }
    }
  }

  return true
}

exports.performProductValidation = async (req, res, next) => {
  req.entity = Product
  const product = req.body

  if (req.method === 'PATCH' && product.contain_articles === undefined) {
    return next()
  }

  const min_art_number_result = validateMinArtNumber(product)
  if (min_art_number_result !== true) {
    return res
      .status(min_art_number_result.code)
      .json(min_art_number_result.body)
  }

  const article_structure_result = validateArticleStructure(product)
  if (article_structure_result !== true) {
    return res
      .status(article_structure_result.code)
      .json(article_structure_result.body)
  }

  const article_structure_existence = await validateArticleExistence(
    product.contain_articles
  )
  if (article_structure_existence !== true) {
    return res
      .status(article_structure_existence.code)
      .json(article_structure_existence.body)
  }

  return next()
}

exports.validateInsertMany = async (req, res, next) => {
  if (req.entity === User) {
    return res
      .status(400)
      .json({ message: 'You cannot insert users in batch!' })
  }

  if (!req.body.items) {
    return res.status(400).json({ message: "'items' array is missing!" })
  }

  return next()
}

exports.validateManyProducts = async (req, res, next) => {
  req.entity = Product
  const products = req.body.items
  if (!products) {
    return res.status(400).json({
      message:
        "'items' array is missing. This is where all your product objects must be."
    })
  }

  for (const product of products) {
    const min_art_number_result = validateMinArtNumber(product)
    if (min_art_number_result !== true) {
      return res
        .status(min_art_number_result.code)
        .json(min_art_number_result.body)
    }

    const article_structure_result = validateArticleStructure(product)
    if (article_structure_result !== true) {
      return res
        .status(article_structure_result.code)
        .json(article_structure_result.body)
    }
  }

  const all_product_articles = products
    .map((product) => product.contain_articles)
    .flat()

  const article_structure_existence = await validateArticleExistence(
    all_product_articles
  )
  if (article_structure_existence !== true) {
    return res
      .status(article_structure_existence.code)
      .json(article_structure_existence.body)
  }

  return next()
}
