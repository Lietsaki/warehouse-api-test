const express = require('express')
// const {
//   verifyJWT,
//   verifyAppVersioningToken
// } = require('../controllers/authController')
const {
  catchAsync,
  getEntity,
  //   getOne,
  getAll,
  createOne
  //   updateOne,
  //   deleteOne,
  //   redirectRoute
} = require('./controllers/handlerFactory')

const crudRouter = express.Router()
const authRouter = express.Router()

// router.post(
//     '/register',
//     verifyJWT,
//     verifyAssignedRole,
//     checkEmail,
//     registerUser,
//     sendUserCredentials,
//     returnResponse
//   )

//   router.post('/login', loginUser)

// Create user (redirect to register route) - Do not place this route below POST '/:entity'
//router.post('/user', redirectRoute('/user/register'))

crudRouter.get('/:entity', getEntity, catchAsync(getAll))

// // Get all with filter
// router.get('/:entity/filter', getEntity, getAllWithFilter)
// router.get('/:entity/:id', getEntity, getEntityItem, getOne)

// All routes require a JWT in order to be accessed from this point
// router.use(verifyJWT)
crudRouter.post('/:entity', getEntity, catchAsync(createOne))
// router.patch('/:entity/:id', getEntity, updateOne, returnResponse)
// router.delete('/:entity/:id', getEntity, deleteOne)

module.exports = { crudRouter, authRouter }
