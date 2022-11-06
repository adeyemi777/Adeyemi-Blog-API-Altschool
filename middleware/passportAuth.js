const passport = require("passport");
const User = require("../models/user");
const localStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config();

passport.use(
	"signup",
	new localStrategy(
		{
			usernameField: "email",
			passwordField: "password",
			passReqToCallback: true,
		},
		async (req, email, password, done) => {
			try {
				const { firstName, lastName } = req.body;
				const exists = await User.findOne({ email });
				if (exists) {
					return done(null, false, {
						message: "This user already exists, try another one",
					});
				}
				const user = await User.create({
					firstName,
					lastName,
					email,
					password,
				});
				return done(null, user);
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	"login",
	new localStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email });

				if (!user) {
					return done(null, false, { message: "This user not found" });
				}

				if (!(await user.isValidPassword(password))) {
					return done(null, false, {
						message: "Wrong Password",
					});
				}

				done(null, user, { message: "Welcome Back" });
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	new JWTStrategy(
		{
			secretOrKey: process.env.AUTH_SECRET,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		},
		async (token, done) => {
			try {
				return done(null, token.user);
			} catch (error) {
				done(error);
			}
		}
	)
);
