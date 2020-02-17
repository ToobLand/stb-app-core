connect_postgres=require('../../data/postgres');
const deleteList={};
deleteList.deleteIt= async (table,body)=>{
        try{
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
                    let result=await client.query("DELETE from "+table+" WHERE "+whereStatement+" ", whereVal);
                    client.end();
                    return result.rows;
                }catch(err){
                    return new Error(err);
                }
            }else{
                return new Error('No conditions. Can t delete whole table');
            }
        }catch(err){
            return new Error(err);
        }
}
module.exports=deleteList;
