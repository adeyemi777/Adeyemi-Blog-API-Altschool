const supertest = require("supertest");
const app = require("../../..");
const fixtures = require("../../fixtures");
const database = require("../../database");
const { Blog, blogStates } = require("../../../models/blog");
const User = require("../../../models/user");
const { calculateReadingTimeInString } = require("../../../utils");

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	await database.disconnect();
});

describe("Test creating a new blog for the logged in user on the Blog POST '/' request endpoint", () => {
	let userToken;
	beforeAll(async () => {
		await User.create(fixtures.userTestData.valid);
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.validLogin);
		userToken = request.body.token;
	});

	afterAll(async () => {
		await database.cleanup();
	});

	it("should create blog successfully", async () => {
		const request = await supertest(app)
			.post("/blogs")
			.send({
				...fixtures.blogTestData.valid,
				tags: fixtures.blogTestData.valid.tags.join(","),
			})
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(201);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
		expect(request.body.blog.title).toBe(fixtures.blogTestData.valid.title);
		expect(request.body.blog.description).toBe(
			fixtures.blogTestData.valid.description
		);
		expect(request.body.blog.body).toBe(fixtures.blogTestData.valid.body);
		expect(request.body.blog.tags).toEqual(
			fixtures.blogTestData.valid.tags
		);
		expect(request.body.blog.read_count).toBe(0);
		expect(request.body.blog.state).toBe(blogStates.draft);
		expect(request.body.blog.reading_time.inString).toBe(
			calculateReadingTimeInString(
				fixtures.blogTestData.valid.title,
				fixtures.blogTestData.valid.body
			)
		);
	});

	it("should fail to create blog successfully because blog with same title already exists", async () => {
		const request = await supertest(app)
			.post("/blogs")
			.send({
				...fixtures.blogTestData.valid,
				tags: fixtures.blogTestData.valid.tags.join(","),
			})
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to create blog due to missing required data", async () => {
		const request = await supertest(app)
			.post("/blogs")
			.send()
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to create blog successfully because no data is sent", async () => {
		const request = await supertest(app)
			.post("/blogs")
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to create blog successfully due to missing token authorization header", async () => {
		const request = await supertest(app)
			.post("/blogs/")
			.send(fixtures.blogTestData.valid);
		expect(request.status).toBe(401);
	});
});
