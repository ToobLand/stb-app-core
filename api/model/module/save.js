loadDb=require('../../data/mongoDb')
const saveList={};

saveList.saveNew= async ()=>{
        try{
            collection = await loadDb('module');
            const result = collection.insertOne({title:'nieuwe titel',id_parent_module:'1',description:'meh3'});
            return result;
        }catch(err){
            throw err;
        }
       // return 'bingo';
};
module.exports=saveList;