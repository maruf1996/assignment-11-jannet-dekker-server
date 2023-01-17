const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bmyfd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('jannetDekker').collection('services');
        const reviewCollection = client.db('jannetDekker').collection('reviews');

        // service api 
        app.get('/limitServices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        // review api 
        app.get('/review/:id',async(req,res)=>{
            const id= req.params.id;
            const query={service:id}
            const cursor=reviewCollection.find(query)
            const review=await cursor.toArray();
            res.send(review)
        })

        app.get('/myReview',async(req,res)=>{
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        app.get('/myReview/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const review=await reviewCollection.findOne(query)
            res.send(review)
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.put('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            // console.log(review.reviewer);
            const option = {upsert: true};
            const updateReview = {
                $set: {
                    reviewer:review.reviewer,
                    photoURL:review.photoURL,
                    comment:review.comment,
                    email:review.email
                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('jannet dekker server is running')
})

app.listen(port, () => {
    console.log(`jannet dekker server running on ${port}`);
})