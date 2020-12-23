const shared_service_save_sql = require("../../services/shared/save/save");

const save = async (body, table, userData, authLevel, roleLevel) => {
	if (body.hasOwnProperty("id")) {
		/////////////////// UPDATE ///////////////////////////////
		const id = parseInt(body.id);
		if (id > 0) {
			try {
				let result = await shared_service_save_sql.saveUpdate(
					table,
					body,
					userData,
					authLevel,
					roleLevel
				);
				if (result instanceof Error) {
					return new Error("[update record] - " + result.message);
				} else {
					return result;
				}
			} catch (err) {
				return new Error("[update record] - " + err);
			}
		}
	} else {
		////////////////// NEW RECORD, INSERT INTO /////////////
		try {
			let result = await shared_service_save_sql.saveNew(
				table,
				body,
				userData,
				authLevel,
				roleLevel
			);

			if (result instanceof Error) {
				return new Error("[new record] - " + result.message);
			} else {
				return result;
			}
		} catch (err) {
			return new Error("[new record] - " + err);
		}
	}
};
module.exports = save;
