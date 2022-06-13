exports.verifyUserType = (req, res, next) => {
	if (req.user.type === "user_type") {
		next();
	} else {
		const error = new Error("You are not authorized as user_type!");
		error.status = 403;
		return next(error);
	}
};
