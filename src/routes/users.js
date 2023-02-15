// module imports
import express from "express";

// file imports
import * as authController from "../controllers/auth.js";
import * as notificationsController from "../controllers/notifications.js";
import * as usersController from "../controllers/users.js";
import TwilioManager from "../utils/twilio-manager.js";
import { uploadTemporary } from "../middlewares/uploader.js";
import { resizeImages } from "../middlewares/image-resizer.js";
import { OTP_TYPES } from "../configs/enums.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  verifyOTP,
  verifyToken,
  verifyUser,
  verifyAdmin,
  verifyUserToken,
} from "../middlewares/authenticator.js";

// destructuring assignments
const { LOGIN } = OTP_TYPES;

// variable initializations
const router = express.Router();

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

export default router;
