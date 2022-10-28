const path = require('path')
const fs = require('fs')
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const { graphqlHTTP } = require('express-graphql')

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const mongoDbPassword = process.env.MONGO_DB_PASSWORD
const auth = require('./middleware/auth')

const app = express()

// Multer & Body Parser Setup
// Multer adds image uploads to req.file.path
//TO DO: fix file naming and multer setup
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    fileName: (req, file, cb) => {
        cb(null, file.originalname)
    },
})
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
app.use(bodyParser.json())
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)

//CORS request allowance middleware
app.use((req, res, next) => {
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
const deleteImage = (filePath) => {
    filePath = path.join(__dirname, filePath)
}
app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated')
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file uploaded' })
    }
    // Updating images - delete old image in FS
    if (req.body.oldPath) {
        deleteImage(req.body.oldPath)
    }
    return res
        .status(201)
        .json({ message: 'File stored.', filePath: req.file.path.toString() })
})

// GraphQL
app.use(
    '/graphql',
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        graphiql: true,
        customFormatErrorFn: (error) => ({
            message: error.message || 'An error occurred',
            statusCode: error.statusCode || 500,
            data: error.data,
        }),
    })
)

// Error handling
app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({ message: message, data: data })
})

mongoose
    .connect(
        `mongodb+srv://dpisterzi:${mongoDbPassword}@cluster0.wdwpbii.mongodb.net/messages?retryWrites=true&w=majority`
    )
    .then((result) => {
        app.listen(4040)
    })
    .catch((err) => console.log(err))
