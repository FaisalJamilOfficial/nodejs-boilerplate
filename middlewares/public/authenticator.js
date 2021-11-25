const jwt = require("jsonwebtoken");
const passport = require("passport");
const localstrategy = require("passport-local");
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwtStrategy = require("passport-jwt").Strategy;
const { SECRET_KEY } = process.env;

const { usersModel } = require("../../models");

exports.local = passport.use(new localstrategy(usersModel.authenticate()));
passport.serializeUser(usersModel.serializeUser());
passport.deserializeUser(usersModel.deserializeUser());

exports.getToken = function (user) {
	return jwt.sign(user, SECRET_KEY);
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY;

exports.jwtpassport = passport.use(
	new jwtStrategy(opts, (jwt_payload, done) => {
		if (jwt_payload.otpValidation) {
			return done(null, jwt_payload);
		} else
			usersModel.findOne({ _id: jwt_payload._id }, (err, user) => {
				if (err) {
					return done(err, false);
				} else if (user.status == "deleted") {
					err = new Error("Unauthorized");
					return done(err, false);
				} else if (user) {
					return done(null, user);
				} else {
					return done(null, false);
				}
			});
	})
);

exports.verifyToken = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
	if (req.user.type === "admin") {
		next();
	} else {
		const error = new Error("You are not authorized as admin!");
		error.status = 403;
		return next(error);
	}
};
