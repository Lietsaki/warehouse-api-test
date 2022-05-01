const express = require('express')
const {
  verifyJWT,
  checkEmailDuplicity,
  registerUser,
  loginUser
} = require('./controllers/authController')
const {
  validateUserData,
  performProductValidation,
  validateManyProducts,
  validateInsertMany
} = require('./utils/validators')
const {
  catchAsync,
  getEntity,
  getOne,
  getAll,
  createOne,
  insertMany,
  updateOne,
  deleteOne,
  redirectRoute,
  deleteUser,
  sellProduct
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

router.post('/product', performProductValidation, catchAsync(createOne))
router.post('/product/insertMany', validateManyProducts, catchAsync(insertMany))
router.patch('/product/:id', performProductValidation, catchAsync(updateOne))
router.delete('/product/sell/:id', catchAsync(sellProduct))

router.post('/:entity', getEntity, catchAsync(createOne))
router.post(
  '/:entity/insertMany',
  getEntity,
  validateInsertMany,
  catchAsync(insertMany)
)
router.patch('/:entity/:id', getEntity, catchAsync(updateOne))
router.delete('/:entity/:id', getEntity, catchAsync(deleteOne))

module.exports = router
