const jwt = require("jsonwebtoken");
const userModel= require("../models/user") 
require("dotenv").config();

const signup_post = async (req, res, next) => {
	try {
		res.status(201).json({ message: "Signup Complete", user: req.user });
	} catch (error) {
		console.log(error);
		next(error);
	}
};

const login_post = (error, req, res, next, user, info) => {
	try {
		if (error || !user) {
			const error = info ? info : "Error: Logging in incomplete";
			return res.status(400).json({ status: false, error });
		}
		const signedUser = { id: user._id, email: user.email };
		const token = jwt.sign({ user: signedUser }, process.env.AUTH_SECRET, {
			expiresIn: "1h",
		});
		res.json({ message: "Logged In Successfully", token });
	} catch (error) {
		console.log(error);
		next(error);
	}
};

module.exports = {
	signup_post,
	login_post,
};
