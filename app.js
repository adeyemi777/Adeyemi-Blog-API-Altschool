const app = require("./index");
const { connectToMongoDb } = require("./database");
require("dotenv").config();

const API_PORT = process.env.API_PORT || 3000;
const DB_URI = process.env.DB_URI;

connectToMongoDb(DB_URI);

app.listen(API_PORT, () => {
	console.log(`Server started at port ${API_PORT}`);
});
