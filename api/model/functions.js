const keys={
    "encryptionKey":"234hasbAsj34bsdfhbBash354678Hbas",
    "base64Key":"k24ea5w8923HUK3b"
}

const validator = require('validator');
const fecha = require('fecha');

const Cryptr = require('cryptr');
const cryptr = new Cryptr(keys.encryptionKey);
const crypto=require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10; // for bcrypt encryption
// Some functions to help validate things or to convert values to right formats etc
// useable for all model files

const functionsList={};

functionsList.validateSchema=async (title,body,type)=>{
    if(title==''){
        return new Error('error in script. titel van object mee geven');
    }else{
        const schema = require('./'+title+'/schema.json');
        var values={};
        for (var key in schema.columns) {
            if(body.hasOwnProperty(key)){
               let get_condition=false; // for get requests it's possible to send a condition. so make sure it's correct and doesn't break this function
                if(body[key] === Object(body[key]) && typeof body[key][1]!='undefined'){
                    
                    if(Object.keys(body[key]).length==2){ // get condition added.
                        // custom condition
                        
                        if(body[key][0]=="=" || body[key][0]==">=" || body[key][0]=="<=" || body[key][0]=="<" || body[key][0]==">" || body[key][0]=="!=" || body[key][0]=="IN"){
                            get_condition=body[key][0];
                            var value=body[key][1]; 
                            
                            var checkit=functionsList.toDbFromClient(schema.columns[key],key,value);
                        }else{
                            return new Error(title+" . "+key+" : Condition is not legit.");
                        }
                    }else{
                        return new Error(title+" . "+key+" : Condition is not legit. { id:{'>=','10'} }");
                    }
                }else{
                    var value=body[key]; 
                    
                    var checkit=functionsList.toDbFromClient(schema.columns[key],key,value);
                }
                if(checkit instanceof Error){
                    return checkit; // is error
                }else{
                    if(get_condition){
                        values[key]=[get_condition, checkit];
                        
                    }else{
                        values[key]=checkit;
                    }
                }
            }else{
                if(type=='get'){ continue; } // if 'get' request, missing columns is no problem, is just for where values in query

                if(schema.columns[key].required=='1'){
                    if(type=='new' && key=='id'){
                        // is oke. ID is autoincrement.
                    }else{
                       
                        return new Error(title+' . '+key+' : This column (key) is required');
                    }
                }else{
                    if(schema.columns[key].standard_value!=''){
                        values[key]=schema.columns[key].standard_value;
                    }
                }
            }
        }
        return values;
    }
}

// check if value is int/number
functionsList.checkInt=(val)=>{
    return (typeof val == "number" && !isNaN(val));
}

functionsList.checkEmail=(val)=>{
    return validator.isEmail(val);
}

