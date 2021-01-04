connect_postgres = require("../connection/postgres");
const functionsList = require("../../utils/validate"); // sanitize , escape and validate client data
const positionList = require("../../utils/position");
const userCheckList = require("../../utils/userCheck");
const saveList = {};
saveList.saveNew = async (table, body, userData, authLevel, roleLevel) => {
	//// Check Id_user - set id_user automatically in body when needed for auth permissions later // --------------------------------------------
	await userCheckList.checkNewRecord(table, userData, body);

	///// check position - set position automatically in Body if needed // -----------------------------------------------
	if (body.position) {
		return new Error(
			"TO DO, Not possible to force a new position with new record [error: CannotForcePositionWithSaveNew]"
		);
	} else {
		try {
			await positionList.newPosition(table, body);
		} catch (err) {
			return new Error(err);
		}
	}

	// Validate, Sanitize & escape values in Body with settings from models/x/schema.json // ----------------
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(
			table,
			body,
			"new",
			userData,
			authLevel,
			roleLevel
		);
		if (cleanBody instanceof Error) {
			return new Error(cleanBody.message);
		}
	} catch (err) {
		return new Error(err);
	}

	////// Save new record in DB - make up the query // --------------------------------------------
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
	// Validate, sanitize and escape values from body // -----------------------------------------------
	let cleanBody;
	try {
		cleanBody = await functionsList.validateSchema(
			table,
			body,
			"update",
			userData,
			authLevel,
			roleLevel
		);
	} catch (err) {
		return new Error(err);
	}
	// Check auth Permission for record to update // -----------------------------------------------------
	if (authLevel == 4 || authLevel == 3) {
		// You may only 'update' where ID_USER is the same as token id_user
		const checkPermission = await userCheckList.checkUpdateRecord(
			table,
			userData,
			cleanBody
		);
		if (checkPermission instanceof Error) {
			return checkPermission;
		}
	}

	// position - update position in db & update affected siblings // -------------------------------
	if (cleanBody.position) {
		const updatePos = await positionList.updatePosition(table, cleanBody);
		if (updatePos instanceof Error) {
			return updatePos;
		}
	}

	// Make up and run query to update record in DB // -------------------------------------------------------
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
