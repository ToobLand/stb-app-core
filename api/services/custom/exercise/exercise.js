const connect_postgres = require("../../shared/connection/postgres");
const exerciseList = {};
exerciseList.getExercise = async (body, userData) => {
	let result;
	let client;
	try {
		client = await connect_postgres();
	} catch (err) {
		return new Error(err);
	}

	try {
		let contentblock_arr=[parseInt(body.id_contentblock)];
		result = await client.query(
			"SELECT * from question WHERE id_contentblock=$1 ",
			contentblock_arr
		);
		let antw_arr=[];
		let statement_arr=[];
		let result_antw;
		if (result.rows.length > 0) {
			result.rows.map((value, index)=>{
				antw_arr.push(value.id);
				statement_arr.push("$"+(index+1));

			});
			let whereStatement = statement_arr.join(", ");
			 result_antw = await client.query(
				"SELECT * from answer WHERE id_question IN("+whereStatement+") ",
				antw_arr
			);	
			result.rows.map((value, index)=>{
				result.rows[index].answers=[];
				result_antw.rows.map((antw_value, antw_index)=>{
					
					if(antw_value.id_question==value.id){
						result.rows[index].answers.push(antw_value);
					}
	
				});
	
			});
		}

		client.end();
		
		return [result.rows];

	}catch(err){
		return new Error(err);
	}

	
};

module.exports = exerciseList;
