const mongoose = require("mongoose");
const {
	calculateReadingTimeInString,
	calculateReadingTimeInNumber,
} = require("../utils");
const Schema = mongoose.Schema;

const blogStates = {
	draft: "draft",
	published: "published",
};

const BlogSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, "Blog title: This is required!"],
			unique: true,
		},
		description: String,
		body: {
			type: String,
			required: [true, "Blog body: This is required!"],
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		state: {
			type: String,
			required: [true, "Blog state can't be empty!"],
			default: "draft",
			enum: Object.values(blogStates),
			lowercase: true,
		},
		read_count: {
			type: Number,
			default: 0,
		},
		reading_time: {
			inNumber: Number,
			inString: String,
		},
		tags: {
			type: [String],
			lowercase: true,
		},
	},
	{ timestamps: true }
);

BlogSchema.pre("save", function (next) {
	this.reading_time.inString = calculateReadingTimeInString(
		this.title,
		this.body
	);
	this.reading_time.inNumber = calculateReadingTimeInNumber(
		this.title,
		this.body
	).toFixed(2);

	next();
});

BlogSchema.methods = {
	updateOneReadCount: async function () {
		this.read_count++;
		await this.save();
	},
	cleanAndSaveTags: async function (tags) {
		this.tags = tags
			.trim("")
			.split(",")
			.filter((tag) => tag !== "");
		await this.save();
	},
};

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = {
	Blog,
	blogStates,
};
