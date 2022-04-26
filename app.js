require('dotenv').config({ path: `${__dirname}/config.env` })
const express = require('express')

const cors = require('cors')
const morgan = require('morgan')

// Import routes
const { crudRouter, authRouter } = require('./routes')

const app = express()
// Trust proxies (for Heroku)
app.enable('trust proxy')

// Middleware
app.use(cors())
app.use(
  express.json({
    limit: '5mb'
  })
)

// Development logging with Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Main route middlewares
app.use('/', crudRouter)
app.use('/user', authRouter)

// Catch all route. Whatever we pass into next, express will assume it's an error.
app.all('*', (req, res, next) => {
  next(`Can't find ${req.originalUrl} on this server!`)
})

module.exports = app
