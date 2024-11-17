const { Client } = require("pg");
let client;
const make_connection = async () => {
	let local;
	if (process.env.NODE_ENV === "development") {
		local = true;
	} else {
		local = false;
	}

	if (local) {
		// isn't active anymore. 
		client = new Client({
			connectionString:
				"TO DO: SETUP NEW LOCAL POSTGRESS DB. HEROKU IS CANCELLED ",
			ssl: true,
		});
	} else {
		client = new Client({
			connectionString: process.env.DATABASE_URL,
			ssl: true,
		});
	}
	try {
		client.connect();
		console.log("connectie gemaakt");
		return client;
	} catch (err) {
		return err;
	}
};
module.exports = make_connection;
