loadDb=require('../../data/mongoDb')
const saveList={};

saveList.saveNew= async (table,body)=>{
        try{
            let insert_obj={};
            for(let key in body){
                i++;
                insert_obj[key]=body[key];
            }

            collection = await loadDb(table);
            const result = collection.insertOne(insert_obj);
            return result;
        }catch(err){
            return new Error(err);
        }
     
};
module.exports=saveList;