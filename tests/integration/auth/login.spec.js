const supertest = require("supertest");
const app = require("../../..");
const fixtures = require("../../fixtures");
const database = require("../../database");
const User = require("../../../models/user");

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	await database.disconnect();
});

describe("Login Authentication '/auth/login' POST request", () => {
	beforeEach(async () => {
		await User.create(fixtures.userTestData.valid);
	});

	afterEach(async () => {
		await database.cleanup();
	});

	it("should log user in successfully", async () => {
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.valid);
		// console.log(request.body)
		expect(request.status).toBe(200);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body).toHaveProperty("token");
	});

	it("should log user in successfully due to invalid email", async () => {
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.invalidEmailLogin);
		// console.log(request.body)
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
	});

	it("should not log user in successfully due to invalid password", async () => {
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.invalidPasswordLogin);
		// console.log(request.body)
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
	});
});
