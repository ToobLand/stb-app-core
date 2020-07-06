const MongoClient = require('mongodb').MongoClient;
const CONNECTION_URL = "mongodb+srv://vloeiweide:BosWachterNeefs86@studiebeest-qamck.gcp.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "stb_v2";
let database,collection;

const loadDb = async (collectionName) => {
    if(database){
        return database
    }
    try{
        const client =  await MongoClient.connect(CONNECTION_URL, {useUnifiedTopology: true, useNewUrlParser: true });
        database =  await client.db(DATABASE_NAME);           
        collection =  await database.collection(''+collectionName+'');
    }catch (err) {
        throw err;
    }
    return collection

}

module.exports = loadDb;