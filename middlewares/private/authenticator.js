exports.verifyAdmin = (req, res, next) => {
	if (req.user.type === "admin") {
		next();
	} else {
		const error = new Error("You are not authorized as admin!");
		error.status = 403;
		return next(error);
	}
};
