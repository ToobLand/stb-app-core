connect_postgres = require("../connection/postgres");
const functionsList = require("../san_esc_val/validate"); // sanitize , escape and validate client data

const getList = {};
getList.getIt = async (table, body, userData, authLevel, roleLevel) => {
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(table, body, "get"); // validate, sanitize, escape body data
		if (cleanBody instanceof Error) {
			return new Error(cleanBody.message);
		}
	} catch (err) {
		return new Error(err);
	}

	try {
		var whereStatement = " WHERE ";
		var where = [];
		let whereVal = [];
		let client = await connect_postgres();
		if (Object.keys(cleanBody).length > 0) {
			let i = 0;
			for (let key in cleanBody) {
				i++;
				if (
					cleanBody[key] === Object(cleanBody[key]) &&
					typeof cleanBody[key][1] != "undefined"
				) {
					condition = cleanBody[key][0];
					value = cleanBody[key][1];
				} else {
					condition = "=";
					value = cleanBody[key];
				}
				if (value == "null" && (condition == "=" || condition == "!=")) {
					if (condition == "=") {
						where.push(" " + table + "." + key + " IS NULL ");
					}
					if (condition == "!=") {
						where.push(" " + table + "." + key + " IS NOT NULL ");
					}
				} else {
					where.push(
						" " + table + "." + key + " " + condition + " $" + i + " "
					);
					whereVal.push(value);
				}
			}
			whereStatement = where.join(" AND ");

			try {
				let result = await client.query(
					"SELECT * from " + table + " WHERE " + whereStatement + " ",
					whereVal
				);
				client.end();

				if (authLevel == 4 || authLevel == 3) {
					// You may only 'get' where ID_USER is the same as token id_user
					if (result.rows[0].hasOwnProperty("id_user")) {
						var countDown = result.rows.length;
						while (countDown--) {
							// have to do reverse loop because splice changes index of array
							if (result.rows[countDown].id_user != userData.id) {
								result.rows.splice(countDown, 1);
							}
						}
					}
				}

				return result.rows;
			} catch (err) {
				return new Error(err);
			}
		} else {
			console.log("get_all");
			try {
				let result = await client.query("SELECT * from " + table + " ");
				client.end();
				//console.log(result.rows);
				if (authLevel == 4 || authLevel == 3) {
					// You may only 'get' where ID_USER is the same as token id_user
					if (result.rows[0].hasOwnProperty("id_user")) {
						var i = result.rows.length;
						while (i--) {
							// have to do reverse loop because splice changes index of array
							if (result.rows[i].id_user != userData.id) {
								result.rows.splice(i, 1);
							}
						}
					}
				}
				return result.rows;
			} catch (err) {
				return new Error(err);
			}
		}
	} catch (err) {
		return new Error(err);
	}
};
module.exports = getList;
