import { Router } from "express";
const router = Router();

import { shared, custom } from "./endpoints.json"; // get list of endpoints. custom or shared(default) crud services for endpoint.

router.post("/:field", async (req, res, next) => {
	const table = req.params.field;
	let controllerShared;
	let controllerCustom;
	if (req.baseUrl === "/save") {
		// SAVE //
		controllerShared = require("./shared/save").default.default;
		controllerCustom = require("./custom/save");
	}
	if (req.baseUrl === "/get") {
		// GET //
		controllerShared = require("./shared/get").default;
		controllerCustom = require("./custom/get");
	}
	if (req.baseUrl === "/delete") {
		// DELETE //
		controllerShared = require("./shared/delete");
		controllerCustom = require("./custom/delete");
	}
	try {
		let result;
		if (shared.hasOwnProperty(table)) {
			result = await controllerShared(req.body, table);
		} else if (custom.hasOwnProperty(table)) {
			result = await controllerCustom(req.body, table);
		} else {
			res
				.status(404)
				.json({ type: req.baseUrl, error: "Object does not exist" });
		}
		if (result instanceof Error) {
			res.status(500).json({ type: req.baseUrl, error: result.message });
		} else {
			res.status(200).json({ type: req.baseUrl, result: result });
		}
	} catch (err) {
		res.status(500).json({ type: req.baseUrl, error: err });
	}
});
export default router;
