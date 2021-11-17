const jwt = require("jsonwebtoken");
const config = require("../../services/config");

var { usersModel } = require("../../models");

const jwtStrategy = async (jwt_payload) => {
	if (jwt_payload.otpValidation) {
		return jwt_payload;
	} else
		try {
			const user = await usersModel.findOne({ _id: jwt_payload._id });
			if (user?.status === "deleted") throw new Error("Unauthorized");
			else return user;
		} catch (error) {
			throw error;
		}
};

exports.getToken = function (user) {
	return jwt.sign(user, config.SECRET_KEY);
};

exports.verifyToken = async (req, res, next) => {
	try {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(" ")[1];
			if (token) {
				const verificationObject = jwt.verify(token, config.SECRET_KEY);
				if (verificationObject) {
					const exists = await jwtStrategy(verificationObject);
					if (exists) {
						req.user = exists;
						next();
					} else next(new Error("Token verification failed!"));
				} else next(new Error("Malformed JWT!"));
			} else next(new Error("Invalid JWT!"));
		} else next(new Error("Unauthorized!"));
	} catch (error) {
		next(error);
	}
};

exports.verifyAdmin = (req, res, next) => {
	if (req.user.type === "admin") {
		next();
	} else {
		const error = new Error("You are not authorized as admin!");
		error.status = 403;
		return next(error);
	}
};
