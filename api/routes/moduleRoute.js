const express = require('express');
const router = express.Router();
//const db_structure = require('../config/db_structure.json');
//const absGet = require('../models/absGet');
//const absSave = require('../models/absSave');

router.get('/get/:field',(req,res,next)=>{
    const field= req.params.field;
    if(field=='test'){ 
        const result={
            modules:[
                {id:1,title:'test titel 1', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:2,title:'test titel 2', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:3,title:'test titel 3', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:4,title:'test titel 4', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:5,title:'test titel 5', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:6,title:'test titel 6', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:7,title:'test titel 7', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:8,title:'test titel 8', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'},
                {id:9,title:'test titel 9', description:'Dit is de uitleg van deze module met een uitgebreide omschrijving'}
            ]
    };
        res.status(200).json(
            {
                type:'get', field:field, data:result
            }
        );
    }else{
        res.status(500).json({
            error:"Field doesn't exist"
        });
    }
});
router.post('/get/:field',(req,res,next)=>{
    const field= req.params.field;
    if(field=='test'){ 
        const result={result:{text:'test'}};
        res.status(200).json(
            {
                type:'get', field:field, data:result
            }
        );
    }else{
        res.status(500).json({
            error:"Field doesn't exist"
        });
    }
});
module.exports=router;