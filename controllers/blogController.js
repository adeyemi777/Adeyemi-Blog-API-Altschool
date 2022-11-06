const { Blog, blogStates } = require("../models/blog");
const { isValidObjectId } = require("../utils");

const getAllPublishedBlogs_get = async (req, res, next) => {
	try {
		const page = req.query.page || 1;
		const BLOGS_PER_PAGE = 20;

		let sortBy = req.query.orderBy || "";
		if (sortBy.includes("reading_time")) {
			sortBy = sortBy.replace("reading_time", "reading_time.inNumber");
		}

		let searchQuery = { state: blogStates.published };
		const author = req.query.author || undefined;
		const title = req.query.title || undefined;
		const tags = req.query.tags || undefined;

		if (title) {
			searchQuery.title = { $regex: ".*" + title + ".*", $options: "i" };
		}

		if (tags) {
			searchQuery.tags = { $in: tags.split(",") };
		}

		let blogs = await Blog.find(searchQuery)
			.populate("author", "firstName lastName -_id")
			.limit(BLOGS_PER_PAGE)
			.skip((page - 1) * BLOGS_PER_PAGE)
			.sort(sortBy);

		if (author) {
			const authorRegex = new RegExp(author, "i");
			blogs = blogs.filter((blog) => {
				return (
					authorRegex.test(blog.author.firstName) ||
					authorRegex.test(blog.author.lastName)
				);
			});
		}

		res.status(200).json({ status: true, count: blogs.length, blogs });
	} catch (error) {
		next(error);
	}
};

const getUserBlogs_get = async (req, res, next) => {
	try {
		const page = req.query.page || 1;
		const state = req.query.state || "all";
		const BLOGS_PER_PAGE = 10;

		if (page < 1)
			return res
				.status(404)
				.json({ status: false, error: "Page not found" });

		if (state === blogStates.draft) {
			blogs = await Blog.find({
				author: req.user.id,
				state: blogStates.draft,
			})
				.limit(BLOGS_PER_PAGE)
				.skip((page - 1) * BLOGS_PER_PAGE);
		} else if (state === blogStates.published) {
			blogs = await Blog.find({
				author: req.user.id,
				state: blogStates.published,
			})
				.limit(BLOGS_PER_PAGE)
				.skip((page - 1) * BLOGS_PER_PAGE);
		} else {
			blogs = await Blog.find({ author: req.user.id })
				.limit(BLOGS_PER_PAGE)
				.skip((page - 1) * BLOGS_PER_PAGE);
		}

		res.status(200).json({ status: true, count: blogs.length, blogs });
	} catch (error) {
		next(error);
	}
};

const getPublishedBlogById_get = async (req, res, next) => {
	try {
		const blogId = req.params.id;

		if (!isValidObjectId(blogId)) {
			return res
				.status(400)
				.json({ status: false, error: "Invalid: blog id" });
		}

		const blog = await Blog.findOne({
			_id: blogId,
			state: blogStates.published,
		}).populate("author", "email firstName lastName -_id");
		if (!blog)
			return res
				.status(404)
				.json({ status: false, error: "Blog not found" });

		blog.updateOneReadCount();
		res.status(200).json({ status: true, blog });
	} catch (error) {
		next(error);
	}
};

const createBlog_post = async (req, res, next) => {
	try {
		const exists = await Blog.findOne({ title: req.body.title });
		if (exists) {
			return res
				.status(400)
				.json({ status: false, error: "Blog already exists" });
		}

		const blogDetails = { ...req.body, author: req.user.id };
		const blog = await Blog.create(blogDetails);
		await blog.cleanAndSaveTags(req.body.tags);
		res.status(201).json({ status: true, blog });
	} catch (error) {
		next(error);
	}
};

const updateBlogToPublish_patch = async (req, res, next) => {
	try {
		const blogId = req.params.id;

		if (!isValidObjectId(blogId)) {
			return res
				.status(400)
				.json({ status: false, error: "Invalid blog id" });
		}

		const blog = await Blog.findById(blogId);
		if (!blog)
			return res
				.status(404)
				.json({ status: false, error: "Blog not found" });

		if (!blog.author.equals(req.user.id)) {
			return res
				.status(403)
				.json({
					status: false,
					error: "This blog doesn't belong to you. You can only update your blog.",
				});
		}
		if (blog.state === blogStates.published)
			return res
				.status(400)
				.json({ status: false, error: "Blog has been published!" });

		
		blog.state = blogStates.published;
		await blog.save();
		res.status(200).json({
			status: true,
			message: "Your blog has been published!",
			blog,
		});
	} catch (error) {
		next(error);
	}
};

const editBlog_put = async (req, res, next) => {
	try {
		const blogId = req.params.id;
		const { title, description, body, tags } = req.body;

		if (!isValidObjectId(blogId)) {
			return res
				.status(400)
				.json({ status: false, error: "Invalid blog id" });
		}

		if (await Blog.findOne({ title }))
			return res
				.status(403)
				.json({ status: false, error: "Blog title has been taken!" });

		const blog = await Blog.findById(blogId);
		if (!blog)
			return res
				.status(404)
				.json({ status: false, error: "Blog not found" });
		if (!blog.author.equals(req.user.id)) {
			return res
				.status(403)
				.json({
					status: false,
					error: "This blog doesn't belong to you. You can only update your blog.",
				});
		}

		blog.title = title || blog.title;
		blog.description = description || blog.description;
		blog.body = body || blog.body;
		await blog.save();
		blog.tags = (await blog.cleanAndSaveTags(tags)) || blog.tags;
		res.status(200).json({ status: true, blog });
	} catch (error) {
		next(error);
	}
};

const deleteBlog_delete = async (req, res, next) => {
	try {
		const blogId = req.params.id;

		if (!isValidObjectId(blogId)) {
			return res
				.status(400)
				.json({ status: false, error: "Invalid blog id" });
		}

		const blog = await Blog.findById(blogId);
		if (!blog)
			return res
				.status(404)
				.json({ status: false, error: "Blog not found" });
		if (!blog.author.equals(req.user.id)) {
			return res
				.status(403)
				.json({
					status: false,
					error: "This blog doesn't belong to you. You can only update your blog.",
				});
		}

		await Blog.findByIdAndDelete(blogId);
		res.status(200).json({
			status: true,
			message: "Blog deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getAllPublishedBlogs_get,
	getPublishedBlogById_get,
	createBlog_post,
	updateBlogToPublish_patch,
	editBlog_put,
	deleteBlog_delete,
	getUserBlogs_get,
};
