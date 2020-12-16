const jwt = require("jsonwebtoken");
const keys = require("../config/config.json");
const endpoints = require("../routes/endpoints.json");

module.exports = (req, res, next) => {
	const table = req.params.field;
	let auth_level = 0;
	if (endpoints.shared.hasOwnProperty(table)) {
		if (req.baseUrl === "/save") {
			auth_level = endpoints.shared[table].save[0];
			role_level = endpoints.shared[table].save[1];
		}
		if (req.baseUrl === "/get") {
			auth_level = endpoints.shared[table].get[0];
			role_level = endpoints.shared[table].get[1];
		}
		if (req.baseUrl === "/delete") {
			auth_level = endpoints.shared[table].delete[0];
			role_level = endpoints.shared[table].delete[1];
		}
	}
	if (endpoints.custom.hasOwnProperty(table)) {
		if (req.baseUrl === "/save") {
			auth_level = endpoints.custom[table].save[0];
			role_level = endpoints.custom[table].save[1];
		}
		if (req.baseUrl === "/get") {
			auth_level = endpoints.custom[table].get[0];
			role_level = endpoints.custom[table].get[1];
		}
		if (req.baseUrl === "/delete") {
			auth_level = endpoints.custom[table].delete[0];
			role_level = endpoints.custom[table].delete[1];
		}
		if (req.baseUrl === "/custom") {
			auth_level = endpoints.custom[table][table][0];
			role_level = endpoints.custom[table][table][1];
		}
	}
	req.authLevel = auth_level;
	if (auth_level === 0) {
		return res.status(401).json({
			message: "No permission for request [code: actionIsBlocked]",
		});
	}
	if (auth_level >= 2) {
		try {
			const token = req.headers.authorization.split(" ")[1];
			const decoded = jwt.verify(token, keys.keys.JWT_KEY);
			req.userData = decoded;

			if (decoded.role != 3 && auth_level == 5) {
				return res.status(401).json({
					message: "No permission for request [code: adminPermissionNeeded]",
				});
			}
			if (decoded.role != role_level && role_level != 0) {
				return res.status(401).json({
					message:
						"No permission for request [code: differentRolePermissionNeeded]",
				});
			}
			next();
		} catch (error) {
			return res.status(401).json({
				message: "Auth failed. [code: corruptToken]",
			});
		}
	} else if (auth_level == 1) {
		next(); // no authorization needed
	}
};
