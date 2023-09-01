// module imports
import express from "express";

// file imports
import * as authController from "../controllers/auth.js";
import * as usersController from "../controllers/users.js";
import { USER_TYPES } from "../configs/enums.js";
import { exceptionHandler } from "../middlewares/exception-handler.js";
import { verifyOTP, verifyToken } from "../middlewares/authenticator.js";

// destructuring assignments
const { ADMIN } = USER_TYPES;
const { SECRET } = process.env;

// variable initializations
const router = express.Router();

router.post(
  "/register",
  exceptionHandler(async (req, res) => {
    const { email, password, name, type } = req.body;
    const args = { email, password, name, type };
    const response = await authController.register(args);
    res.json({ token: response });
  })
);

router.post(
  "/login",
  exceptionHandler(async (req, res) => {
    const { type } = req.query;
    const { email, password } = req.body;
    const args = { email, password, type };
    const response = await authController.login(args);
    res.json({ token: response });
  })
);

router
  .route("/password/email")
  .post(
    exceptionHandler(async (req, res) => {
      const { email } = req.body;
      const args = { email };
      await authController.emailResetPassword(args);
      res.json({ message: "Password reset link sent to your email address!" });
    })
  )
  .put(
    exceptionHandler(async (req, res) => {
      const { password, user, token } = req.body;
      const args = { password, user, token };
      await authController.resetPassword(args);
      res.json({ message: "Password reset successfully!" });
    })
  );

router.post(
  "/login/phone",
  verifyToken,
  verifyOTP,
  exceptionHandler(async (req, res) => {
    const { phone } = req?.user;
    const args = { phone };
    const response = await usersController.getUser(args);
    res.json({ token: response.getSignedjwtToken() });
  })
);

router.post(
  "/login/google",
  exceptionHandler(async (req, res) => {
    const { googleId } = req.body;
    const args = { googleId };
    const response = await usersController.getUser(args);
    res.json({ token: response.getSignedjwtToken() });
  })
);

router.post(
  "/login/facebook",
  exceptionHandler(async (req, res) => {
    const { facebookId } = req.body;
    const args = { facebookId };
    const response = await usersController.getUser(args);
    res.json({ token: response.getSignedjwtToken() });
  })
);

router.post(
  "/login/twitter",
  exceptionHandler(async (req, res) => {
    const { twitterId } = req.body;
    const args = { twitterId };
    const response = await usersController.getUser(args);
    res.json({ token: response.getSignedjwtToken() });
  })
);

router.post(
  "/login/admin",
  exceptionHandler(async (req, res) => {
    const { email, password } = req.body;
    const args = { email, password, type: ADMIN };
    const response = await authController.login(args);
    res.json({ token: response });
  })
);

router.post(
  "/register/admin",
  exceptionHandler(async (req, res) => {
    const { secret } = req.headers;
    const { email, password, type } = req.body;
    const args = {
      email,
      password,
      type: type ?? ADMIN,
      name: type,
    };
    if (secret === SECRET);
    else throw new Error("Invalid SECRET!|||400");
    const response = await authController.addAdmin(args);
    res.json({ token: response });
  })
);

export default router;
