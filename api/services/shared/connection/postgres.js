const { Client } = require('pg');
let client;
const make_connection=async ()=>{
    var local=false; // if deploying on Heroku use local = false
    
    if(local){
        client = new Client({
            connectionString: "postgres://tayubeifavhsby:4434a4e4e39afd31079df83a58120a6b56e21cefca7654210d8ca0e9609169a9@ec2-54-228-243-238.eu-west-1.compute.amazonaws.com:5432/dkve6sn5khpje",
            ssl: true,
        });
    }else{
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
    }
    try{
    client.connect();
    console.log('connectie gemaakt');
    }catch(err){
        return err;
    }
    return client;
    
}
module.exports = make_connection;

