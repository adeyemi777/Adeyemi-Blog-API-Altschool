const supertest = require("supertest");
const app = require("../../..");
const fixtures = require("../../fixtures");
const database = require("../../database");
const { Blog, blogStates } = require("../../../models/blog");
const User = require("../../../models/user");

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	await database.disconnect();
});

describe("Test to get all published blogs for the logged in user on the Blog GET '/blogs/mine' request endpoint", () => {
	let userToken;

	beforeAll(async () => {
		const user = await User.create(fixtures.userTestData.valid);
		const user2 = await User.create(fixtures.userTestData.valid2);
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.valid);

		userToken = request.body.token;
		await Blog.create({
			...fixtures.blogTestData.valid,
			author: user2._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid2,
			author: user2._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid3,
			author: user._id,
			state: blogStates.draft,
		});
		await Blog.create({
			...fixtures.blogTestData.valid4,
			author: user._id,
			state: blogStates.draft,
		});
		await Blog.create({
			...fixtures.blogTestData.valid5,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid6,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid7,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid8,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid9,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid10,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid11,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid12,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid13,
			author: user._id,
			state: blogStates.published,
		});
		await Blog.create({
			...fixtures.blogTestData.valid14,
			author: user._id,
			state: blogStates.published,
		});
	});

	afterAll(async () => {
		await database.cleanup();
	});

	it("should get user blogs", async () => {
		const request = await supertest(app)
			.get("/blogs/mine")
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(200);

		expect(request.body.count).toBe(10); // 10 due to default pagination of 10 for users
		expect(request.body.blogs.length).toBe(10);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
	});

	it("should fail to get user blogs due to missing token authorization header", async () => {
		const request = await supertest(app).get("/blogs/mine");
		expect(request.status).toBe(401);
	});

	it("should get user blogs by pagination", async () => {
		const request = await supertest(app)
			.get("/blogs/mine?page=2")
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(200);

		expect(request.body.count).toBe(2); // 2 because 10/14 of the blog belongs to this user and page is paginated by 10 blog per page
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
	});

	it("should fail to get user blogs by pagination because page parameter value is less than 1", async () => {
		const request = await supertest(app)
			.get("/blogs/mine?page=0")
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(404);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should get user blogs with state of draft", async () => {
		const request = await supertest(app)
			.get(`/blogs/mine?state=${blogStates.draft}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(200);

		expect(request.body.count).toBe(2);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
	});

	it("should get user blogs with state of published", async () => {
		const request = await supertest(app)
			.get(`/blogs/mine?state=${blogStates.published}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(200);

		expect(request.body.count).toBe(10);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
	});
});
