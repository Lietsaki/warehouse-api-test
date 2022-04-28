const Article = require('../models/articleModel')
const Product = require('../models/productModel')

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

exports.validateMinArtNumber = (req, res, next) => {
  req.entity = Product
  if (req.method === 'PATCH' && req.body.contain_articles === undefined) {
    return next()
  }

  const min_articles_per_product = 2
  const is_falsy = !req.body.contain_articles
  const is_not_array = !Array.isArray(req.body.contain_articles)
  const insufficient_articles =
    Array.isArray(req.body.contain_articles) &&
    req.body.contain_articles.length < min_articles_per_product

  if (is_falsy) {
    return res.status(400).json({
      message: `'contain_articles' array is missing. A product must be composed of at least one article.`
    })
  }

  if (is_not_array || insufficient_articles) {
    return res.status(400).json({
      message: `'contain_articles' must be an array with at least ${min_articles_per_product} articles.`
    })
  }
  return next()
}

exports.validateArticleStructure = (req, res, next) => {
  if (req.method === 'PATCH' && req.body.contain_articles === undefined) {
    return next()
  }

  const contained_article = {
    amount_of: 'number',
    art_id: 'string'
  }

  const filtered_arts = []

  for (const article of req.body.contain_articles) {
    const filtered_art = {}

    for (const key of Object.keys(contained_article)) {
      if (typeof article[key] !== contained_article[key]) {
        return res.status(400).json({
          message: 'Malformed contained article.',
          malformed_article: article
        })
      }

      filtered_art[key] = article[key]
    }

    filtered_arts.push(filtered_art)
  }

  return next()
}

exports.validateArticleExistence = async (req, res, next) => {
  if (req.method === 'PATCH' && req.body.contain_articles === undefined) {
    return next()
  }

  const existing_arts_promise = req.body.contain_articles.map((article) =>
    Article.findOne({ _id: article.art_id }).lean().select('_id')
  )

  try {
    const existing_arts = await Promise.all(existing_arts_promise)

    for (let i = 0; i < existing_arts.length; i++) {
      if (existing_arts[i] === null) {
        return res.status(400).json({
          message: 'Provided article id was not found.',
          article_not_found: req.body.contain_articles[i]
        })
      }
    }
  } catch (error) {
    if (error.kind === 'ObjectId' && error.path === '_id') {
      return res
        .status(500)
        .json({ error: 'Invalid ID received.', id: error.stringValue })
    }
    return res.status(500).json({ error: error.message || error })
  }

  return next()
}
