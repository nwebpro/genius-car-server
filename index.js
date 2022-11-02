import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


app.get('/api/genius-car', (req, res) => {
    res.send('Genius Car Server Side Running')
})


// MongoDb Connect
const uri = `mongodb+srv://${ process.env.MONGODB_USER }:${ process.env.MONGODB_PASS }@cluster0.1ipuukw.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
async function dbConnect() {
    try {
        await client.connect()
        console.log('Database Connected')
    } catch (error) {
        console.log(error.name, error.message)
    }
}

// Database Collection
const Services = client.db('geniusCarDb').collection('services')

// All Services Endpoint
app.get('/api/genius-car/services', async (req, res) => {
    try {
        const cursor = Services.find({})
        const services = await cursor.toArray()
        res.send({
            success: true,
            message: 'Successfully got the data',
            data: services
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Single Service Endpoint
app.get('/api/genius-car/service/:serviceDetailId', async (req, res) => {
    try {
        const serviceDetailId = req.params.serviceDetailId
        const query = { _id: ObjectId(serviceDetailId) }
        const services = await Services.findOne(query)
        res.send({
            success: true,
            message: 'Successfully got the data',
            data: services
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })     
    }
})


dbConnect()
app.listen(port, () => {
    console.log(`Genius Car Server Running on Port ${port}`)
})