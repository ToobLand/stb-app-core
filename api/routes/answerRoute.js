const express = require('express');
const router = express.Router();
const absSave=require('../model/abstract/save');
const absGet=require('../model/abstract/get');
const functionsList=require('../model/functions');

const table='answer'; // what's the table name. So standards work for save/get/delete 

router.post('/:field', async (req,res,next)=>{
    const field= req.params.field;
    if(field=='save'){  //*************************************SAVE**********************************************
        if(req.body.hasOwnProperty("id")){  /////////////////// UPDATE ///////////////////////////////
            const id=parseInt(req.body.id);
            if(id>0){
                try{
                    const body = await functionsList.validateSchema(table,req.body,'update');
                   //const body=req.body;
                    if(body instanceof Error){
                        res.status(500).json({type:'update', error:body.message});
                    }else{
                        let result=await absSave.saveUpdate(table,body);
                        if(result instanceof Error){
                            res.status(500).json({type:'update', error:result.message});
                        }else{
                            res.status(200).json({type:'update', result:result});
                        }
                    }
                    }catch(err){
                        res.status(500).json({type:'save', error:err});
                    }
            }
        }else{  ////////////////// NEW RECORD, INSERT INTO /////////////
           try{
            const body = await functionsList.validateSchema(table,req.body,'new');
            if(body instanceof Error){
                res.status(500).json({type:'save', error:body.message});
            }else{
                let result=await absSave.saveNew(table,body);
                if(result instanceof Error){
                    res.status(500).json({type:'save', error:result.message});
                }else{
                    res.status(200).json({type:'save', result:result});
                }
            }
            }catch(err){
                res.status(500).json({type:'save', error:err});
            } 
        }
    }
    if(field=='get'){
        let body={};
        try{
        if(req.body){
            body = await functionsList.validateSchema(table,req.body,'get');
        }
        if(body instanceof Error){
            res.status(500).json({type:'get', error:"1"+body.message});
        }else{
            let result=await absGet.getIt(table,body);
            if(result instanceof Error){
                res.status(500).json({type:'get', error:"2"+result.message});
            }else{
                res.status(200).json({type:'get', result:result});
            }
        }
        }catch(err){
            res.status(500).json({type:'get', error:"3"+err});
        }
    }
});  
module.exports=router;