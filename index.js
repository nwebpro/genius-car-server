import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
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
dbConnect()

// Database Collection
const Services = client.db('geniusCarDb').collection('services')
const Orders = client.db('geniusCarDb').collection('orders')

// Verify 2 step and 3rd step order display api JWT Token
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if(!authHeader) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized Access!'
        })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err) {
            return res.status(403).send({
                success: false,
                message: 'Forbidden Access!'
            })
        }
        req.decoded = decoded
        next()
    })

}

// JWT Token Api
app.post('/api/genius-car/jwt', (req, res) => {
    try {
        const user = req.body
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
        res.send({
            success: true,
            message: 'Successfully JWT Token Generate!',
            data: token
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            error: error.message
        })
    }
})

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
app.post('/api/genius-car/orders', verifyJWT, async (req, res) => {
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
app.get('/api/genius-car/orders', verifyJWT, async (req, res) => {
    try {
        // Verify 3rd step JWT Token
        const decoded = req.decoded
        if(decoded.email !== req.query.email) {
            res.status(403).send({
                success: false,
                message: 'Forbidden Access!'
            })
        }

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
app.patch('/api/genius-car/order/:orderId', verifyJWT, async (req, res) => {
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

// Order Delete Api
app.delete('/api/genius-car/order/:orderId', verifyJWT, async (req, res) => {
    try {
        const orderId = req.params.orderId
        const query = { _id: ObjectId(orderId) }
        const deleteOrder = await Orders.deleteOne(query)
        if(orders.deletedCount) {
            res.send({
                success: true,
                message: 'Successfully deleted the order'
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


app.listen(port, () => {
    console.log(`Genius Car Server Running on Port ${port}`)
})