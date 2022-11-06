const supertest = require("supertest");
const app = require("../../..");
const fixtures = require("../../fixtures");
const database = require("../../database");
const bcrypt = require("bcrypt");

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	await database.disconnect();
});

describe("Signup Authentication '/auth/signup' POST request", () => {
	afterAll(async () => {
		await database.cleanup();
	});

	it("should register user successfully", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.valid);
		expect(request.status).toBe(201);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.user.email).toEqual(
			fixtures.userTestData.valid.email
		);
		expect(request.body.user.firstName).toEqual(
			fixtures.userTestData.valid.firstName
		);
		expect(request.body.user.lastName).toEqual(
			fixtures.userTestData.valid.lastName
		);
		expect(
			await bcrypt.compare(
				fixtures.userTestData.valid.password,
				request.body.user.password
			)
		).toBeTruthy();
	});

	it("should not register user successfully because user already exists", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.valid);
		expect(request.status).toBe(401); // passport returns 401 automatically
	});

	it("should not register user successfully due to no firstname", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.noFirstname);
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.user).toBeUndefined();
	});

	it("should not register user successfully due to no lastname", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.noLastname);
		// console.log(request.text)
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.user).toBeUndefined();
	});

	it("should not register user successfully due to no email", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.noEmail);
		expect(request.status).toBe(400);
	});

	it("should not register user successfully due to invalid email", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.invalidEmail);
		// console.log(request.text)
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.user).toBeUndefined();
	});

	it("should not register user successfully due to no password", async () => {
		const request = await supertest(app)
			.post("/auth/signup")
			.send(fixtures.userTestData.noPassword);
		expect(request.status).toBe(400);
	});
});
