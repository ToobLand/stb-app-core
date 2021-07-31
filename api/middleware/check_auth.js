const jwt = require("jsonwebtoken");
const keys = require("../config/config.json");
const endpoints = require("../routes/endpoints.json");
const getList = require("../services/shared/get/get");
const saveList = require("../services/shared/save/save");
module.exports = async (req, res, next) => {
	const table = req.params.field;
	// ------------- First check permission settings of request ----------
	let auth_level = 0;
	let role_level = 0;
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
	} else if (endpoints.custom.hasOwnProperty(table)) {
		if (req.baseUrl === "/custom") {
			auth_level = endpoints.custom[table][table][0];
			role_level = endpoints.custom[table][table][1];
		}
	} else {
		return res.status(404).json({
			message: "Endpoint does not exist [code: NoEndPointCheckAuth]",
		});
	}
	req.authLevel = auth_level;
	req.roleLevel = role_level;
	if (process.env.NODE_ENV === "development") {
		req.userData = {
			email: 'tobias_landman@hotmail.com',
			id: 2,
			role: 5,
			unique: 'bullshit_hash',
		}
		next();
	}else if (auth_level === 0) {
		return res.status(401).json({
			message: "No permission for request [code: actionIsBlocked]",
		});
	}
	else if (auth_level >= 2) {
		let decoded;
		try {
			

			const token = req.headers.authorization.split(" ")[1];
			decoded = jwt.verify(token, keys.keys.JWT_KEY);
			req.userData = decoded;
			///////////// VALID TOKEN /////////////
			if (decoded.role != 3 && auth_level == 5) {
				// Request Only for Admin's
				return res.status(401).json({
					message: "No permission for request [code: adminPermissionNeeded]",
				});
			}
			if (decoded.role != role_level && role_level != 0) {
				// REquest only for different ROLE user
				return res.status(401).json({
					message:
						"No permission for request [code: differentRolePermissionNeeded]",
				});
			}
		
		} catch (error) {
			return res.status(401).json({
				message: "Auth failed. [code: corruptToken]",
			});
		}

		//----------- Check if refreshToken should be send ---------------------//

		const expireTime = parseInt(decoded.exp);
		const refreshTime = parseInt(decoded.iat) + 1200;
		const currentTime = Math.floor(Date.now() / 1000);

		if (currentTime > refreshTime && currentTime < expireTime) {
			// --------------- Yes, after 20 minutes we refresh the token. ------------------------//
			let result;
			try {
				result = await getList.getIt("users", { id: decoded.id });
			} catch (err) {
				return new Error(err);
			}
			if (result[0].refresh == decoded.unique) {
				const unique_val = new Date().valueOf();
				//new unique value for new refresh request.
				let update;
				try {
					update = await saveList.saveUpdate("users", {
						id: String(result[0].id),
						refresh: String(unique_val),
					});
				} catch (err) {
					return new Error(err);
				}
				let token;
				try {
					token = jwt.sign(
						{
							email: decoded.email,
							id: result[0].id,
							role: result[0].role,
							unique: unique_val,
						},
						keys.keys.JWT_KEY,
						{
							expiresIn: "1h",
						}
					);
				} catch (err) {
					return new Error(err);
				}
				res.refreshToken = token; // put new Token in resonse.
				next();
			} else {
				//// Unique refresh value doesn't match... This is an OLD token that shouldn't be used anymore. It was updated sometime before.
				return res.status(401).json({
					message: "No permission for request [code: uniqueDoesntMatch]",
				});
			}
		} else {
			next();
		}
	} else if (auth_level == 1) {
		next(); // no authorization needed
	}
};
