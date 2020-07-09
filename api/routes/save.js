const express = require('express');
const router = express.Router();
const objects = require('./objects.json');

router.post('/:field',(req,res,next)=>{
    const field= req.params.field;
    if(objects.shared.hasOwnProperty(field)){ 
    
    }else{
        if(objects.custom.hasOwnProperty(field)){ 
        
        }else{
            res.status(404).json({type:'save', error:"object doesn't exist"});
        }
    }
});