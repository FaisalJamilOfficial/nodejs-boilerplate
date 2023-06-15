// module imports
import express from "express";

// file imports
import * as authController from "../controllers/auth.js";
import * as notificationsController from "../controllers/notifications.js";
import * as usersController from "../controllers/users.js";
import TwilioManager from "../utils/twilio-manager.js";
import directories from "../configs/directories.js";
import { upload } from "../middlewares/uploader.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  verifyOTP,
  verifyToken,
  verifyUser,
  verifyAdmin,
  verifyUserToken,
} from "../middlewares/authenticator.js";

// destructuring assignments
const { IMAGES_DIRECTORY } = directories;

// variable initializations
const router = express.Router();

router
  .route("/")
  .all(verifyToken, verifyAdmin)
  .post(
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
    upload(IMAGES_DIRECTORY).single("image"),
    asyncHandler(async (req, res) => {
      const image = req.file || {};
      const { _id: user } = req?.user;
      const { firstName, lastName } = req.body;
      const args = {
        user,
        firstName,
        lastName,
        //   image: image?.key,
        image: image?.filename,
      };
      const response = await usersController.updateUser(args);
      res.json(response);
    })
  )
  .get(
    asyncHandler(async (req, res) => {
      const { _id: user } = req?.user;
      const { page, limit, keyword } = req.query;
      const args = {
        user,
        keyword,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await usersController.getUsers(args);
      res.json(response);
    })
  )
  .delete(
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
      const args = { user, phone };
      const response = await new TwilioManager().sendOTP(args);
      res.json(response);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      const { phone } = req.body;
      const args = { phone };
      const { user } = await usersController.getUser(args);
      args.user = user;
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

router
  .route("/notifications")
  .all(verifyToken, verifyUser)
  .get(
    asyncHandler(async (req, res) => {
      const { _id: user } = req?.user;
      const { page, limit } = req.query;
      const args = {
        user,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await notificationsController.getNotifications(args);
      res.json(response);
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { _id: user } = req?.user;
      const args = {
        user,
      };
      const response = await notificationsController.readNotifications(args);
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
