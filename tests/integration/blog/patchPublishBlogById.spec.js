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

describe("Test to publish blog using the blog id by updating it's state to publish on the Blog PATCH '/blogs/publish/:id' request endpoint", () => {
	let userToken, blogInDraft, deletedBlogId, blogByAnotherUser;

	beforeAll(async () => {
		const user = await User.create(fixtures.userTestData.valid);
		const user2 = await User.create(fixtures.userTestData.valid2);
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.validLogin);

		blogInDraft = await Blog.create({
			...fixtures.blogTestData.valid,
			author: user._id,
		});
		blogByAnotherUser = await Blog.create({
			...fixtures.blogTestData.valid2,
			author: user2._id,
		});

		const toDelete = await Blog.create({
			...fixtures.blogTestData.valid3,
			author: user._id,
		});
		await Blog.findByIdAndDelete(toDelete._id);

		userToken = request.body.token;
		deletedBlogId = toDelete._id;
	});

	afterAll(async () => {
		await database.cleanup();
	});

	it("should publish blog successfully", async () => {
		const request = await supertest(app)
			.patch(`/blogs/publish/${blogInDraft._id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(200);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
		expect(request.body.blog.state).toBe(blogStates.published);
	});

	it("should fail to publish blog successfully due to an invalid blog id", async () => {
		const request = await supertest(app)
			.patch(`/blogs/publish/notavalididI`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to publish blog successfully due to missing token authorization header", async () => {
		const request = await supertest(app).patch(
			`/blogs/publish/${blogInDraft._id}`
		);
		expect(request.status).toBe(401);
	});

	it("should fail to publish blog successfully because it's a nonexisting blog", async () => {
		const request = await supertest(app)
			.patch(`/blogs/publish/${deletedBlogId}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(404);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to publish blog successfully because blog belongs to another user", async () => {
		const request = await supertest(app)
			.patch(`/blogs/publish/${blogByAnotherUser._id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(403);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to publish blog twice since the current blog is published already", async () => {
		const request = await supertest(app)
			.patch(`/blogs/publish/${blogInDraft._id}`) // blogInDraft has already been published in a prior request
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(400);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeFalsy();
	});
});
