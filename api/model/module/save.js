connect_postgres=require('../../data/postgres')
const saveList={};
saveList.saveNew= async ()=>{
        try{
            let client= connect_postgres();
            client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
                if (err) throw err;
                for (let row of res.rows) {
                    console.log(JSON.stringify(row));
                }
                client.end();
            });
        }catch(err){
            throw err;
        }
    return 'bingo';
};
module.exports=saveList;