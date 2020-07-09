import express from 'express';
const app= express();
import { urlencoded, json } from 'body-parser';

app.use(urlencoded({extended:false}));
app.use(json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-requested-width,Content-type,Accept,Authorization');
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','POST');
        return res.status(200).json({});
    }
    next();
});

//const scripts = require('./api/scripts/addTable');
//app.use('/scripts/addTable',scripts);

import routes from './api/controllers/routes';
app.post(['/save','/get','/delete'], routes);

app.use((req,res,next)=>{
    const error=new Error('Not found or forbidden');
    error.status=404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

export defaultapp; 