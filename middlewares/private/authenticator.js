exports.verifyLeader = (req, res, next) => {
	if (req.user.type === "leader") {
		next();
	} else {
		const error = new Error("You are not authorized as leader!");
		error.status = 403;
		return next(error);
	}
};
exports.verifyInvestor = (req, res, next) => {
	if (req.user.type === "investor") {
		next();
	} else {
		const error = new Error("You are not authorized as investor!");
		error.status = 403;
		return next(error);
	}
};
exports.verifyProjectHolder = (req, res, next) => {
	if (req.user.type === "project-holder") {
		next();
	} else {
		const error = new Error("You are not authorized as project holder!");
		error.status = 403;
		return next(error);
	}
};
