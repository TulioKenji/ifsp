import express from 'express'
import getUserController from '../controllers/user/getUserController.js'
import postUserController from '../controllers/user/postUserController.js'
import putUserController from '../controllers/user/putUserController.js'
import patchUserController from '../controllers/user/patchUserController.js'
import deleteUserController from '../controllers/user/deleteUserController.js'

const userRouter = express.Router();

userRouter.get('/:id', getUserController)
  
userRouter.post('/', postUserController)
  
userRouter.put('/', putUserController)
  
userRouter.patch('/', patchUserController)
  
userRouter.delete('/', deleteUserController)

export default userRouter;