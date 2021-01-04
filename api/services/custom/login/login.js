const jwt = require("jsonwebtoken");
const keys = require("../../../config/config.json");
const getList = require("../../shared/get/get");
const saveList = require("../../shared/save/save");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const loginList = {};
loginList.login = async (body) => {
	let cleanUp = body.email;
	if (validator.isEmail(cleanUp)) {
		cleanUp = validator.normalizeEmail(cleanUp, { all_lowercase: true });
	} else {
		return new Error(" Username Has to be an valid e-mailadress");
	}
	const username = cleanUp;
	const password = body.password;
	let result;
	try {
		result = await getList.getIt("users", { email: username });
	} catch (err) {
		return new Error(err);
	}
	console.log(result);
	if (result.length > 0) {
		if (bcrypt.compareSync(password, result[0].password)) {
			// maak token.
			const unique_val = new Date().valueOf();

			const token = jwt.sign(
				{
					email: username,
					id: result[0].id,
					role: result[0].role,
					unique: unique_val,
				},
				keys.keys.JWT_KEY,
				{
					expiresIn: "1h",
				}
			);
			try {
				let update = await saveList.saveUpdate("users", {
					id: String(result[0].id),
					refresh: String(unique_val),
				});
				console.log(update);
			} catch (err) {
				return new Error(err);
			}
			return { token: token };
		} else {
			console.log("wrong password");
			return "Wrong password";
		}
	} else {
		console.log("Not Found");
		return "User not found";
	}

	// save in db unique_val to user , for refreshing the token
};

module.exports = loginList;
