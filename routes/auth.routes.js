const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");

const router = express.Router();

router.post(
	"/signup",
	passport.authenticate("signup", { session: false }),
	authController.signup_post
);

router.post("/login", async (req, res, next) => {
	passport.authenticate("login", (error, user, info) => {
		try {
			authController.login_post(error, req, res, next, user, info);
		} catch (error) {
			next(error);
		}
	})(req, res, next);
});

module.exports = router;
