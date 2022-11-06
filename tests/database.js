const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

class DatabaseConnection {
	async connect() {
		this.mongoServer = await MongoMemoryServer.create();
		this.connection = await mongoose.connect(this.mongoServer.getUri(), {});
	}

	async cleanup() {
		const models = Object.keys(mongoose.connection.models);
		const modelPromises = [];

		models.forEach((model) => {
			modelPromises.push(this.connection.models[model].deleteMany({}));
		});

		await Promise.all(modelPromises);
	}

	async disconnect() {
		await mongoose.disconnect();
		if (this.mongoServer) await this.mongoServer.stop();
	}
}

module.exports = new DatabaseConnection();
