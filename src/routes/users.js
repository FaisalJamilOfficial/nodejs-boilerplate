const express = require("express");
const router = express.Router();
const { SECRET } = process.env;

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
const { asyncHandler } = require("../middlewares/asyncHandler");
const { LOGIN } = OTP_TYPES;
const { ADMIN } = USER_TYPES;

router
  .route("/")
  .post(
    (req, res, next) => verifyToken(req, res, next, true),
    asyncHandler(async (req, res) => {
      const isAdmin = req?.user?.type === ADMIN;
      const args = {
        ...req.body,
        isAdmin,
      };
      const response = await authController.register(args);
      res.json(response);
    })
  )
  .put(
    verifyToken,
    verifyUser,
    uploadTemporary.fields([{ name: "images", maxCount: 1 }]),
    resizeImages,
    asyncHandler(async (req, res) => {
      const { _id, type } = req?.user;
      const { user } = req.body;
      const { images } = req.files || {};
      const isAdmin = type === ADMIN;
      const userID = isAdmin ? user : _id;
      const args = {
        ...req.body,
        user: userID,
        images,
        isAdmin,
      };
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
        ...req.query,
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
      const { _id, type } = req?.user;
      const { user } = req.query;
      const isAdmin = type === ADMIN;
      const userID = isAdmin ? user : _id;
      const args = { user: userID };
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
    const args = { ...req.body, email, user, type };
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
      const args = { ...req.body, user };
      const response = await new TwilioManager().sendOTP(args);
      res.json(response);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      const { type } = req.query;
      let userExists;
      const args = { ...req.body };
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
      const args = { ...req.body };
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
    const { _id, type } = req?.user;
    const { user, q, page, limit } = req.query;
    const isAdmin = type === ADMIN;
    const userID = isAdmin ? user : _id;
    const args = {
      user: userID,
      type,
      q,
      limit: Number(limit),
      page: Number(page),
    };
    const response = await notificationsController.getAllNotifications(args);
    res.json(response);
  })
);

router.get(
  "/:user",
  verifyToken,
  verifyUser,
  asyncHandler(async (req, res) => {
    const { _id } = req?.user;
    const { user } = req.params;
    const userID = req?.user?.type === ADMIN ? user : _id;
    const args = { user: userID };
    const response = await usersController.getUser(args);
    res.json(response);
  })
);

module.exports = router;
