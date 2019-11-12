const express= require('express');
const app= express();
const bodyParser=require('body-parser');

const moduleRoute = require('./api/routes/moduleRoute');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-requested-width,Content-type,Accept,Authorization');
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','POST');
        return res.status(200).json({});
    }
    next();
});


app.use('/',moduleRoute);
//app.get('/', (req, res) => res.send('olla bolla2!'))

app.use((req,res,next)=>{
    const error=new Error('Not found');
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

module.exports=app; 