const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// const uri = "mongodb+srv://mongouser:8WY8cXX1eR2pdmD1@cluster0.c1ygv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var uri = "mongodb://mongouser:8WY8cXX1eR2pdmD1@cluster0-shard-00-00.c1ygv.mongodb.net:27017,cluster0-shard-00-01.c1ygv.mongodb.net:27017,cluster0-shard-00-02.c1ygv.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-10o2xl-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) =>{
    console.log('Server Running')
    res.send('Srever Running on port')
})

async function server () {
    try{
        await client.connect();
        const database = client.db('User_Collection');
        const userCollection = database.collection('User');

        app.post('/users', async(req, res) => {
            console.log(req.body);
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            console.log('Post Hited')
            res.json(result);
        })

        app.get('/users', async(req, res) =>{
            console.log(req.query)
            const cursor = userCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            console.log('page :' , page, 'size is : ', size);
            let users;
            if(page){
                users = await cursor.skip(page*size).limit(size).toArray();
                console.log('------------------------------------')
                console.log(users)
            } else{
                users = await cursor.toArray();
            }
            res.send({
                users,
                count
            })
        })

        app.delete('/users:id', async(req, res) => {
            const id = req.params.id;
            console.log('Deleting User id:', id);
            const query = {_id:ObjectId(id)}
            const result = await userCollection.deleteOne(query);
            console.log(result);
            res.json(id)
        })

        app.get('/users/update/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const user = await userCollection.findOne(query);
            res.send(user);
        })

        app.put('/users/update/:id', async(req, res) => {
            console.log('START');
            const id = req.params.id;
            const updateUser = req.body;
            console.log(id)
            const filter = {_id:ObjectId(id)};
            const options = {upsert : true};
            console.log(updateUser);
            const updateDoc = {
                $set:{
                    name: updateUser.name,
                    email: updateUser.email
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options );
            console.log('RESULT IS : ', result)
            res.json(result);
        })
    }
    finally{
        //  await client.close();
    }
}

server().catch(console.dir)

app.listen(port, ()=>{
    console.log('Running Server On Port No : ', port);
});