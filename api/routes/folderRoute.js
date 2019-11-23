const express = require('express');
const router = express.Router();
const folderSave=require('../model/folder/save');
//const folderGet=require('../model/folder/get');
//const folderDelete=require('../model/folder/delete');
const functionsList=require('../model/functions');
router.post('/:field', async (req,res,next)=>{
    const field= req.params.field;
    if(field=='save'){ 
        if(req.body.hasOwnProperty("id")){  /////////////////// UPDATE ///////////////////////////////
            const id=parseInt(req.body.id);
            if(id>0){
                try{
                    //const body=validateSchema('folder',req.body,'new');
                   console.log('gevalidat4ed');
                    // const result=await folderSave.saveUpdate(body);
                    result={ops:"test"};
                    if(result){
                        res.status(200).json(
                            {
                                type:'get', field:field, data:result.ops
                            }
                        );
                    }
                }catch(err){
                    res.status(500).json({
                        error:err
                    });
                }
            }
        }else{  ////////////////// NEW INSERT INTO /////////////
            const body = await functionsList.validateSchema('folder',req.body,'new');
            if(body instanceof Error){
                res.status(500).json(
                    {
                        type:'save', error:body.message
                    }
                );
            }else{
                res.status(200).json(
                    {
                        type:'save', body:body
                    }
                );
            }
        }
    }
});  
module.exports=router;