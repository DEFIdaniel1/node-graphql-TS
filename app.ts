import path from 'path'

import express, { Express, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import mongoose, { Callback } from 'mongoose'
import multer, { FileFilterCallback } from 'multer'
import { graphqlHTTP } from 'express-graphql'

import graphqlSchema from './graphql/schema'
const graphqlResolver = require('./graphql/resolvers.js') //To do: convert to TS
import { mongoDbPassword, mongoUser, port } from './config'
import auth from './middleware/auth'
import { clearImage } from './util/file'
import { ReqPlus, ServerError } from './models/custom'

const app: Express = express()
app.use(bodyParser.json())

/**  
    Multer setup for image uploads to app
    Multer adds image uploads to req.file.path
*/
const fileStorage: multer.StorageEngine = multer.diskStorage({
    destination: (req: ReqPlus, file: Express.Multer.File, cb: Callback) => {
        cb(null, 'images')
    },
    filename: (req: ReqPlus, file: Express.Multer.File, cb: Callback) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    },
})
const fileSizeLimit = {
    fileSize: 1024 * 1024 * 5, // limit to 5MB
}
const fileFilter = (
    req: ReqPlus,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    // Returns error if now type != image
    if (!file || file.mimetype.split('/')[0] != 'image') {
        cb(new Error('Only images can be uploaded.'))
    } else {
        cb(null, true)
    }
}
app.use(
    multer({
        storage: fileStorage,
        fileFilter: fileFilter,
        limits: fileSizeLimit,
    }).single('image')
)
// Send static image path
app.use('/images', express.static(path.join(__dirname, 'images')))

//CORS request allowance middleware
app.use((req: ReqPlus, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    )
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// Authentication check
app.use(auth)

// Uploading & deleting images
app.put('/post-image', (req: ReqPlus, res: Response, next: NextFunction) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated!')
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!' })
    }
    // Updating images - delete old image in FS
    if (req.body.oldPath) {
        clearImage(req.body.oldPath)
    }
    return res
        .status(201)
        .json({ message: 'File stored.', filePath: req.file.path })
})

// GraphQL
app.use(
    '/graphql',
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        graphiql: true,
        customFormatErrorFn: (error: ServerError) => ({
            message: error.message || 'An error occurred',
            statusCode: error.statusCode || 500,
            data: error.data,
        }),
    })
)

// Error handling
app.use(
    (error: ServerError, req: ReqPlus, res: Response, next: NextFunction) => {
        console.log(error)
        const status = error.statusCode || 500
        const message = error.message
        const data = error.data
        res.status(status).json({ message: message, data: data })
    }
)

mongoose
    .connect(
        `mongodb+srv://${mongoUser}:${mongoDbPassword}@cluster0.wdwpbii.mongodb.net/messages?retryWrites=true&w=majority`
    )
    .then((result) => {
        app.listen(port || 4040)
    })
    .catch((err) => console.log(err))
