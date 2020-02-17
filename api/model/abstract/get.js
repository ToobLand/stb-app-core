connect_postgres=require('../../data/postgres');
const getList={};
getList.getIt= async (table,body)=>{
        try{
            var whereStatement=" WHERE ";
            var where=[];
            let whereVal=[];
            let client= await connect_postgres();
            if(Object.keys(body).length>0){
                let i=0;
                for(let key in body){
                    i++;
                    if(body[key] === Object(body[key]) && typeof body[key][1]!='undefined'){
                        condition=body[key][0];
                        value=body[key][1];
                    }else{
                        condition="=";
                        value=body[key];
                    }
                    if(value=='null' && (condition=='=' || condition=='!=')){
                        if(condition=='='){ where.push(" "+table+"."+key+" IS NULL "); }
                        if(condition=='!='){ where.push(" "+table+"."+key+" IS NOT NULL "); }
                    } else {
                        where.push(" "+table+"."+key+" "+condition+" $"+i+" ");
                        whereVal.push(value);
                    
                    }
                }
                whereStatement=where.join(' AND ');
                try{
                    let result=await client.query("SELECT * from "+table+" WHERE "+whereStatement+" ", whereVal);
                    client.end();
                    return result.rows;
                }catch(err){
                    return new Error(err);
                }
             
            }else{
                try{
                    let result=await client.query("SELECT * from "+table+" ");
                    client.end();
                    return result.rows;
                }catch(err){
                    return new Error(err);
                }
            }
        }catch(err){
            return new Error(err);
        }
}
module.exports=getList;