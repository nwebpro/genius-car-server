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
const Orders = client.db('geniusCarDb').collection('orders')

// All Services Endpoint
app.get('/api/genius-car/services', async (req, res) => {
    try {
        const cursor = Services.find({})
        const services = await cursor.toArray()
        res.send({
            success: true,
            message: 'Successfully got the all services data',
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
            message: 'Successfully got the each service data with services id',
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

// Service Order Place Api
app.post('/api/genius-car/orders', async (req, res) => {
    try {
        const orders = req.body
        const order = await Orders.insertOne(orders)
        if(order.insertedId) {
            res.send({
                success: true,
                message: 'Order Successfully!'
            })
        }else{
            res.send({
                success: false,
                error: "Couldn't Order!"
            })
        }
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        }) 
    }

})

// Order Display Api 
app.get('/api/genius-car/orders', async (req, res) => {
    try {
        let query = {}
        if(req.query.email) {
            query = {
                email: req.query.email
            }
        }
        const cursor = Orders.find(query)
        const orders = await cursor.toArray()
        res.send({
            success: true,
            message: 'Successfully got the Order data',
            data: orders
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Display Order Status Update Api
app.patch('/api/genius-car/order/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId
        const status = req.body.status
        const query = { _id: ObjectId(orderId) }
        const updateOrder = {
            $set: {
                status: status
            }
        }

        const orders = await Orders.updateOne(query, updateOrder)
        if(orders.matchedCount) {
            res.send({
                success: true,
                message: 'Successfully Status Updated'
            })
        }else {
            res.send({
                success: false,
                error: "Couldn't update  the product"
            })
        }
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