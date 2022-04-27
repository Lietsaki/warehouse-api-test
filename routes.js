const express = require('express')
const {
  verifyJWT,
  checkEmailDuplicity,
  registerUser,
  loginUser
} = require('./controllers/authController')
const {
  validateUserData,
  validateMinArtNumber,
  validateArticleStructure,
  validateArticleExistence
} = require('./utils/validators')
const {
  catchAsync,
  getEntity,
  getOne,
  getAll,
  createOne,
  updateOne,
  deleteOne,
  redirectRoute,
  deleteUser
} = require('./controllers/handlerFactory')

const router = express.Router()

// AUTH ROUTES
router.post(
  '/register',
  validateUserData,
  checkEmailDuplicity,
  catchAsync(registerUser)
)
router.post('/login', loginUser)
router.post('/user', redirectRoute('/v1/register'))

// CRUD ROUTES
router.get('/:entity', getEntity, catchAsync(getAll))
router.get('/:entity/:id', getEntity, catchAsync(getOne))

// All routes require a JWT in order to be accessed from this point
router.use(verifyJWT)
router.delete('/user/:id', catchAsync(deleteUser))
router.post(
  '/product',
  validateMinArtNumber,
  validateArticleStructure,
  validateArticleExistence,
  catchAsync(createOne)
)
router.patch(
  '/product/:id',
  validateMinArtNumber,
  validateArticleStructure,
  validateArticleExistence,
  catchAsync(updateOne)
)

router.post('/:entity', getEntity, catchAsync(createOne))
router.patch('/:entity/:id', getEntity, catchAsync(updateOne))
router.delete('/:entity/:id', getEntity, catchAsync(deleteOne))

module.exports = router
