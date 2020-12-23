connect_postgres = require("../connection/postgres");
const functionsList = require("../san_esc_val/validate"); // sanitize , escape and validate client data

const saveList = {};
saveList.saveNew = async (table, body, userData, authLevel, roleLevel) => {
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(
			table,
			body,
			"new",
			userData,
			authLevel,
			roleLevel
		); // validate, sanitize, escape body data
		if (cleanBody instanceof Error) {
			return new Error(cleanBody.message);
		}
	} catch (err) {
		return new Error(err);
	}

	try {
		let client = await connect_postgres();
		let queryA = "";
		let queryB = "";
		let once = true;
		let queryArr = new Array();
		let i = 0;
		for (let key in cleanBody) {
			i++;
			if (once) {
				once = false;
			} else {
				queryA += ", ";
				queryB += ", ";
			}
			queryA += key;
			queryB += "$" + i;
			queryArr.push(cleanBody[key]);
		}
		let result = await client.query(
			"INSERT INTO " +
				table +
				" (" +
				queryA +
				") VALUES (" +
				queryB +
				")  RETURNING id;",
			queryArr
		);
		client.end();
		return result;
	} catch (err) {
		return new Error(err);
	}
};

saveList.saveUpdate = async (table, body, userData, authLevel, roleLevel) => {
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(
			table,
			body,
			"update",
			userData,
			authLevel,
			roleLevel
		); // validate, sanitize, escape body data
	} catch (err) {
		return new Error(err);
	}

	if (authLevel == 4 || authLevel == 3) {
		// You may only 'update' where ID_USER is the same as token id_user
		let client = await connect_postgres();
		try {
			const val = [cleanBody.id];
			let result = await client.query(
				"SELECT id_user FROM " + table + " WHERE id= $1",
				val
			);
			client.end();
			if (result.rows[0].id_user != userData.id) {
				return new Error(
					"Blocked, You may not update this. [error: IdUsersDontMatch]"
				);
			}
		} catch (err) {
			return new Error(err);
		}
	}

	try {
		let client = await connect_postgres();
		let queryA = "";
		let once = true;
		let queryArr = new Array();
		let i = 0;
		let whereId = "";
		for (let key in cleanBody) {
			if (key == "id") {
				whereId = " id=" + cleanBody[key] + " ";
			} else {
				i++;
				if (once) {
					once = false;
				} else {
					queryA += ", ";
				}
				queryA += key + "=$" + i;

				queryArr.push(cleanBody[key]);
			}
		}
		try {
			let result = await client.query(
				"UPDATE " +
					table +
					" SET " +
					queryA +
					" WHERE " +
					whereId +
					" RETURNING id;",
				queryArr
			);
			client.end();
			return result;
		} catch (err) {
			return new Error(err);
		}
	} catch (err) {
		return new Error(err);
	}
};
module.exports = saveList;
