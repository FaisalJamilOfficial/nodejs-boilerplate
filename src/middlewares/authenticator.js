const jwt = require("jsonwebtoken");
const passport = require("passport");
const localstrategy = require("passport-local");
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwtStrategy = require("passport-jwt").Strategy;
const { SECRET_KEY } = process.env;

const { usersModel } = require("../models");

const { USER_STATUSES } = require("../configs/enums");
const { ACTIVE, DELETED } = USER_STATUSES;
const { ADMIN } = USER_STATUSES;

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
				} else if (user?.status === DELETED) {
					err = new Error("Account deleted!");
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

exports.verifyOTP = async (req, res, next) => {
	try {
		const { otp, phone } = req?.user;
		const { code } = req.body;
		if (Number(code) === Number(otp)) {
			if (phone) req.body.phone = phone;
			next();
		} else {
			err = new Error("Invalid Code!");
			err.status = 400;
			return next(err);
		}
	} catch (error) {
		return next(error);
	}
};

exports.verifyAdmin = (req, res, next) => {
	if (req?.user?.type === ADMIN && req?.user?.status === ACTIVE) {
		next();
	} else {
		const error = new Error("You are not authorized as admin!");
		error.status = 403;
		return next(error);
	}
};

exports.verifyUser = (req, res, next) => {
	if (req?.user && req?.user?.status === ACTIVE) {
		next();
	} else {
		const error = new Error("You are not authorized as user!");
		error.status = 403;
		return next(error);
	}
};

exports.alterLogin = (req, res, next) => {
	const { email } = req.body;
	if (email) req.body.username = email;
	next();
};

exports.verifyUserToken = async (req, res, next) => {
	try {
		if (req?.user?._id) {
			next();
		} else {
			const error = new Error("You are not authorized as existing user!");
			error.status = 403;
			return next(error);
		}
	} catch (error) {
		next(error);
	}
};

exports.checkUserPhoneExists = async (req, res, next) => {
	try {
		const userExists = await usersModel.exists({ phone: req.body.phone });
		if (userExists) {
			next();
		} else next(new Error("User does not exist!"));
	} catch (error) {
		next(error);
	}
};
