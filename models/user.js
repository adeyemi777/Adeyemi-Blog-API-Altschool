const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
	email: {
		type: String,
		required: [true, "Email is required!"],
		unique: true,
		validate: {
			validator: function (inputEmail) {
				return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
					inputEmail
				);
			},
			message: (props) => `${props.value} is not a valid email address!`,
		},
	},
	firstName: {
		type: String,
		required: [true, "Your first name is needed!"],
	},
	lastName: {
		type: String,
		required: [true, "Your last name is needed!"],
	},
	password: {
		type: String,
		required: [true, "Password is needed!"],
	},
});

UserSchema.pre("save", async function (next) {
	try {
		this.password = await bcrypt.hash(this.password, 10);
		next();
	} catch (error) {
		next(error);
	}
});

UserSchema.methods.isValidPassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
