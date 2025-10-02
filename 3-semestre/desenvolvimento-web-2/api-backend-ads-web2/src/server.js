import express from 'express'
import userRouter from './routers/userRouter.js'
import propertyRouter from './routers/propertyRouter.js'
import cors from 'cors'
import { logger } from './middlewares/logger.js'

const app = express()
const port = 3000

//middleware
app.use(logger)
app.use(express.json())
app.use(cors())

app.use(express.static('frontEndPropertyWeb'))

app.use('/user', userRouter)
app.use('/property', propertyRouter)

app.get('/', (req, res) => {
  res.end;
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})