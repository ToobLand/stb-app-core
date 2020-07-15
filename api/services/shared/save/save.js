connect_postgres = require("../connection/postgres");
const functionsList = require("../san_esc_val/validate"); // sanitize , escape and validate client data

const saveList = {};
saveList.saveNew = async (table, body) => {
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(table, body, "new"); // validate, sanitize, escape body data
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

saveList.saveUpdate = async (table, body) => {
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(table, body, "update"); // validate, sanitize, escape body data
	} catch (err) {
		return new Error(err);
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
