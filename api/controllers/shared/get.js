const shared_service_get_sql = require("../../services/shared/get/get");

const get = async (body, table, userData, authLevel, roleLevel) => {
	try {
		let result = await shared_service_get_sql.getIt(
			table,
			body,
			userData,
			authLevel,
			roleLevel
		);
		if (result instanceof Error) {
			return new Error(result.message);
		} else {
			return result;
		}
	} catch (err) {
		return new Error(err);
	}
};

module.exports = get;
