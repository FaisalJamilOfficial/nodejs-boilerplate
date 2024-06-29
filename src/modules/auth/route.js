// module imports
import { Router } from "express";

// file imports
import * as authController from "./controller.js";
import * as userController from "../user/controller.js";
import { USER_TYPES } from "../../configs/enum.js";
import { exceptionHandler } from "../../middlewares/exception-handler.js";
import {
  verifyOTP,
  verifyKey,
  verifyToken,
  verifyUser,
  verifyUserToken,
} from "../../middlewares/authenticator.js";

// destructuring assignments
const { ADMIN, CUSTOMER } = USER_TYPES;

// variable initializations
const router = Router();

router.post(
  "/register/customer",
  exceptionHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const args = { email, password, name, type: CUSTOMER };
    const response = await authController.register(args);
    res.json({ token: response });
  })
);

router.post(
  "/login/customer",
  exceptionHandler(async (req, res) => {
    const { email, password } = req.body;
    const args = { email, password, type: CUSTOMER };
    const response = await authController.login(args);
    res.json({ token: response });
  })
);

router.post(
  "/logout",
  verifyToken,
  verifyUser,
  exceptionHandler(async (req, res) => {
    const { _id: user } = req.user;
    const { device } = req.body;
    const args = { user, device, shallRemoveFCM: true };
    await userController.updateUserById(user, args);
    res.json({ message: "Operation completed successfully!" });
  })
);

router
  .route("/password/email")
  .post(
    exceptionHandler(async (req, res) => {
      const { email } = req.body;
      const args = { email };
      await authController.emailResetPassword(args);
      res.json({ message: "Operation completed successfully!" });
    })
  )
  .put(
    exceptionHandler(async (req, res) => {
      const { password, user, token } = req.body;
      const args = { password, user, token };
      await authController.resetPassword(args);
      res.json({ message: "Operation completed successfully!" });
    })
  );

router.post(
  "/login/phone",
  verifyToken,
  verifyOTP,
  verifyUserToken,
  exceptionHandler(async (req, res) => {
    const { _id: user } = req.user;
    const args = { user };
    const response = await userController.getUser(args);
    res.json({ token: response.getSignedjwtToken() });
  })
);

router.post(
  "/login/google",
  exceptionHandler(async (req, res) => {
    const { googleId } = req.body;
    const args = { googleId };
    const response = await userController.getUser(args);
    res.json({ token: response.getSignedjwtToken() });
  })
);

router.post(
  "/login/facebook",
  exceptionHandler(async (req, res) => {
    const { facebookId } = req.body;
    const args = { facebookId };
    const response = await userController.getUser(args);
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
  verifyKey,
  exceptionHandler(async (req, res) => {
    const { email, password, type } = req.body;
    const args = { email, password, type: type ?? ADMIN, name: type };
    const response = await authController.register(args);
    res.json({ token: response });
  })
);

export default router;
