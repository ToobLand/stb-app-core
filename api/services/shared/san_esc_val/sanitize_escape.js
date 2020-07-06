const keys={
    "encryptionKey":"234hasbAsj34bsdfhbBash354678Hbas",
    "base64Key":"k24ea5w8923HUK3b"
}

const validator = require('validator');
const fecha = require('fecha');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(keys.encryptionKey);
//const crypto=require('crypto');
const bcrypt = require('bcryptjs'); //normale bcrypt werkt niet op Heroku
//const saltRounds = 10; // for bcrypt encryption

// Some functions to help validate things or to convert values to right formats etc
// useable for all model files

const functionsList={};

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
        var salt = bcrypt.genSaltSync(10);
        value = bcrypt.hashSync(value, salt);
    }
    return value;
}

module.exports=functionsList;