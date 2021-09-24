import Koa from 'koa'
import Router from 'koa-router'
import multer from '@koa/multer'
import cors from '@koa/cors'
import AWS from 'aws-sdk'
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

// -- Config

AWS.config.credentials = {
    accessKeyId: 'test',
    secretAccessKey: 'test',
}

const config = {
    bucket: 'file-bucket',
    port: process.env.PORT || 80
}

const s3 = new AWS.S3({
    region: 'eu-north-1',
    // Needs to be http://localstack rather than http://localhost because of docker default network
    endpoint: 'http://localstack:4566',
    s3ForcePathStyle: true, // Required for running localstack
})

// -- Setup LowDB
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)
await db.read()
// Initialise data if not initialised
db.data = db.data || { files: {} }
await db.write()

// -- Setup Koa server

const app = new Koa()
const upload = multer()
const router = new Router()

// -- Api routes

router.get('/', async (ctx) => {
    // Retrieves file from S3
    const res = await s3.listObjects({
        Bucket: config.bucket,
    }).promise()

    const responseData = res.Contents.map(fileInfo => {
        // Retrieve additional metadata from LowDB
        const fileData = db.data.files[fileInfo.Key]

        return {
            fileName: fileInfo.Key,
            description: fileData.description,
            owner: fileData.owner,
            createdAt: fileData.createdAt,
            updatedAt: fileInfo.LastModified,
            size: fileInfo.Size,
        }
    })


    ctx.body = responseData
    ctx.status= 200
})

router.post('/', async (ctx) => {
    // Saves a file to S3

    const params = {
        Bucket: config.bucket,
        Body: ctx.request.file.buffer,
        Key: ctx.request.body.filename,
    }

    await s3.upload(params).promise()

    db.data.files[params.Key] = {
        filename: params.Key,
        description: ctx.request.body.description,
        owner: ctx.request.body.owner,
        createdAt: new Date().toUTCString()
    }
    await db.write()

    ctx.status = 200
})

router.delete('/:key', async (ctx) => {
    // Deletes a file based on its key
    const fileKey = ctx.params.key
    
    await s3.deleteObject({
        Bucket: config.bucket,
        Key: ctx.params.key,
    }).promise()

    // delete from lowdb as well
    delete db.data.files[fileKey]
    db.write()
    
    ctx.status = 200
})

// -- Start server

app.use(cors())
app.use(upload.single('file'))
app.use(router.routes())

app.listen(config.port)
console.log("app started on port: ", config.port)