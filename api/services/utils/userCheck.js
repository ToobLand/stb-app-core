connect_postgres = require("../shared/connection/postgres");

const userCheckList = {};

userCheckList.sum = () => {
	return "test";
};
userCheckList.checkNewRecord = async (table, userData, cleanBody) => {
	const schema = require("../../schemas/" + table + "/schema.json");
	if (schema.columns.hasOwnProperty("id_user")) {
		cleanBody.id_user = userData.id;
		return cleanBody;
	} else {
		return false;
	}
};
userCheckList.checkUpdateRecord = async (table, userData, cleanBody) => {
	// may not update original 'id_user'// Use id_user from token (userData) to check for auth
	if (cleanBody.id_user) {
		delete cleanBody.id_user;
	}

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
				"Blocked, No permission to update this record. [error: IdUsersDontMatch]"
			);
		} else {
			return true;
		}
	} catch (err) {
		return new Error(err);
	}
};

module.exports = userCheckList;
