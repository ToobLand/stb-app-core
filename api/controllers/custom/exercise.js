const custom_service_get_exercise_sql = require("../../services/custom/exercise/exercise");

const exercise = async (body, table, userData, authLevel, roleLevel) => {
	try {
		let result = await custom_service_get_exercise_sql.getExercise(
			body,
			userData
		);
		if (result instanceof Error) {
			return new Error("[ custom exercise] - " + result.message);
		} else {
			return result;
		}
	} catch (err) {
		return new Error("[custom exercise] - " + err);
	}
};

module.exports = exercise;
