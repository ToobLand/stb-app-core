connect_postgres=require('../../data/postgres')
const saveList={};
saveList.saveNew= async (table,body)=>{
        try{
            let client= await connect_postgres();
            let queryA=""; let queryB=""; let once=true; let queryArr=new Array();let i=0;
            for(let key in body){
                i++;
                if(once){
                    once=false;
                }else{
                    queryA+=", ";
                    queryB+=", ";
                }
                queryA+=key;
                queryB+="$"+i;
                queryArr.push(body[key]);
            }
           // client.query("INSERT INTO "+table+" ("+queryA+") VALUES ("+queryB+");", queryArr, (err,res)=>{
           try{
                let result=await client.query("INSERT INTO "+table+" ("+queryA+") VALUES ("+queryB+")  RETURNING id;", queryArr);
                client.end();
                return result;
            }catch(err){
                return new Error(err);
            }
            
        }catch(err){
            return new Error(err);
        }
};
saveList.saveUpdate= async (table,body)=>{
    try{
        let client= await connect_postgres();
        let queryA="";  let once=true; let queryArr=new Array();let i=0;
        for(let key in body){
            i++;
            if(once){
                once=false;
            }else{
                queryA+=", ";
                
            }
            queryA+=key+"=$"+i;
            
            queryArr.push(body[key]);
        }
        try{
            let result=await client.query("UPDATE "+table+" SET "+queryA+" RETURNING id;", queryArr);
            client.end();
            return result;
        }catch(err){
            return new Error(err);
        }
        
    }catch(err){
        return new Error(err);
    }
};
module.exports=saveList;