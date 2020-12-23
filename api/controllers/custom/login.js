const custom_service_login_sql = require("../../services/custom/login/login");

const login = async (body, table, userData, authLevel, roleLevel) => {
	try {
		let result = await custom_service_login_sql.login(body);
		if (result instanceof Error) {
			return new Error("[login attempt] - " + result.message);
		} else {
			return result;
		}
	} catch (err) {
		return new Error("[login attempt] - " + err);
	}
};

module.exports = login;
