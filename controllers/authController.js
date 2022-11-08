const jwt = require("jsonwebtoken");
const userModel= require("../models/user") 
require("dotenv").config();

const signup_post = async (req, res, next) => {
	try {
		const user = await userModel.create(req.body);
    user.password = undefined;
    const payload = { user };
  console.log(payload);
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
    return res.status(201).json({
      status: "success",
      token,
      data: {
        user,
      },
    });

	
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
