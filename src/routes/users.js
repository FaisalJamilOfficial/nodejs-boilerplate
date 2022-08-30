const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const notificationsController = require("../controllers/notifications");
const usersController = require("../controllers/users");
const {
	verifyOTP,
	verifyToken,
	verifyUser,
	verifyAdmin,
	verifyUserToken,
} = require("../middlewares/authenticator");
const TwilioManager = require("../utils/TwilioManager");
const { uploadTemporary } = require("../middlewares/uploader");
const { resizeImages } = require("../middlewares/imageResizer");
const { OTP_TYPES, USER_TYPES } = require("../configs/enums");
const { LOGIN } = OTP_TYPES;
const { ADMIN } = USER_TYPES;

router
	.route("/")
	.post(
		(req, res, next) => verifyToken(req, res, next, true),
		async (req, res, next) => {
			try {
				const isAdmin = req?.user?.type === ADMIN ? true : false;
				const arguments = {
					...req.body,
					isAdmin,
				};
				const response = await authController.signup(arguments);
				res.json(response);
			} catch (error) {
				next(error);
			}
		}
	)
	.put(
		verifyToken,
		verifyUser,
		uploadTemporary.fields([{ name: "images", maxCount: 1 }]),
		resizeImages,
		async (req, res, next) => {
			try {
				const { _id, type } = req?.user;
				const { user } = req.body;
				const { images } = req.files || {};
				const isAdmin = type === ADMIN ? true : false;
				const user_id = isAdmin ? user : _id;
				const arguments = {
					...req.body,
					user: user_id,
					images,
					isAdmin,
				};
				const response = await usersController.updateUser(arguments);
				res.json(response);
			} catch (error) {
				next(error);
			}
		}
	)
	.get(verifyToken, verifyAdmin, async (req, res, next) => {
		try {
			const { _id: user } = req?.user;
			const { page, limit } = req.query;
			const arguments = {
				...req.query,
				user,
				limit: Number(limit),
				page: Number(page),
			};
			const response = await usersController.getUsers(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.delete(verifyToken, verifyAdmin, async (req, res, next) => {
		try {
			const { _id } = req?.user;
			const { user } = req.query;
			const arguments = { user };
			const response = await usersController.deleteUser(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});

router
	.route("/login")
	.post(async (req, res, next) => {
		try {
			const arguments = { ...req.body };
			const response = await authController.login(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(verifyToken, verifyOTP, verifyUserToken, async (req, res, next) => {
		try {
			const { _id: user } = req?.user;
			const arguments = { user };
			const response = await usersController.getUser(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});
router.put(
	"/phone",
	verifyToken,
	verifyOTP,
	verifyUserToken,
	async (req, res, next) => {
		try {
			const { _id: user, phone } = req?.user;
			const arguments = { user, phone };
			const response = await usersController.updateUser(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);
router.put("/password", verifyToken, verifyUser, async (req, res, next) => {
	try {
		const { _id: user, email, type } = req?.user;
		const arguments = { ...req.body, email, user, type };
		await authController.login(arguments);
		arguments.password = arguments.newPassword;
		const response = await usersController.updateUser(arguments);
		res.json(response);
	} catch (error) {
		next(error);
	}
});

router
	.route("/otp")
	.post(verifyToken, verifyUser, async (req, res, next) => {
		try {
			const { _id: user } = req?.user;
			const arguments = { ...req.body, user };
			const response = await new TwilioManager().sendOTP(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(async (req, res, next) => {
		try {
			const { type } = req.query;

			let userExists;
			const arguments = { ...req.body };
			if (type === LOGIN) {
				const userResponse = await authController.getUserByPhone(arguments);
				userExists = userResponse?.user;
			}
			arguments.user = userExists?._id;
			const response = await new TwilioManager().sendOTP(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});

router
	.route("/password/email")
	.post(async (req, res, next) => {
		try {
			const arguments = { ...req.body };
			const response = await authController.emailResetPassword(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(async (req, res, next) => {
		try {
			const { password, user, token } = req.body;
			const arguments = { password, user, token };
			const response = await authController.resetPassword(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});

router.get(
	"/notifications",
	verifyToken,
	verifyUser,
	async (req, res, next) => {
		try {
			const { _id, type } = req?.user;
			let { q, page, limit } = req.query;
			const isAdmin = type === ADMIN ? true : false;
			const user_id = isAdmin ? user : _id;
			const arguments = {
				user: user_id,
				type,
				q,
				limit: Number(limit),
				page: Number(page),
			};
			const response = await notificationsController.getAllNotifications(
				arguments
			);
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);

router.post("/super-admin", async (req, res, next) => {
	try {
		const arguments = {
			...req.body,
		};
		const response = await authController.addSuperAdmin(arguments);
		res.json(response);
	} catch (error) {
		next(error);
	}
});

router.get("/:user", verifyToken, verifyUser, async (req, res, next) => {
	try {
		const { _id } = req?.user;
		const { user } = req.params;
		const user_id = req?.user?.type === ADMIN ? user : _id;
		const arguments = { user: user_id };
		const response = await usersController.getUser(arguments);
		res.json(response);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
