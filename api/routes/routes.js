const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check_auth");
const endpoints = require("./endpoints.json"); // get list of endpoints. custom or shared(default) crud services for endpoint.

router.post("/:field", checkAuth, async (req, res, next) => {
	const table = req.params.field;
	let controllerShared;
	let controllerCustom;

	try {
		let result;
		if (endpoints.shared.hasOwnProperty(table)) {
			if (req.baseUrl === "/save") {
				controllerShared = require("../controllers/shared/save");
			} else if (req.baseUrl === "/get") {
				controllerShared = require("../controllers/shared/get");
			} else if (req.baseUrl === "/delete") {
				controllerShared = require("../controllers/shared/delete");
			}else{
				res
				.status(404)
				.json({ type: req.baseUrl, error: "Object does not exist" });
			}
			result = await controllerShared(
				req.body,
				table,
				req.userData,
				req.authLevel,
				req.roleLevel
			);
		} else if (endpoints.custom.hasOwnProperty(table)) {
			if (req.baseUrl === "/custom") {
				controllerCustom = require(`../controllers/${endpoints.custom[table].controller}`);
			}else{
				res
				.status(404)
				.json({ type: req.baseUrl, error: "Object does not exist" });
			}

			result = await controllerCustom(
				req.body,
				table,
				req.userData,
				req.authLevel,
				req.roleLevel
			);
		} else {
			res
				.status(404)
				.json({ type: req.baseUrl, error: "Object does not exist" });
		}
		if (result instanceof Error) {
			res.status(500).json({ type: req.baseUrl, error: result.message });
		} else {
			if (res.refreshToken) {
				res.status(200).json({
					refreshToken: res.refreshToken,
					type: req.baseUrl,
					result: result,
				});
			} else {
				res.status(200).json({ type: req.baseUrl, result: result });
			}
		}
	} catch (err) {
		res.status(500).json({ type: req.baseUrl, error: err });
	}
});
module.exports = router;
