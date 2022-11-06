const supertest = require("supertest");
const app = require("../../..");
const fixtures = require("../../fixtures");
const database = require("../../database");
const { Blog } = require("../../../models/blog");
const User = require("../../../models/user");

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	await database.disconnect();
});

describe("Test updating blog data using it's id on the Blog PUT '/blogs/:id' request endpoint", () => {
	let userToken, userBlog, deletedBlogId, blogByAnotherUser;

	beforeAll(async () => {
		const user = await User.create(fixtures.userTestData.valid);
		const user2 = await User.create(fixtures.userTestData.valid2);
		const request = await supertest(app)
			.post("/auth/login")
			.send(fixtures.userTestData.validLogin);

		const toDelete = await Blog.create({
			...fixtures.blogTestData.valid3,
			author: user._id,
		});
		await Blog.findByIdAndDelete(toDelete._id);

		userBlog = await Blog.create({
			...fixtures.blogTestData.valid,
			author: user._id,
		});
		blogByAnotherUser = await Blog.create({
			...fixtures.blogTestData.valid2,
			author: user2._id,
		});

		userToken = request.body.token;
		deletedBlogId = toDelete._id;
	});

	afterAll(async () => {
		await database.cleanup();
	});

	it("should edit blog successfully", async () => {
		const request = await supertest(app)
			.put(`/blogs/${userBlog._id}`)
			.send({
				...fixtures.blogTestData.valid3,
				tags: fixtures.blogTestData.valid3.tags.join(","),
			})
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(200);
		expect(request.headers["content-type"]).toContain("application/json");
		expect(request.body.status).toBeTruthy();
		expect(request.body.blog.title).toBe(
			fixtures.blogTestData.valid3.title
		);
		expect(request.body.blog.description).toBe(
			fixtures.blogTestData.valid3.description
		);
		expect(request.body.blog.tags).toEqual(
			fixtures.blogTestData.valid3.tags
		);
		expect(request.body.blog.body).toBe(fixtures.blogTestData.valid3.body);
	});

	it("should fail to edit blog due to missing token authorization header", async () => {
		const request = await supertest(app)
			.put(`/blogs/${userBlog._id}`)
			.send({
				...fixtures.userTestData.valid3,
				tags: fixtures.blogTestData.valid3.tags.join(","),
			});
		expect(request.status).toBe(401);
	});

	it("should fail to edit blog due to an invalid blog id", async () => {
		const request = await supertest(app)
			.put(`/blogs/invalidID`)
			.send({
				...fixtures.userTestData.valid3,
				tags: fixtures.blogTestData.valid3.tags.join(","),
			})
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(400);
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to edit blog because it's a nonexisting blog", async () => {
		const request = await supertest(app)
			.put(`/blogs/${deletedBlogId}`)
			.send({
				...fixtures.userTestData.valid3,
				tags: fixtures.blogTestData.valid3.tags.join(","),
			})
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(404);
		expect(request.body.status).toBeFalsy();
	});

	it("should fail to edit blog because it belongs to another user", async () => {
		const request = await supertest(app)
			.put(`/blogs/${blogByAnotherUser._id}`)
			.send({
				...fixtures.userTestData.valid3,
				tags: fixtures.blogTestData.valid3.tags.join(","),
			})
			.set("Authorization", `Bearer ${userToken}`);
		expect(request.status).toBe(403);
		expect(request.body.status).toBeFalsy();
	});
});
