const express = require('express')
const {
  verifyJWT,
  checkEmail,
  registerUser,
  loginUser
} = require('./controllers/authController')
const { validateUserData } = require('./utils/validators')
const {
  catchAsync,
  getEntity,
  getOne,
  getAll,
  createOne,
  updateOne,
  deleteOne,
  redirectRoute
} = require('./controllers/handlerFactory')

const router = express.Router()

// AUTH ROUTES
router.post('/register', validateUserData, checkEmail, registerUser)
router.post('/login', loginUser)
router.post('/user', redirectRoute('/register'))

// CRUD ROUTES
router.get('/:entity', getEntity, catchAsync(getAll))
router.get('/:entity/:id', getEntity, catchAsync(getOne))

// All routes require a JWT in order to be accessed from this point
router.use(verifyJWT)
router.post('/:entity', getEntity, catchAsync(createOne))
router.patch('/:entity/:id', getEntity, catchAsync(updateOne))
router.delete('/:entity/:id', getEntity, catchAsync(deleteOne))

module.exports = router
