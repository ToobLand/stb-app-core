const express = require('express');
const router = express.Router();
connect_postgres=require('../data/postgres');

router.get('/', async (req,res,next)=>{

    ///////// CHANGE NEXT VALUE TO WORK ////////
/*
const table='users';
let client;
try{
    client= await connect_postgres();
}catch(err){
    return new Error(err);
}
schema=require('../model/'+table+'/schema.json');
let query_arr=[];
for (var key in schema.columns) {
    if(schema.columns[key].key==1 && key=='id'){
        query_arr.push(key+' serial PRIMARY KEY');
    }else{
        switch (schema.columns[key].type) {
            case 'int':
                if(schema.columns[key].required=='1'){
                    query_arr.push(key+' integer NOT NULL');
                }else{
                    query_arr.push(key+' integer');
                }
                break;
            case 'varchar': case 'email':
                if(schema.columns[key].required=='1'){
                    query_arr.push(key+' VARCHAR (250) NOT NULL');
                }else{
                    query_arr.push(key+' VARCHAR (250)');
                }
                break;
            case 'text':
                if(schema.columns[key].required=='1'){
                    query_arr.push(key+' TEXT NOT NULL');
                }else{
                    query_arr.push(key+' TEXT');
                }
                break;
            case 'date':
                if(schema.columns[key].required=='1'){
                    query_arr.push(key+' TIMESTAMP NOT NULL');
                }else{
                    query_arr.push(key+' TIMESTAMP');
                }
                break;
            default:
                break;
        }
    }

}

let query_string= query_arr.join(", ");

try{
    console.log('je bent hier');
    console.log("CREATE TABLE "+table+"("+query_string+")");
    let result=await client.query("CREATE TABLE "+table+"("+query_string+")");
    
    //CREATE INDEX idx_address_phone ON address(phone);
   let result2=await client.query("CREATE INDEX email ON "+table+"(email)");

    client.end();
    console.log(result);
    console.log(result2);
    res.status(200).json({type:'get', result:result});
    
}catch(err){
    console.log(new Error(err));
    res.status(500).json({type:'get', error:err});
    
}

/* CREATE TABLE account(
   user_id serial PRIMARY KEY,
   username VARCHAR (50) UNIQUE NOT NULL,
   password VARCHAR (50) NOT NULL,
   email VARCHAR (355) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   last_login TIMESTAMP
) */

});
module.exports=router;