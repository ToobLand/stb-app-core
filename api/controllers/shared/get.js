const shared_service_get_sql = require("../../services/shared/get/get");

const get = async (body, table) => {
	try {
		let result = await shared_service_get_sql.getIt(table, body);
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
