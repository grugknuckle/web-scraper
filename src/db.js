const MongoClient = require('mongodb').MongoClient
// const uri = "mongodb+srv://admin:<password>@adawgdev.shzb2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const uri = process.env.DB_CONNECTION_STRING
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

client.connect(err => {
  const collection = client.db("test").collection("devices")
  // perform actions on the collection object
  client.close()
})