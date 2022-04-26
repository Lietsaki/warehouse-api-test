/* eslint-disable no-console */
const mongoose = require('mongoose')
require('dotenv').config({ path: `${__dirname}/config.env` })
const app = require('./app')

// Connect to the db - The passed options deal with mongoose deprecation warnings
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const port = process.env.PORT
const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.once('open', () => console.log('Connected to DB'))

console.log('hello')

const server = app.listen(port, () =>
  console.log(`Server started on port ${port}...`)
)

// Handle errors in synchronous code.
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION | shutting down...')
  console.log(err)
  process.exit(1)
})

// Handle errors in async code
process.on('unhandledRejection', (err) => {
  console.log('Unhandled promise rejection | Shutting down...')
  console.log(err)
  server.close(() => process.exit(1))
})

// Handle SIGTERM signal from Heroku
process.on('SIGTERM', () => {
  console.log('Sigterm received, shutting down gracefully...')
  server.close(() => console.log('Process terminated by SIGTERM signal.'))
})