functionsList.convertCryptKey=(strKey)=>{
    var newKey = new Buffer.from([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    strKey = new Buffer.from(strKey);
    for(var i=0;i<strKey.length;i++) newKey[i%16]^=strKey[i];
    return newKey;
}

// EEN VALUE VAN CLIENT CHECKEN EN VALIDEREN
functionsList.toDbFromClient=(schemarow,key,value)=>{
    if(schemarow.type=='varchar' || schemarow.type=='text'){
        schemarow.type='string';
    }
    if(typeof value!='string'){
        return new Error(' . '+key+' : Every value in a JSON body should be an string. This is may be an object or something else. Not valid to save in sql');
    }
    if(schemarow.type=='int'){ // validate INTEGER
       
        if(!validator.toInt(value)){
            return new Error(' . '+key+' : Has to be an INTEGER');
        }
        if(value!=validator.toInt(value)){
            return new Error(' . '+key+' : Has to be an INTEGER');
        }
        value=validator.toInt(value);
        if(!functionsList.checkInt(value)){
            return new Error(' . '+key+' : Has to be an INTEGER');
        }
    }
    if(schemarow.type=='string'){ // validate & encode STRING
        value=validator.escape(value);
        if(value=="" && schemarow.required=='1'){
            return new Error(' . '+key+' : Needs to be a string and is required');
        }
    }
    if(schemarow.type=='datetime'){ // validate & convert DATETIME
        // post value must be a timestamp!
        if(!validator.toInt(value)){
            return new Error(' . '+key+' : Has to be an TIMESTAMP');
        }
        value=validator.toInt(value);
        if(!functionsList.checkInt(value)){
            return new Error(' . '+key+' : Has to be an TIMESTAMP');
        }
        if((new Date(value)).getTime() > 0){
            // convert timestamp to datetime
            value=fecha.format(new Date(value), 'YYYY-MM-DD hh:mm:ss.SSS'); 
        }else{
            return new Error(' . '+key+' : Has to be an TIMESTAMP');
        }
    }
    if(schemarow.type=='email'){ // validate EMAIL
        
        if(validator.isEmail(value)){                    
            value=validator.normalizeEmail(value,{all_lowercase:true});
        }else{
            return new Error(' . '+key+' : Has to be an valid e-mailadress');
        }
    }
    if(schemarow.encrypt=='1'){ // Encrypt > AES encrypt. (searchable for get requests) and decryption possible
        var c = crypto.createCipheriv("aes-128-ecb", functionsList.convertCryptKey(""+keys.encryptionKey+""), "");
        var crypted = c.update(value, 'utf8', 'hex') + c.final('hex');
        value=crypted;
    }
    if(schemarow.encrypt=='2'){ // Encrypt > Cryptr. not searchable value for GET but stronger encryption. Decryption possible 
        value=cryptr.encrypt(value);
    }
    if(schemarow.encrypt=='3'){ // Encrypt > Bcrypt. For passwords. no decryption possible not searchable. 
        value=bcrypt.hashSync(value, saltRounds);
    }
    return value;
}
/*
// DE ARRAY MET OBJECTEN UIT DE MYSQL WEER LEESBAAR MAKEN VOOR CLIENT
functionsList.fromDbToClient=(field,responsSQL)=>{
    var cleanResult=[];
                      
    for(var i=0;i<responsSQL.length;i++){
        cleanResult[i]={};
        for (var key in responsSQL[i]) {
            var skip=false;
            if(db_structure[field].fields.hasOwnProperty(key)){
                if(responsSQL[i][key]!='' && responsSQL[i][key]!==null && typeof responsSQL[i][key]!=='undefined'){
                    // encrypted values decrypten
                    if(db_structure[field].fields[key].encrypt=='1'){
                        var dc = crypto.createDecipheriv("aes-128-ecb", functionsList.convertCryptKey(""+keys.encryptionKey+""), "");
                        var decrypted = dc.update(responsSQL[i][key], 'hex', 'utf8') + dc.final('utf8');
                        responsSQL[i][key]= decrypted;
                    }
                    if(db_structure[field].fields[key].encrypt=='2'){
                        responsSQL[i][key]=cryptr.decrypt(responsSQL[i][key]); 
                    }
                    if(db_structure[field].fields[key].encrypt=='3'){ // als bcrypt value. dan weghalen. Heb je niks aan , dus ook niet mee sturen.
                        responsSQL[i][key]="";
                        skip=true;
                    } 
                    if(db_structure[field].fields[key].type=='string'){
                        responsSQL[i][key]=validator.unescape(responsSQL[i][key]);
                    }
                }else{
                    if(responsSQL[i][key]===null){
                        responsSQL[i][key]='';
                    }
                }
            }
            if(!skip){
                cleanResult[i][key]={};
                cleanResult[i][key]=responsSQL[i][key];
            } 
        }
    }
    return cleanResult;
}
/*
functionsList.sanitizeIncoming=(condition,value,field,wherekey)=>{
    let respons={respons:'',
                reject:''}
    if(db_structure[field].fields[wherekey].type=='int'){ // validate INTEGER
        if(condition=="IN"){
           
            var $check_ints=value.split(",");
            var validated_ints=[];
            for(var i=0;i<$check_ints.length;i++){
                $check_ints[i]=validator.toInt($check_ints[i]);
                if(functions.checkInt($check_ints[i])){
                    validated_ints.push($check_ints[i]);
                }else{
                    respons.reject=field+' . '+wherekey+' : Values need to be INTEGERS. If you use an IN condition seperate te values with a comma {key:{"IN","1,2,3,4"}}.';
                    return respons;
                }
            }
            value=validated_ints.join(',');
            respons.respons=value;
        }else{
            
            if(!validator.toInt(value)){
                respons.reject=field+' . '+wherekey+' : Has to be an INTEGER';
                return respons;
            }
            value=validator.toInt(value);
            if(!functionsList.checkInt(value)){
                respons.reject=field+' . '+wherekey+' : Has to be an INTEGER';
                return respons;
            }
            respons.respons=value;
        }
    }
    if(db_structure[field].fields[wherekey].type=='string'){ // validate (encode) STRING
        if(condition=="IN"){
            var $check_strings=value.split(",");
            var validated_strings=[];
            for(var i=0;i<$check_strings.length;i++){
                // eerst uitkleden, quotations weghalen, want anders klopt encryptie (om te zoeken) niet.
                if($check_strings[i].trim().slice(-1)=="'" && $check_strings[i].trim().slice(0,1)=="'"){
                    var good_value= validator.escape($check_strings[i].trim().substr(1).slice(0, -1));
                }else{
                    var good_value= validator.escape($check_strings[i]);
                }
                // Dan encrypten
                if(db_structure[field].fields[wherekey].encrypt=='1'){ // Encrypt > AES encrypt. (searchable for get requests) and decryption possible
                        var c = crypto.createCipheriv("aes-128-ecb", functions.convertCryptKey(""+keys.encryptionKey+""), "");
                        var crypted = c.update(good_value, 'utf8', 'hex') + c.final('hex');
                        good_value=crypted;
                }
                // nu apostrophe er weer omheen zetten voor de query
                good_value="'"+good_value+"'";
                validated_strings.push(good_value);
            }
            value=validated_strings.join(',');
            respons.respons=value;
        }else{
            value=validator.escape(value);
            respons.respons=value;
        }
    } 
    if(db_structure[field].fields[wherekey].type=='datetime'){ // validate & convert DATETIME
        // post value must be a timestamp!
        value=functionsList.checkInt(value);
        if(!functionsList.checkInt(value)){
            respons.reject=field+' . '+wherekey+' : Has to be an TIMESTAMP';
            return respons;
        }
        if((new Date(value)).getTime() > 0){
            // convert timestamp to datetime
            value=fecha.format(new Date(value), 'YYYY-MM-DD hh:mm:ss.SSS'); 
            respons.respons=value;
        }else{
            respons.reject=field+' . '+wherekey+' : Has to be an TIMESTAMP';
            return respons;
        }
    }
    if(db_structure[field].fields[wherekey].type=='email'){ // validate & encrypt EMAIL
        if(validator.isEmail(value)){
            // is a valid emailadress. Encrypt to make the search succesful                    
            value=validator.normalizeEmail(value,{all_lowercase:true});
            respons.respons=value;
        }else{
            respons.reject=field+' . '+wherekey+' : Has to be an E-MAILADRESS';
            return respons;
        }
    }
    if(condition!="IN"){ // Hierboven wordt voor IN condition al encryptie toegepast.
        if(db_structure[field].fields[wherekey].encrypt=='1'){ // Encrypt > AES encrypt. (searchable for get requests) and decryption possible
            var c = crypto.createCipheriv("aes-128-ecb", functionsList.convertCryptKey(""+keys.encryptionKey+""), "");
            var crypted = c.update(value, 'utf8', 'hex') + c.final('hex');
            value=crypted;
            respons.respons=value;
        }
    }
    if(db_structure[field].fields[wherekey].encrypt=='2'){ // Encrypt > Cryptr. not searchable value for GET 
        respons.reject=' . '+wherekey+' : This is a unique cryptr encryption value. Not possible to use in WHERE statement ';
        return respons;
        //return rej(' . '+wherekey+' : This is a unique cryptr encryption value. Not possible to use in WHERE statement ');
    }
    if(db_structure[field].fields[key].encrypt=='3'){ // Encrypt > Bcrypt. For passwords. not searchable. 
        respons.reject=field+' . '+wherekey+' : This is a BCRYPT encryption value. Not possible to use in WHERE statement ';
        return respons;
       // return rej(field+' . '+wherekey+' : This is a BCRYPT encryption value. Not possible to use in WHERE statement ');
    }
    return respons;
}*/

module.exports=functionsList;

