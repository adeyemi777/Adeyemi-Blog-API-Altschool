const supertest = require("supertest");
const app = require("../..");
const database = require("../database");

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	await database.disconnect();
});

describe("Application works", () => {
	it("should get the homepage route '/' request successfully", async () => {
		const request = await supertest(app).get("/");
		expect(request.status).toBe(200);
		expect(request.headers["content-type"]).toContain("application/json");
	});
});
