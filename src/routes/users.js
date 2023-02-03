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
const { OTP_TYPES } = require("../configs/enums");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { LOGIN } = OTP_TYPES;

router
  .route("/")
  .post(
    verifyToken,
    verifyAdmin,
    asyncHandler(async (req, res) => {
      const { email, password, phone, type } = req.body;
      const args = {
        email,
        password,
        phone,
        type,
      };
      const response = await authController.register(args);
      res.json(response);
    })
  )
  .put(
    verifyToken,
    verifyAdmin,
    uploadTemporary.fields([{ name: "images", maxCount: 1 }]),
    resizeImages,
    asyncHandler(async (req, res) => {
      const { _id: user } = req?.user;
      const { firstName, lastName } = req.body;
      const { images } = req.files || {};
      const args = { user, firstName, lastName, images };
      const response = await usersController.updateUser(args);
      res.json(response);
    })
  )
  .get(
    verifyToken,
    verifyAdmin,
    asyncHandler(async (req, res) => {
      const { _id: user } = req?.user;
      const { page, limit } = req.query;
      const args = {
        user,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await usersController.getUsers(args);
      res.json(response);
    })
  )
  .delete(
    verifyToken,
    verifyAdmin,
    asyncHandler(async (req, res) => {
      const { user } = req.query;
      const args = { user };
      const response = await usersController.deleteUser(args);
      res.json(response);
    })
  );

router.put(
  "/phone",
  verifyToken,
  verifyOTP,
  verifyUserToken,
  asyncHandler(async (req, res) => {
    const { _id: user, phone } = req?.user;
    const args = { user, phone };
    const response = await usersController.updateUser(args);
    res.json(response);
  })
);
router.put(
  "/password",
  verifyToken,
  verifyUser,
  asyncHandler(async (req, res) => {
    const { _id: user, email, type } = req?.user;
    const { password, newPassword } = req.body;
    const args = { password, newPassword, email, user, type };
    await authController.login(args);
    args.password = args.newPassword;
    const response = await usersController.updateUser(args);
    res.json(response);
  })
);

router
  .route("/otp")
  .post(
    verifyToken,
    verifyUser,
    asyncHandler(async (req, res) => {
      const { _id: user } = req?.user;
      const { phone } = req.body;
      const args = { user };
      if (phone) args.phone = phone;
      else throw new Error("Please enter phone number!|||400");
      const response = await new TwilioManager().sendOTP(args);
      res.json(response);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      const { type } = req.query;
      const { phone } = req.body;
      let userExists;
      const args = {};
      if (phone) args.phone = phone;
      else throw new Error("Please enter phone number!|||400");

      if (type === LOGIN) {
        const userResponse = await usersController.getUser(args);
        userExists = userResponse?.user;
      }
      args.user = userExists?._id;
      const response = await new TwilioManager().sendOTP(args);
      res.json(response);
    })
  );

router
  .route("/password/email")
  .post(
    asyncHandler(async (req, res) => {
      const { email } = req.body;
      const args = { email };
      const response = await authController.emailResetPassword(args);
      res.json(response);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      const { password, user, token } = req.body;
      const args = { password, user, token };
      const response = await authController.resetPassword(args);
      res.json(response);
    })
  );

router.get(
  "/notifications",
  verifyToken,
  verifyUser,
  asyncHandler(async (req, res) => {
    const { _id: user } = req?.user;
    const { q, page, limit } = req.query;
    const args = {
      user,
      q,
      limit: Number(limit),
      page: Number(page),
    };
    const response = await notificationsController.getAllNotifications(args);
    res.json(response);
  })
);

router.get(
  "/me",
  verifyToken,
  verifyUser,
  asyncHandler(async (req, res) => {
    const response = { success: true, data: req?.user };
    res.json(response);
  })
);

router.get(
  "/:user",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { user } = req.params;
    const args = { user };
    const response = await usersController.getUser(args);
    res.json(response);
  })
);

module.exports = router;
