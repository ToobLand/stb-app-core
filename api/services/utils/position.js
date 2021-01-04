connect_postgres = require("../shared/connection/postgres");

const positionList = {};

positionList.sum = () => {
	return "test";
};

positionList.newPosition = async (title, cleanBody) => {
	try {
		console.log("new position start");
		const schema = require("../../schemas/" + title + "/schema.json");
		if (schema.columns.position.hasOwnProperty("position_group")) {
			if (cleanBody.hasOwnProperty(schema.columns.position.position_group)) {
				let client = await connect_postgres();

				let result = await client.query(
					"SELECT position FROM " +
						title +
						" WHERE " +
						schema.columns.position.position_group +
						"= $1 ORDER BY position DESC LIMIT 1",
					[cleanBody[schema.columns.position.position_group]]
				);
				if (result.rows[0]) {
					cleanBody.position = parseInt(result.rows[0].position) + 1;
					return true;
				} else {
					cleanBody.position = 1;
					return true;
				}
			} else {
				return new Error(
					"Cannot set position. [error=noPosition_GroupValInBody"
				);
			}
		} else {
			return new Error(
				"TO DO. No position_group available. So not possible to set position. [error=noPosition_GroupValInSchema]"
			);
		}
	} catch (err) {
		return new Error(err);
	}
};

positionList.updatePosition = async (title, cleanBody) => {
	try {
		console.log("update position start [get schema]");
		const schema = require("../../schemas/" + title + "/schema.json");
		if (!schema.columns.position.hasOwnProperty("position_group")) {
			return new Error(
				"position group. To DO [error: NoPositionForNoPositionGroupYet]"
			);
		}
		let newposition = cleanBody.position;
		let client = await connect_postgres();
		let result = await client.query(
			"SELECT id, position, " +
				schema.columns.position.position_group +
				" FROM " +
				title +
				" WHERE " +
				"id=$1 LIMIT 1",
			[cleanBody.id]
		);
		let oldposition;
		let id_position_group;
		if (result.rows[0]) {
			oldposition = result.rows[0].position;
			id_position_group =
				result.rows[0][schema.columns.position.position_group];
		} else {
			return new Error("record doesn't exist [error: OldPositionLookUp");
		}
		if (newposition > oldposition) {
			let resultnew = await client.query(
				"UPDATE " +
					title +
					" SET position=position-1 WHERE position > $1 AND position <=$2 AND " +
					schema.columns.position.position_group +
					"= $3 ",
				[oldposition, newposition, id_position_group]
			);
		}
		if (newposition < oldposition) {
			let resultnew = await client.query(
				"UPDATE " +
					title +
					" SET position=position+1 WHERE position >= $1 AND position < $2 AND " +
					schema.columns.position.position_group +
					"= $3 ",
				[newposition, oldposition, id_position_group]
			);
		}
		if (newposition == oldposition) {
			delete cleanBody.position;
			return true;
		}

		let resultnewposition = await client.query(
			"UPDATE " + title + " SET position=$1 WHERE id= $2",
			[newposition, cleanBody.id]
		);
		delete cleanBody.position; // is already saved in db.
		return true;
	} catch (err) {
		return new Error(err);
	}
};
module.exports = positionList;
