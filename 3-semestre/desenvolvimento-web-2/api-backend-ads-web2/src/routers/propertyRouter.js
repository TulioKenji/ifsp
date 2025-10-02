import express from 'express'
import getPropertyController from '../controllers/property/getPropertyController.js'
import postPropertyController from '../controllers/property/postPropertyController.js'
import putPropertyController from '../controllers/property/putPropertyController.js'
import patchPropertyController from '../controllers/property/patchPropertyController.js'
import deletePropertyController from '../controllers/property/deletePropertyController.js'


const propertyRouter = express.Router();

propertyRouter.get('/list', getPropertyController )

propertyRouter.get(':id', ()=>{}) // get de uma unica propriedade por id

propertyRouter.post('/', postPropertyController)

propertyRouter.put('/:id', putPropertyController)

propertyRouter.patch('/type', patchPropertyController)

propertyRouter.delete('/:id', deletePropertyController)

export default propertyRouter