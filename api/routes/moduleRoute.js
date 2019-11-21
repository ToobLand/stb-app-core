const express = require('express');
const router = express.Router();
const modelSave=require('../model/module/save');
router.get('/get/:field', async (req,res,next)=>{
    const field= req.params.field;
    if(field=='test'){ 
        
            try{
            const result=await modelSave.saveNew();
            if(result){
                res.status(200).json(
                    {
                        type:'get', field:field, data:result.ops
                    }
                );
            }
            }catch(err){
                res.status(500).json({
                    error:"new error "+err
                 });
            }
            
            
        }
    });
    


module.exports=router;