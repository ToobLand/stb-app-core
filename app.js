const express= require('express');
const app= express();
const bodyParser=require('body-parser');

/*const moduleRoute = require('./api/routes/moduleRoute');*/
const folderRoute = require('./api/routes/folderRoute');
const moduleRoute = require('./api/routes/moduleRoute');
const contentblockRoute = require('./api/routes/contentblockRoute');
const theoryRoute = require('./api/routes/theoryRoute');
const answerRoute = require('./api/routes/answerRoute');
const questionRoute = require('./api/routes/questionRoute');
//const scripts = require('./api/scripts/addTable');
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

app.use((req,res,next)=>{
   // const field= req.params.field;
    console.log(req);
});
 
app.use('/folder',folderRoute);
app.use('/module',moduleRoute);
app.use('/contentblock',contentblockRoute);
app.use('/theory',theoryRoute);
app.use('/answer',answerRoute);
app.use('/question',questionRoute);
//app.use('/scripts/addTable',scripts);
/*app.use('/module',moduleRoute);
*/

//app.use('/',moduleRoute);
//app.get('/', (req, res) => res.send('olla bolla2!'))

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

module.exports=app; 