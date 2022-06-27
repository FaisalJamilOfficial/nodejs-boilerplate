const express = require("express");
const passport = require("passport");
const router = express.Router();

const usersController = require("../controllers/users");
const notificationsController = require("../controllers/notifications");
const {
	verifyOTP,
	verifyToken,
	verifyUser,
	verifyAdmin,
	alterLogin,
	verifyUserToken,
	checkUserPhoneExists,
} = require("../middlewares/authenticator");
const TwilioManager = require("../utils/TwilioManager");
const { uploadTemporary } = require("../middlewares/uploader");
const { resizeProfilePicture } = require("../middlewares/imageResizer");

router
	.route("/")
	.post(async (req, res, next) => {
		try {
			const { username, email, password, phone, type } = req.body;
			const arguments = {
				username,
				email,
				password,
				phone,
				type: type ?? "user",
				isPasswordSet: req?.user?.type === "admin" ? false : true,
			};
			const response = await usersController.signup(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(
		verifyToken,
		verifyUser,
		uploadTemporary.fields([{ name: "picture", maxCount: 1 }]),
		resizeProfilePicture,
		async (req, res, next) => {
			try {
				const { _id, profilePicture } = req?.user;
				const { picture } = req.files || {};
				const {
					user,
					phone,
					status,
					fcm,
					device,
					email,
					newPassword,
					firstname,
					lastname,
					birthdate,
					longitude,
					latitude,
					address,
					removePicture,
				} = req.body;
				const user_id = req?.user?.type === "admin" ? user : _id;
				const arguments = {
					user: user_id,
					phone,
					status,
					fcm,
					device,
					email,
					newPassword,
					firstname,
					lastname,
					birthdate,
					longitude,
					latitude,
					address,
					profilePicture,
					removePicture,
					picture,
					isAdminAction: user ? true : false,
				};
				const response = await usersController.editUserProfile(arguments);
				res.json(response);
			} catch (error) {
				next(error);
			}
		}
	)
	.get(verifyToken, verifyAdmin, async (req, res, next) => {
		try {
			const { _id: user } = req?.user;
			const { q, page, limit, status, type } = req.query;
			const arguments = {
				user,
				q,
				limit: Number(limit),
				page: Number(page),
				status,
				type,
			};
			const response = await usersController.getAllUsers(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});

router
	.route("/login")
	.post(alterLogin, passport.authenticate("local"), async (req, res, next) => {
		try {
			const { _id: user, phone } = req?.user;
			const arguments = { user, phone };
			const response = await usersController.login(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(verifyToken, verifyOTP, checkUserPhoneExists, async (req, res, next) => {
		try {
			const { _id: user, phone } = req?.user;
			const arguments = { user, phone };
			const response = await usersController.login(arguments);
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
			const { _id: user } = req?.user;
			const { phone } = req.body;
			const arguments = { user, phone };
			const response = await usersController.editUserProfile(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);
router.put(
	"/password",
	alterLogin,
	passport.authenticate("local"),
	async (req, res, next) => {
		try {
			const { _id: user } = req?.user;
			const { newPassword } = req.body;
			const arguments = { user, newPassword };
			const response = await usersController.editUserProfile(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);

router
	.route("/otp")
	.post(verifyToken, verifyUser, async (req, res, next) => {
		try {
			const { _id: user } = req?.user;
			const { phone } = req.body;
			const arguments = { phone, user };
			const response = await new TwilioManager().sendOTP(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(async (req, res, next) => {
		try {
			const { phone } = req.body;
			const arguments = { phone };
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
			const { email } = req.body;
			const arguments = { email };
			const response = await usersController.emailResetPassword(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(async (req, res, next) => {
		try {
			const { password, user, token } = req.body;
			const arguments = { password, user, token };
			const response = await usersController.resetPassword(arguments);
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
			const user_id = req?.user?.type === "admin" ? user : _id;
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

router.get("/:user", verifyToken, verifyUser, async (req, res, next) => {
	try {
		const { _id } = req?.user;
		const { user } = req.params;
		const user_id = req?.user?.type === "admin" ? user : _id;
		const arguments = { user: user_id };
		const response = await usersController.getUser(arguments);
		res.json(response);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
