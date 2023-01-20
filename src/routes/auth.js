const express = require("express");
const router = express.Router();
const { SECRET } = process.env;

const authController = require("../controllers/auth");
const usersController = require("../controllers/users");
const { USER_TYPES } = require("../configs/enums");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { ADMIN } = USER_TYPES;

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const args = {
      email,
      password,
      name,
    };
    const response = await authController.register(args);
    res.json(response);
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const args = {
      email,
      password,
    };
    const response = await authController.login(args);
    res.json(response);
  })
);

router.post(
  "/login/google",
  asyncHandler(async (req, res) => {
    const { googleID } = req.body;
    const args = {
      googleID,
    };
    const response = await usersController.getUser(args);
    res.json(response);
  })
);

router.post(
  "/login/facebook",
  asyncHandler(async (req, res) => {
    const { facebookID } = req.body;
    const args = {
      facebookID,
    };
    const response = await usersController.getUser(args);
    res.json(response);
  })
);

router.post(
  "/login/twitter",
  asyncHandler(async (req, res) => {
    const { twitterID } = req.body;
    const args = {
      twitterID,
    };
    const response = await usersController.getUser(args);
    res.json(response);
  })
);

router.post(
  "/login/admin",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const args = {
      email,
      password,
      type: ADMIN,
    };
    const response = await authController.login(args);
    res.json(response);
  })
);

router.post(
  "/register/admin",
  asyncHandler(async (req, res) => {
    const { secret } = req.headers;
    const { email, password, type } = req.body;
    const args = {
      email,
      password,
      type,
      name: type,
    };
    if (secret === SECRET);
    else throw new Error(`Invalid SECRET!`);
    const response = await authController.addAdmin(args);
    res.json(response);
  })
);

module.exports = router;
