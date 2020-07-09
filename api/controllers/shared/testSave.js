
const express = require('express');
const router = express.Router();
    
router.post('/', async (req,res,next)=>{
    const table= req.params.field;
    //console.log(table);
    console.log(req);
    
});
module.exports=router;