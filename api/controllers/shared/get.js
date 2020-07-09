import { getIt } from "../../services/shared/get/get";

const get = async (body, table) => {
	let body = {};
	try {
		let result = await getIt(table, body);
		if (result instanceof Error) {
			return new Error(result.message);
		} else {
			return result;
		}
	} catch (err) {
		return new Error(err);
	}
};

export default get;
