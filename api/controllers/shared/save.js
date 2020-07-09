import { saveUpdate, saveNew } from "../../services/shared/save/save";

const save = async (body, table) => {
	if (body.hasOwnProperty("id")) {
		/////////////////// UPDATE ///////////////////////////////
		const id = parseInt(body.id);
		if (id > 0) {
			try {
				let result = await saveUpdate(table, body);
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
			let result = await saveNew(table, body);

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
export default save;
